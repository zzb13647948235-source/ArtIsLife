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
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.split('\\n').join('\n'),
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

// ── 静态前端文件 ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
