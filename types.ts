

export type Language = 'zh' | 'en' | 'ja' | 'fr' | 'es';

export interface Sticker {
  id: string;
  emoji: string;
  label: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingLinks?: GroundingLink[];
  sticker?: Sticker;
}

export interface GroundingLink {
  title: string;
  url: string;
  source?: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface GeneratedImage {
  url: string;
  prompt: string;
  size: ImageSize;
  timestamp: number;
}

// Added 'journal' and 'market'
export type ViewState = 'intro' | 'home' | 'journal' | 'styles' | 'gallery' | 'market' | 'chat' | 'game' | 'membership' | 'about' | 'login' | 'map' | 'community';

export interface UGCComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  text: string;
  timestamp: number;
}

export interface UGCPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  imageUrl: string;
  title: string;
  description?: string | null;
  tags: string[];
  likedByIds: string[];
  comments: UGCComment[];
  timestamp: number;
  isAIGenerated: boolean;
  viewCount?: number;
}

export type UserTier = 'guest' | 'artist' | 'patron';

export interface MarketItem {
    id: string | number;
    title: string;
    artist: string;
    year: string;
    basePrice: number;
    priceHistory: number[];
    image: string;
    type: string;
    rarity: string;
    isSystem?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  tier: UserTier;
  avatar?: string;
  joinedAt: number;
  // 新增：账户余额与库存 ID 列表，用于支持游戏化货币系统和未来扩展
  balance: number;
  inventoryIds: string[];
  likedItemIds?: string[];
}

export interface GameLevel {
  id: number;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  description: string;
  isPremium: boolean;
  difficulty: 1 | 2 | 3 | 4 | 5; // Star rating
  palette: string[]; // List of Hex codes available for this level
  regions: {
    id: number;
    x: number; // % position
    y: number; // % position
    color: string; // Correct hex code
    radius: number; // Size of the restoration spot
    hint?: string;
  }[];
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}