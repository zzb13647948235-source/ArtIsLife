import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Init Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: 'artislife-7384f',
      clientEmail: 'firebase-adminsdk-fbsvc@artislife-7384f.iam.gserviceaccount.com',
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    }),
  });
}

const db = getFirestore();
const adminAuth = getAuth();
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── UGC API ──────────────────────────────────────────────────────────────────

// GET /api/firebase/ugc?action=list
app.get('/api/firebase/ugc', async (req, res) => {
  try {
    const snapshot = await db.collection('ugc').orderBy('timestamp', 'desc').get();
    const posts = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().timestamp?.toMillis?.() || Date.now(),
    }));
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/firebase/ugc?action=create|like|comment
app.post('/api/firebase/ugc', async (req, res) => {
  const { action } = req.query;
  try {
    if (action === 'create') {
      const post = req.body;
      const docRef = await db.collection('ugc').add({
        ...post,
        likedByIds: [],
        comments: [],
        timestamp: FieldValue.serverTimestamp(),
        viewCount: 0,
      });
      return res.json({ id: docRef.id });
    }
    if (action === 'like') {
      const { postId, userId } = req.body;
      const ref = db.collection('ugc').doc(postId);
      const doc = await ref.get();
      const liked = doc.data()?.likedByIds || [];
      if (liked.includes(userId)) {
        await ref.update({ likedByIds: FieldValue.arrayRemove(userId) });
      } else {
        await ref.update({ likedByIds: FieldValue.arrayUnion(userId) });
      }
      return res.json({ ok: true });
    }
    if (action === 'comment') {
      const { postId, comment } = req.body;
      const newComment = {
        ...comment,
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
      };
      await db.collection('ugc').doc(postId).update({
        comments: FieldValue.arrayUnion(newComment),
      });
      return res.json({ ok: true, comment: newComment });
    }
    res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/firebase/ugc?action=delete
app.delete('/api/firebase/ugc', async (req, res) => {
  try {
    const { postId, userId } = req.body;
    const doc = await db.collection('ugc').doc(postId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    if (doc.data()?.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });
    await db.collection('ugc').doc(postId).delete();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Auth API ─────────────────────────────────────────────────────────────────

app.post('/api/firebase/auth', async (req, res) => {
  const { action } = req.query;
  try {
    if (action === 'register') {
      const { name, email, password } = req.body;
      const cred = await adminAuth.createUser({ email, password, displayName: name });
      const newUser = {
        id: cred.uid, name, email,
        tier: 'guest', joinedAt: Date.now(),
        balance: 1000, inventoryIds: [], likedItemIds: [],
      };
      await db.collection('users').doc(cred.uid).set(newUser);
      const customToken = await adminAuth.createCustomToken(cred.uid);
      return res.json({ user: newUser, customToken });
    }
    if (action === 'getUser') {
      const { uid } = req.body;
      const doc = await db.collection('users').doc(uid).get();
      if (!doc.exists) return res.status(404).json({ error: 'User not found' });
      return res.json({ id: uid, ...doc.data() });
    }
    if (action === 'updateAvatar') {
      const { userId, avatar } = req.body;
      await db.collection('users').doc(userId).update({ avatar });
      const doc = await db.collection('users').doc(userId).get();
      return res.json({ id: userId, ...doc.data() });
    }
    if (action === 'upgradeTier') {
      const { userId, tier } = req.body;
      const bonus = tier === 'artist' ? 5000 : tier === 'patron' ? 20000 : 0;
      await db.collection('users').doc(userId).update({ tier, balance: FieldValue.increment(bonus) });
      const doc = await db.collection('users').doc(userId).get();
      return res.json({ id: userId, ...doc.data() });
    }
    if (action === 'purchaseItem') {
      const { userId, price, itemId } = req.body;
      const doc = await db.collection('users').doc(userId).get();
      const data = doc.data();
      if ((data.balance || 0) < price) return res.status(400).json({ error: '余额不足，请前往游戏赚取更多 ArtCoin' });
      if ((data.inventoryIds || []).includes(itemId)) return res.status(400).json({ error: '您已拥有此藏品' });
      await db.collection('users').doc(userId).update({
        balance: FieldValue.increment(-price),
        inventoryIds: FieldValue.arrayUnion(itemId),
      });
      const updated = await db.collection('users').doc(userId).get();
      return res.json({ id: userId, ...updated.data() });
    }
    res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── AI API ────────────────────────────────────────────────────────────────────

const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1';

function getSiliconFlowKey() {
  const key = process.env.SILICONFLOW_API_KEY;
  if (!key) throw new Error('SILICONFLOW_API_KEY not configured');
  return key;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, '').trim().slice(0, 2000);
}

function validatePrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') return { valid: false, error: '请输入有效的提示词' };
  const sanitized = sanitizeInput(prompt);
  if (sanitized.length < 2) return { valid: false, error: '提示词至少需要2个字符' };
  if (sanitized.length > 1000) return { valid: false, error: '提示词不能超过1000个字符' };
  return { valid: true, sanitized };
}

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, systemInstruction } = req.body || {};
    const validation = validatePrompt(message);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    const sysPrompt = systemInstruction || '你是一个专业的艺术顾问和油画鉴赏专家。请用优美、专业的中文回答用户关于艺术的问题。';
    const messages = [{ role: 'system', content: sysPrompt }];

    if (Array.isArray(history)) {
      history.slice(-20).forEach(h => {
        const role = h.role === 'model' ? 'assistant' : (h.role === 'user' ? 'user' : null);
        if (!role) return;
        const content = Array.isArray(h.parts) ? h.parts.map(p => (typeof p.text === 'string' ? sanitizeInput(p.text) : '')).join('') : '';
        if (content) messages.push({ role, content });
      });
    }

    const historyStart = messages.findIndex(m => m.role !== 'system');
    while (historyStart !== -1 && messages[historyStart]?.role !== 'user') messages.splice(historyStart, 1);
    messages.push({ role: 'user', content: validation.sanitized });

    const sfRes = await fetch(`${SILICONFLOW_API_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getSiliconFlowKey()}` },
      body: JSON.stringify({ model: 'Qwen/Qwen3-8B', messages, stream: false }),
    });
    if (!sfRes.ok) {
      const err = await sfRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || `SiliconFlow error ${sfRes.status}`);
    }
    const data = await sfRes.json();
    return res.json({ text: data?.choices?.[0]?.message?.content || '', links: [] });
  } catch (e) {
    const msg = e?.message || '';
    const isAuth = msg.includes('401') || msg.includes('Unauthorized') || msg.includes('API key');
    res.status(isAuth ? 403 : 500).json({ error: isAuth ? 'API 密钥已失效，请联系管理员更新密钥。' : '服务器内部错误，请稍后重试。' });
  }
});

