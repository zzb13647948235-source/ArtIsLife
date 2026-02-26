import { User, UserTier, MarketItem, UGCPost, UGCComment } from '../types';
import { MASTERPIECE_COLLECTION } from '../constants';

const STORAGE_KEY_USERS = 'artislife_users';
const STORAGE_KEY_SESSION = 'artislife_session';
const STORAGE_KEY_MARKET_ITEMS = 'artislife_market_items';
const STORAGE_KEY_UGC = 'artislife_ugc';

type AuthListener = (user: User | null) => void;
type UGCListener = (posts: UGCPost[]) => void;
type MarketListener = (items: MarketItem[]) => void;

const listeners = new Set<AuthListener>();
const ugcListeners = new Set<UGCListener>();
const marketListeners = new Set<MarketListener>();

const notify = (user: User | null) => listeners.forEach(l => l(user));
const notifyUGC = (posts: UGCPost[]) => ugcListeners.forEach(l => l(posts));
const notifyMarket = (items: MarketItem[]) => marketListeners.forEach(l => l(items));

let bc: BroadcastChannel | null = null;
try {
  bc = new BroadcastChannel('artislife_realtime');
  bc.onmessage = (e) => {
    if (e.data?.type === 'ugc_update') notifyUGC(e.data.posts);
    if (e.data?.type === 'market_update') notifyMarket(e.data.items);
    if (e.data?.type === 'auth_update') notify(e.data.user);
  };
} catch { bc = null; }

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const safeStorage = {
  getItem: (key: string) => { try { return localStorage.getItem(key); } catch { return null; } },
  setItem: (key: string, val: string) => { try { localStorage.setItem(key, val); } catch {} },
  removeItem: (key: string) => { try { localStorage.removeItem(key); } catch {} }
};

const getInitialMarketItems = (): MarketItem[] => {
  return MASTERPIECE_COLLECTION.map((art, i) => {
    const basePrice = Math.floor(Math.random() * 800) + 100;
    const history: number[] = [];
    let p = basePrice * 0.8;
    for (let j = 0; j < 10; j++) { p = p * (1 + (Math.random() - 0.4) * 0.2); history.push(p); }
    history.push(basePrice);
    return { id: `sys-${i}`, title: art.title, artist: art.artist, year: art.year, basePrice, priceHistory: history, image: art.url, type: art.type || (i % 2 === 0 ? 'portrait' : 'landscape'), rarity: i % 10 === 0 ? 'Legendary' : i % 5 === 0 ? 'Rare' : 'Common', isSystem: true };
  });
};

