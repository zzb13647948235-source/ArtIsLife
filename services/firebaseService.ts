import { db, auth } from '../lib/firebase';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, arrayUnion, arrayRemove,
  serverTimestamp, getDoc, increment
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { User, UGCPost, UGCComment } from '../types';

// Firebase 错误码 → 中文
const translateError = (error: any): string => {
  const code = error?.code || '';
  const map: Record<string, string> = {
    'auth/email-already-in-use': '该邮箱已被注册，请直接登录',
    'auth/invalid-email': '邮箱格式不正确',
    'auth/operation-not-allowed': '邮箱/密码登录未启用，请在 Firebase 控制台开启',
    'auth/weak-password': '密码强度不足，至少需要6位',
    'auth/user-disabled': '该账号已被禁用',
    'auth/user-not-found': '未找到该邮箱对应的账号，请先注册',
    'auth/wrong-password': '密码错误，请重试',
    'auth/invalid-credential': '邮箱或密码错误，请重试',
    'auth/too-many-requests': '登录尝试次数过多，请稍后再试',
    'auth/network-request-failed': '网络连接失败，请检查网络',
  };
  return map[code] || error?.message || '操作失败，请重试';
};

// 注册期间跳过 onAuthStateChanged 覆盖
let isRegistering = false;

// 压缩图片为小尺寸 base64
const compressImage = (dataUrl: string, maxSize: number): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = dataUrl;
  });
};

// ---- Auth listeners ----
type AuthListener = (user: User | null) => void;
const authListeners = new Set<AuthListener>();
const notifyAuth = (user: User | null) => authListeners.forEach(l => l(user));

// ---- UGC listeners ----
type UGCListener = (posts: UGCPost[]) => void;
const ugcListeners = new Set<UGCListener>();
const notifyUGC = (posts: UGCPost[]) => ugcListeners.forEach(l => l(posts));

// 当前用户缓存
let currentUser: User | null = null;

// 监听 Firebase Auth 状态变化
onAuthStateChanged(auth, async (firebaseUser) => {
  if (isRegistering) return; // 注册流程中跳过，避免覆盖
  if (firebaseUser) {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      currentUser = { id: firebaseUser.uid, ...userDoc.data() } as User;
    } else {
      currentUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || '艺术家',
        email: firebaseUser.email || '',
        tier: 'guest',
        joinedAt: Date.now(),
        balance: 1000,
        inventoryIds: [],
        likedItemIds: []
      };
    }
    notifyAuth(currentUser);
  } else {
    currentUser = null;
    notifyAuth(null);
  }
});

