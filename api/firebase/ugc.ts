import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb } from '../_lib/firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  try {
    // GET /api/firebase/ugc?action=list
    if (req.method === 'GET' && action === 'list') {
      const snapshot = await adminDb.collection('ugc').orderBy('timestamp', 'desc').get();
      const posts = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        timestamp: d.data().timestamp?.toMillis?.() || Date.now(),
      }));
      return res.json(posts);
    }

    // POST /api/firebase/ugc?action=create
    if (req.method === 'POST' && action === 'create') {
      const post = req.body;
      const docRef = await adminDb.collection('ugc').add({
        ...post,
        likedByIds: [],
        comments: [],
        timestamp: FieldValue.serverTimestamp(),
        viewCount: 0,
      });
      return res.json({ id: docRef.id });
    }

    // POST /api/firebase/ugc?action=like
    if (req.method === 'POST' && action === 'like') {
      const { postId, userId } = req.body;
      const ref = adminDb.collection('ugc').doc(postId);
      const doc = await ref.get();
      const liked: string[] = doc.data()?.likedByIds || [];
      if (liked.includes(userId)) {
        await ref.update({ likedByIds: FieldValue.arrayRemove(userId) });
      } else {
        await ref.update({ likedByIds: FieldValue.arrayUnion(userId) });
      }
      return res.json({ ok: true });
    }

    // POST /api/firebase/ugc?action=comment
    if (req.method === 'POST' && action === 'comment') {
      const { postId, comment } = req.body;
      const newComment = {
        ...comment,
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
      };
      await adminDb.collection('ugc').doc(postId).update({
        comments: FieldValue.arrayUnion(newComment),
      });
      return res.json({ ok: true, comment: newComment });
    }

    // DELETE /api/firebase/ugc?action=delete
    if (req.method === 'DELETE' && action === 'delete') {
      const { postId, userId } = req.body;
      const doc = await adminDb.collection('ugc').doc(postId).get();
      if (!doc.exists) return res.status(404).json({ error: 'Not found' });
      if (doc.data()?.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });
      await adminDb.collection('ugc').doc(postId).delete();
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e: any) {
    console.error('[ugc proxy]', e);
    return res.status(500).json({ error: e.message });
  }
}