export const authServiceLegacy = {
  subscribe(listener: AuthListener) {
    listeners.add(listener);
    listener(authServiceLegacy.getCurrentUser());
    return () => listeners.delete(listener);
  },

  subscribeToUGC(listener: UGCListener) {
    ugcListeners.add(listener);
    listener(authServiceLegacy.getUGCPosts());
    return () => ugcListeners.delete(listener);
  },

  subscribeToMarket(listener: MarketListener) {
    marketListeners.add(listener);
    listener(authServiceLegacy.getMarketItems());
    return () => marketListeners.delete(listener);
  },

  getCurrentUser(): User | null {
    const sessionStr = safeStorage.getItem(STORAGE_KEY_SESSION);
    if (!sessionStr) return null;
    try {
      const sessionData = JSON.parse(sessionStr);
      const users = JSON.parse(safeStorage.getItem(STORAGE_KEY_USERS) || '[]');
      const freshUser = users.find((u: any) => u.id === sessionData.id);
      return freshUser || sessionData;
    } catch { return null; }
  },

  async register(name: string, email: string, password: string): Promise<User> {
    await delay(600);
    const users = JSON.parse(safeStorage.getItem(STORAGE_KEY_USERS) || '[]');
    if (users.find((u: any) => u.email === email)) throw new Error('该邮箱已被注册，请直接登录');
    const newUser: any = { id: Date.now().toString(), name, email, password, tier: 'guest', joinedAt: Date.now(), balance: 1000, inventoryIds: [], likedItemIds: [] };
    users.push(newUser);
    safeStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    const sessionUser = { ...newUser };
    delete sessionUser.password;
    safeStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
    notify(sessionUser);
    return sessionUser;
  },

  async login(email: string, password: string): Promise<User> {
    await delay(600);
    const users = JSON.parse(safeStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) throw new Error('邮箱或密码错误，请重试');
    const sessionUser = { ...user };
    delete sessionUser.password;
    safeStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
    notify(sessionUser);
    return sessionUser;
  },

  async logout(): Promise<void> {
    safeStorage.removeItem(STORAGE_KEY_SESSION);
    notify(null);
  },

  async upgradeTier(userId: string, tier: UserTier): Promise<User> {
    const users = JSON.parse(safeStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx === -1) throw new Error('用户不存在');
    users[idx].tier = tier;
    if (tier === 'artist') users[idx].balance = (users[idx].balance || 0) + 5000;
    if (tier === 'patron') users[idx].balance = (users[idx].balance || 0) + 20000;
    safeStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    const sessionUser = { ...users[idx] }; delete sessionUser.password;
    safeStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
    notify(sessionUser); return sessionUser;
  },

  async updateBalance(userId: string, amount: number): Promise<User> {
    const users = JSON.parse(safeStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx === -1) throw new Error('用户不存在');
    users[idx].balance = Math.max(0, (users[idx].balance || 0) + amount);
    safeStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    const sessionUser = { ...users[idx] }; delete sessionUser.password;
    safeStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
    notify(sessionUser); return sessionUser;
  },

  async updateAvatar(userId: string, dataUrl: string): Promise<User> {
    const users = JSON.parse(safeStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx === -1) throw new Error('用户不存在');
    // Compress image via canvas
    const compressed: string = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        let w = img.width, h = img.height;
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = dataUrl;
    });
    users[idx].avatar = compressed;
    safeStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    const sessionUser = { ...users[idx] }; delete sessionUser.password;
    safeStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
    notify(sessionUser); return sessionUser;
  },

  async purchaseItem(userId: string, price: number, itemId: string): Promise<User> {
    const users = JSON.parse(safeStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx === -1) throw new Error('用户不存在');
    const user = users[idx];
    if ((user.balance || 0) < price) throw new Error('余额不足，请前往游戏赚取更多 ArtCoin');
    if (!user.inventoryIds) user.inventoryIds = [];
    if (user.inventoryIds.includes(itemId)) throw new Error('您已拥有此藏品');
    user.balance -= price; user.inventoryIds.push(itemId);
    safeStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    const sessionUser = { ...user }; delete sessionUser.password;
    safeStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
    notify(sessionUser); return sessionUser;
  },

  getMarketItems(): MarketItem[] {
    const stored = safeStorage.getItem(STORAGE_KEY_MARKET_ITEMS);
    if (!stored) { const initial = getInitialMarketItems(); safeStorage.setItem(STORAGE_KEY_MARKET_ITEMS, JSON.stringify(initial)); return initial; }
    try { return JSON.parse(stored); } catch { return []; }
  },

  async listMarketItem(item: MarketItem): Promise<void> {
    const items = this.getMarketItems(); items.unshift(item);
    safeStorage.setItem(STORAGE_KEY_MARKET_ITEMS, JSON.stringify(items));
    notifyMarket(items); bc?.postMessage({ type: 'market_update', items });
  },

  async toggleLikeItem(userId: string, itemId: string): Promise<User> {
    const users = JSON.parse(safeStorage.getItem(STORAGE_KEY_USERS) || '[]');
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    const user = users[idx];
    if (!user.likedItemIds) user.likedItemIds = [];
    if (user.likedItemIds.includes(itemId)) user.likedItemIds = user.likedItemIds.filter((id: string) => id !== itemId);
    else user.likedItemIds.push(itemId);
    safeStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    const sessionUser = { ...user }; delete sessionUser.password;
    safeStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
    notify(sessionUser); return sessionUser;
  },

  getUGCPosts(): UGCPost[] {
    try { return JSON.parse(safeStorage.getItem(STORAGE_KEY_UGC) || '[]'); } catch { return []; }
  },

  async createUGCPost(post: Omit<UGCPost, 'id' | 'likedByIds' | 'comments' | 'timestamp'>): Promise<UGCPost> {
    const posts = this.getUGCPosts();
    const newPost: UGCPost = { ...post, id: `ugc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, likedByIds: [], comments: [], timestamp: Date.now(), viewCount: 0 };
    posts.unshift(newPost);
    safeStorage.setItem(STORAGE_KEY_UGC, JSON.stringify(posts));
    notifyUGC(posts); bc?.postMessage({ type: 'ugc_update', posts });
    return newPost;
  },

  async toggleLikeUGCPost(userId: string, postId: string): Promise<UGCPost[]> {
    const posts = this.getUGCPosts();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx === -1) throw new Error('Post not found');
    const post = posts[idx];
    if (post.likedByIds.includes(userId)) post.likedByIds = post.likedByIds.filter(id => id !== userId);
    else post.likedByIds.push(userId);
    safeStorage.setItem(STORAGE_KEY_UGC, JSON.stringify(posts));
    notifyUGC(posts); bc?.postMessage({ type: 'ugc_update', posts });
    return posts;
  },

  async addUGCComment(postId: string, comment: Omit<UGCComment, 'id' | 'timestamp'>): Promise<UGCPost> {
    const posts = this.getUGCPosts();
    const idx = posts.findIndex(p => p.id === postId);
    if (idx === -1) throw new Error('Post not found');
    const newComment: UGCComment = { ...comment, id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp: Date.now() };
    posts[idx].comments.push(newComment);
    safeStorage.setItem(STORAGE_KEY_UGC, JSON.stringify(posts));
    notifyUGC(posts); bc?.postMessage({ type: 'ugc_update', posts });
    return posts[idx];
  },

  async deleteUGCPost(userId: string, postId: string): Promise<void> {
    const posts = this.getUGCPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');
    if (post.userId !== userId) throw new Error('Unauthorized');
    const filtered = posts.filter(p => p.id !== postId);
    safeStorage.setItem(STORAGE_KEY_UGC, JSON.stringify(filtered));
    notifyUGC(filtered); bc?.postMessage({ type: 'ugc_update', posts: filtered });
  },
};
