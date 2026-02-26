import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb, adminAuth } from '../_lib/firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  try {
    // POST /api/firebase/auth?action=register
    if (req.method === 'POST' && action === 'register') {
      const { name, email, password } = req.body;
      const cred = await adminAuth.createUser({ email, password, displayName: name });
      const newUser = {
        id: cred.uid, name, email,
        tier: 'guest', joinedAt: Date.now(),
        balance: 1000, inventoryIds: [], likedItemIds: [],
      };
      await adminDb.collection('users').doc(cred.uid).set(newUser);
      // 生成自定义 token 供前端登录
      const customToken = await adminAuth.createCustomToken(cred.uid);
      return res.json({ user: newUser, customToken });
    }

    // POST /api/firebase/auth?action=getUser
    if (req.method === 'POST' && action === 'getUser') {
      const { uid } = req.body;
      const doc = await adminDb.collection('users').doc(uid).get();
      if (!doc.exists) return res.status(404).json({ error: 'User not found' });
      return res.json({ id: uid, ...doc.data() });
    }

    // POST /api/firebase/auth?action=updateAvatar
    if (req.method === 'POST' && action === 'updateAvatar') {
      const { userId, avatar } = req.body;
      await adminDb.collection('users').doc(userId).update({ avatar });
      const doc = await adminDb.collection('users').doc(userId).get();
      return res.json({ id: userId, ...doc.data() });
    }

    // POST /api/firebase/auth?action=upgradeTier
    if (req.method === 'POST' && action === 'upgradeTier') {
      const { userId, tier } = req.body;
      const bonus = tier === 'artist' ? 5000 : tier === 'patron' ? 20000 : 0;
      await adminDb.collection('users').doc(userId).update({
        tier,
        balance: FieldValue.increment(bonus),
      });
      const doc = await adminDb.collection('users').doc(userId).get();
      return res.json({ id: userId, ...doc.data() });
    }

    // POST /api/firebase/auth?action=purchaseItem
    if (req.method === 'POST' && action === 'purchaseItem') {
      const { userId, price, itemId } = req.body;
      const doc = await adminDb.collection('users').doc(userId).get();
      const data = doc.data() as any;
      if ((data.balance || 0) < price) return res.status(400).json({ error: '余额不足，请前往游戏赚取更多 ArtCoin' });
      if ((data.inventoryIds || []).includes(itemId)) return res.status(400).json({ error: '您已拥有此藏品' });
      await adminDb.collection('users').doc(userId).update({
        balance: FieldValue.increment(-price),
        inventoryIds: FieldValue.arrayUnion(itemId),
      });
      const updated = await adminDb.collection('users').doc(userId).get();
      return res.json({ id: userId, ...updated.data() });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e: any) {
    console.error('[auth proxy]', e);
    return res.status(500).json({ error: e.message });
  }
}
