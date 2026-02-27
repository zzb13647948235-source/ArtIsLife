// 通过后端代理访问 Firebase，解决国内网络问题
import { User, UGCPost, UGCComment } from '../types';

const API_BASE = '/api/firebase';

type AuthListener = (user: User | null) => void;
type UGCListener = (posts: UGCPost[]) => void;

const authListeners = new Set<AuthListener>();
const ugcListeners = new Set<UGCListener>();
const notifyAuth = (user: User | null) => authListeners.forEach(l => l(user));
const notifyUGC = (posts: UGCPost[]) => ugcListeners.forEach(l => l(posts));

let currentUser: User | null = null;
let ugcPollInterval: ReturnType<typeof setInterval> | null = null;


export const proxyFirebaseService = {
  subscribe(listener: AuthListener) {
    authListeners.add(listener);
    listener(currentUser);
    return () => authListeners.delete(listener);
  },

  subscribeToUGC(listener: UGCListener) {
    ugcListeners.add(listener);

    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE}/ugc?action=list`);
        if (res.ok) {
          const posts = await res.json();
          notifyUGC(posts);
          listener(posts);
        }
      } catch (e) {
        console.error('[proxyService] fetchPosts failed', e);
        listener([]);
      }
    };

    fetchPosts();
    // 每10秒轮询一次
    if (!ugcPollInterval) {
      ugcPollInterval = setInterval(fetchPosts, 10000);
    }

    return () => {
      ugcListeners.delete(listener);
      if (ugcListeners.size === 0 && ugcPollInterval) {
        clearInterval(ugcPollInterval);
        ugcPollInterval = null;
      }
    };
  },

  getCurrentUser(): User | null {
    return currentUser;
  },

  async register(name: string, email: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '注册失败');
    currentUser = data.user;
    notifyAuth(currentUser);
    return data.user;
  },

  async login(email: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '登录失败');
    currentUser = data.user;
    notifyAuth(currentUser);
    return data.user;
  },

  async logout(): Promise<void> {
    currentUser = null;
    notifyAuth(null);
  },

  async upgradeTier(userId: string, tier: any): Promise<User> {
    const res = await fetch(`${API_BASE}/auth?action=upgradeTier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tier }),
    });
    const user = await res.json();
    if (!res.ok) throw new Error(user.error || '升级失败');
    currentUser = user;
    notifyAuth(currentUser);
    return user;
  },

  async updateAvatar(userId: string, dataUrl: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth?action=updateAvatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, avatar: dataUrl }),
    });
    const user = await res.json();
    if (!res.ok) throw new Error(user.error || '更新头像失败');
    currentUser = user;
    notifyAuth(currentUser);
    return user;
  },

  async purchaseItem(userId: string, price: number, itemId: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth?action=purchaseItem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, price, itemId }),
    });
    const user = await res.json();
    if (!res.ok) throw new Error(user.error || '购买失败');
    currentUser = user;
    notifyAuth(currentUser);
    return user;
  },

  async createUGCPost(post: Omit<UGCPost, 'id' | 'likedByIds' | 'comments' | 'timestamp'>): Promise<UGCPost> {
    const res = await fetch(`${API_BASE}/ugc?action=create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '发布失败');
    return { id: data.id, ...post, likedByIds: [], comments: [], timestamp: Date.now(), viewCount: 0 };
  },

  async toggleLikeUGCPost(userId: string, postId: string): Promise<UGCPost[]> {
    await fetch(`${API_BASE}/ugc?action=like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, postId }),
    });
    return [];
  },

  async addUGCComment(postId: string, comment: Omit<UGCComment, 'id' | 'timestamp'>): Promise<UGCPost> {
    const res = await fetch(`${API_BASE}/ugc?action=comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, comment }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '评论失败');
    return {} as UGCPost;
  },

  async deleteUGCPost(userId: string, postId: string): Promise<void> {
    await fetch(`${API_BASE}/ugc?action=delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, postId }),
    });
  },

  async updateBalance(userId: string, amount: number): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    });
    const user = await res.json();
    if (!res.ok) throw new Error(user.error || '余额更新失败');
    currentUser = user;
    notifyAuth(currentUser);
    return user;
  },

  getUGCPosts(): UGCPost[] { return []; },
  getMarketItems() { return []; },
  subscribeToMarket(listener: any) { listener([]); return () => {}; },
  async listMarketItem(_item?: any) {},
  async toggleLikeItem(userId: string, itemId: string): Promise<User> { return currentUser!; },
};