export const firebaseService = {
  // ---- 订阅 ----
  subscribe(listener: AuthListener) {
    authListeners.add(listener);
    listener(currentUser);
    return () => authListeners.delete(listener);
  },

  subscribeToUGC(listener: UGCListener) {
    ugcListeners.add(listener);
    // 实时监听 Firestore ugc 集合
    const q = query(collection(db, 'ugc'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const posts: UGCPost[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        timestamp: d.data().timestamp?.toMillis?.() || Date.now(),
      })) as UGCPost[];
      notifyUGC(posts);
      listener(posts);
    });
    return () => { ugcListeners.delete(listener); unsub(); };
  },

  getCurrentUser(): User | null {
    return currentUser;
  },

  // ---- 注册 ----
  async register(name: string, email: string, password: string): Promise<User> {
    isRegistering = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const newUser: User = {
        id: cred.user.uid,
        name,
        email,
        tier: 'guest',
        joinedAt: Date.now(),
        balance: 1000,
        inventoryIds: [],
        likedItemIds: []
      };
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', cred.user.uid), newUser);
      currentUser = newUser;
      notifyAuth(newUser);
      return newUser;
    } catch (error: any) {
      throw new Error(translateError(error));
    } finally {
      isRegistering = false;
    }
  },

  // ---- 登录 ----
  async login(email: string, password: string): Promise<User> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      const user: User = userDoc.exists()
        ? { id: cred.user.uid, ...userDoc.data() } as User
        : { id: cred.user.uid, name: cred.user.displayName || '艺术家', email, tier: 'guest', joinedAt: Date.now(), balance: 1000, inventoryIds: [], likedItemIds: [] };
      currentUser = user;
      notifyAuth(user);
      return user;
    } catch (error: any) {
      throw new Error(translateError(error));
    }
  },

  // ---- 登出 ----
  async logout(): Promise<void> {
    await signOut(auth);
    currentUser = null;
    notifyAuth(null);
  },

  // ---- 升级会员 ----
  async upgradeTier(userId: string, tier: any): Promise<User> {
    const bonus = tier === 'artist' ? 5000 : tier === 'patron' ? 20000 : 0;
    await updateDoc(doc(db, 'users', userId), { tier, balance: increment(bonus) });
    const userDoc = await getDoc(doc(db, 'users', userId));
    const updated = { id: userId, ...userDoc.data() } as User;
    currentUser = updated;
    notifyAuth(updated);
    return updated;
  },

  // ---- 更新余额 ----
  async updateBalance(userId: string, amount: number): Promise<User> {
    await updateDoc(doc(db, 'users', userId), { balance: increment(amount) });
    const userDoc = await getDoc(doc(db, 'users', userId));
    const updated = { id: userId, ...userDoc.data() } as User;
    currentUser = updated;
    notifyAuth(updated);
    return updated;
  },

  // ---- 购买藏品 ----
  async purchaseItem(userId: string, price: number, itemId: string): Promise<User> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data() as any;
    if ((userData.balance || 0) < price) throw new Error('余额不足，请前往游戏赚取更多 ArtCoin');
    if ((userData.inventoryIds || []).includes(itemId)) throw new Error('您已拥有此藏品');
    await updateDoc(doc(db, 'users', userId), {
      balance: increment(-price),
      inventoryIds: arrayUnion(itemId)
    });
    const updated = { id: userId, ...((await getDoc(doc(db, 'users', userId))).data()) } as User;
    currentUser = updated;
    notifyAuth(updated);
    return updated;
  },

  // ---- 发帖 ----
  async createUGCPost(post: Omit<UGCPost, 'id' | 'likedByIds' | 'comments' | 'timestamp'>): Promise<UGCPost> {
    let imageUrl = post.imageUrl;
    // 如果是 base64，压缩后直接存 Firestore（不需要 Storage）
    if (imageUrl.startsWith('data:')) {
      imageUrl = await compressImage(imageUrl, 800);
    }
    const docRef = await addDoc(collection(db, 'ugc'), {
      ...post,
      imageUrl,
      likedByIds: [],
      comments: [],
      timestamp: serverTimestamp(),
      viewCount: 0,
    });
    return { id: docRef.id, ...post, imageUrl, likedByIds: [], comments: [], timestamp: Date.now(), viewCount: 0 };
  },

  // ---- 点赞 ----
  async toggleLikeUGCPost(userId: string, postId: string): Promise<UGCPost[]> {
    const postRef = doc(db, 'ugc', postId);
    const postDoc = await getDoc(postRef);
    const data = postDoc.data() as any;
    if (data.likedByIds.includes(userId)) {
      await updateDoc(postRef, { likedByIds: arrayRemove(userId) });
    } else {
      await updateDoc(postRef, { likedByIds: arrayUnion(userId) });
    }
    return [];
  },

  // ---- 评论 ----
  async addUGCComment(postId: string, comment: Omit<UGCComment, 'id' | 'timestamp'>): Promise<UGCPost> {
    const newComment: UGCComment = {
      ...comment,
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    await updateDoc(doc(db, 'ugc', postId), {
      comments: arrayUnion(newComment)
    });
    const postDoc = await getDoc(doc(db, 'ugc', postId));
    return { id: postId, ...postDoc.data() } as UGCPost;
  },

  // ---- 删帖 ----
  async deleteUGCPost(userId: string, postId: string): Promise<void> {
    const postDoc = await getDoc(doc(db, 'ugc', postId));
    if (!postDoc.exists()) throw new Error('Post not found');
    if (postDoc.data()?.userId !== userId) throw new Error('Unauthorized');
    await deleteDoc(doc(db, 'ugc', postId));
  },

  // ---- 兼容旧接口 ----
  getUGCPosts(): UGCPost[] { return []; },
  getMarketItems() { return []; },
  subscribeToMarket(listener: any) { listener([]); return () => {}; },
  async listMarketItem(_item?: any) {},
  async toggleLikeItem(userId: string, itemId: string): Promise<User> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const data = userDoc.data() as any;
    const liked: string[] = data.likedItemIds || [];
    if (liked.includes(itemId)) {
      await updateDoc(doc(db, 'users', userId), { likedItemIds: arrayRemove(itemId) });
    } else {
      await updateDoc(doc(db, 'users', userId), { likedItemIds: arrayUnion(itemId) });
    }
    const updated = { id: userId, ...((await getDoc(doc(db, 'users', userId))).data()) } as User;
    currentUser = updated;
    notifyAuth(updated);
    return updated;
  },
};