// POST /api/generate-image
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    const validation = validatePrompt(prompt);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    const enhancedPrompt = `${validation.sanitized}，oil painting style, masterpiece, fine brushwork, rich colors, high quality art`;
    const sfRes = await fetch(`${SILICONFLOW_API_URL}/images/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getSiliconFlowKey()}` },
      body: JSON.stringify({ model: 'black-forest-labs/FLUX.1-schnell', prompt: enhancedPrompt, image_size: '1024x1024', num_inference_steps: 20 }),
    });
    if (!sfRes.ok) {
      const err = await sfRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || `图片生成失败 ${sfRes.status}`);
    }
    const data = await sfRes.json();
    const imageUrl = data?.images?.[0]?.url;
    if (!imageUrl) throw new Error('未返回有效图片');
    return res.json({ imageUrl });
  } catch (e) {
    const msg = e?.message || '';
    const isAuth = msg.includes('401') || msg.includes('Unauthorized') || msg.includes('API key');
    const isBad = msg.includes('400') || msg.includes('invalid');
    res.status(isAuth ? 403 : isBad ? 400 : 500).json({
      error: isAuth ? 'API 密钥已失效，请联系管理员更新密钥。' : isBad ? '提示词不符合要求，请修改后重试' : '图片生成服务暂时不可用，请稍后重试',
    });
  }
});

// POST /api/find-museums
app.post('/api/find-museums', async (req, res) => {
  try {
    const { query, location } = req.body || {};
    const validation = validatePrompt(query);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    let locationContext = '';
    let nearbyInfo = '';
    if (location && typeof location === 'object') {
      const lat = parseFloat(location.lat);
      const lng = parseFloat(location.lng);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        locationContext = ` 用户当前位置坐标为 (${lat}, ${lng})，请优先推荐附近的博物馆。`;
        const mapKey = process.env.AMAP_KEY;
        if (mapKey) {
          try {
            const mapRes = await fetch(`https://restapi.amap.com/v5/place/around?key=${mapKey}&location=${lng},${lat}&keywords=博物馆|美术馆&radius=5000&limit=5`);
            const mapData = await mapRes.json();
            if (mapData.status === '1' && mapData.pois?.length) {
              nearbyInfo = '\n\n附近真实博物馆（来自高德地图）：\n' + mapData.pois.map(p => `- ${p.name}（${p.address}）`).join('\n');
            }
          } catch {}
        }
      }
    }

    const messages = [
      { role: 'system', content: '你是一个专业的艺术博物馆顾问。请提供详细、准确的博物馆推荐信息，包括博物馆名称、地址、特色馆藏、开放时间等。回答要有条理，使用中文。' },
      { role: 'user', content: `推荐与"${validation.sanitized}"相关的艺术博物馆。${locationContext}${nearbyInfo}` },
    ];

    const sfRes = await fetch(`${SILICONFLOW_API_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getSiliconFlowKey()}` },
      body: JSON.stringify({ model: 'Qwen/Qwen3-8B', messages, stream: false }),
    });
    if (!sfRes.ok) {
      const err = await sfRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || `SiliconFlow error ${sfRes.status}`);
    }
    const data = await sfRes.json();
    return res.json({ text: data?.choices?.[0]?.message?.content || '未找到相关博物馆信息。', links: [] });
  } catch (e) {
    const msg = e?.message || '';
    const isAuth = msg.includes('401') || msg.includes('Unauthorized') || msg.includes('API key');
    res.status(isAuth ? 403 : 500).json({ error: isAuth ? 'API 密钥已失效，请联系管理员更新密钥。' : '服务器内部错误，请稍后重试。' });
  }
});

// ── Auth: updateBalance ───────────────────────────────────────────────────────

app.post('/api/firebase/auth/balance', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    await db.collection('users').doc(userId).update({ balance: FieldValue.increment(amount) });
    const doc = await db.collection('users').doc(userId).get();
    return res.json({ id: userId, ...doc.data() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── 静态前端文件 ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
