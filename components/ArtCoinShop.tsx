import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, Flame, ShoppingBag } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

interface ShopItem {
  id: string;
  price: number;
  category: 'tool' | 'cosmetic' | 'collectible';
  rarity: 'common' | 'rare' | 'legendary';
  emoji: string;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'hint_pack',      price: 200,  category: 'tool',        rarity: 'common',    emoji: '💡' },
  { id: 'magic_brush',    price: 500,  category: 'tool',        rarity: 'rare',      emoji: '🖌️' },
  { id: 'hd_export',      price: 300,  category: 'tool',        rarity: 'common',    emoji: '🖼️' },
  { id: 'silver_frame',   price: 500,  category: 'cosmetic',    rarity: 'common',    emoji: '🪞' },
  { id: 'gold_frame',     price: 1000, category: 'cosmetic',    rarity: 'rare',      emoji: '👑' },
  { id: 'artist_badge',   price: 800,  category: 'cosmetic',    rarity: 'rare',      emoji: '🎨' },
  { id: 'wallpaper_pack', price: 400,  category: 'collectible', rarity: 'common',    emoji: '🗂️' },
  { id: 'color_theory',   price: 600,  category: 'collectible', rarity: 'rare',      emoji: '🎭' },
  { id: 'master_seal',    price: 2000, category: 'collectible', rarity: 'legendary', emoji: '⭐' },
];

const CHECKIN_REWARDS = [100, 150, 200, 250, 300, 400, 500];

const STORAGE_CHECKIN = 'artislife_checkin';

const rarityStyle: Record<string, string> = {
  common:    'border-stone-200 bg-white',
  rare:      'border-indigo-200 bg-indigo-50/40',
  legendary: 'border-amber-300 bg-amber-50/60 ring-1 ring-amber-300/40',
};
const rarityBadge: Record<string, string> = {
  common:    'bg-stone-100 text-stone-500',
  rare:      'bg-indigo-100 text-indigo-600',
  legendary: 'bg-amber-100 text-amber-700',
};

interface ArtCoinShopProps {
  user: User | null;
  onClose: () => void;
  onUserUpdate: (u: User) => void;
  onAuthRequired: () => void;
}

const ArtCoinShop: React.FC<ArtCoinShopProps> = ({ user, onClose, onUserUpdate, onAuthRequired }) => {
  const [tab, setTab] = useState<'all' | 'tool' | 'cosmetic' | 'collectible'>('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [checkinDone, setCheckinDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CHECKIN);
      if (raw) {
        const data = JSON.parse(raw);
        const today = new Date().toDateString();
        setCheckinDone(data.lastDate === today);
        setStreak(data.streak || 0);
      }
    } catch {}
  }, []);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCheckin = useCallback(async () => {
    if (!user) { onAuthRequired(); return; }
    if (checkinDone || checkinLoading) return;
    setCheckinLoading(true);
    try {
      const raw = localStorage.getItem(STORAGE_CHECKIN);
      const data = raw ? JSON.parse(raw) : { streak: 0, lastDate: '' };
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = data.lastDate === yesterday ? Math.min((data.streak || 0) + 1, 7) : 1;
      const reward = CHECKIN_REWARDS[Math.min(newStreak - 1, CHECKIN_REWARDS.length - 1)];
      localStorage.setItem(STORAGE_CHECKIN, JSON.stringify({ streak: newStreak, lastDate: today }));
      const updated = await authService.updateBalance(user.id, reward);
      onUserUpdate(updated);
      setCheckinDone(true);
      setStreak(newStreak);
      showToast(`${t('shop.checkin_title')} +${reward} ArtCoin 🎉`, true);
    } catch (e: any) {
      showToast(e.message || '签到失败', false);
    } finally {
      setCheckinLoading(false);
    }
  }, [user, checkinDone, checkinLoading, onAuthRequired, onUserUpdate]);

  const handleBuy = useCallback(async (item: ShopItem) => {
    if (!user) { onAuthRequired(); return; }
    if (purchasing) return;
    setPurchasing(item.id);
    try {
      const updated = await authService.purchaseItem(user.id, item.price, item.id);
      onUserUpdate(updated);
      showToast(t('shop.toast_success').replace('{name}', t(`shop.item_${item.id}_name`)), true);
    } catch (e: any) {
      showToast(e.message || t('shop.toast_fail'), false);
    } finally {
      setPurchasing(null);
    }
  }, [user, purchasing, onAuthRequired, onUserUpdate]);

  const owned = user?.inventoryIds || [];
  const balance = user?.balance ?? 0;
  const filtered = tab === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === tab);
  const todayReward = CHECKIN_REWARDS[Math.min(streak, CHECKIN_REWARDS.length - 1)];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#F9F8F6] rounded-[40px] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={22} className="text-art-primary" />
            <h2 className="font-serif text-2xl italic text-art-accent">{t('shop.title')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
              <span className="text-amber-500 text-sm">🪙</span>
              <span className="font-bold text-amber-700 text-sm">{balance.toLocaleString()}</span>
              <span className="text-amber-500 text-[10px] uppercase tracking-widest">ArtCoin</span>
            </div>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-800 transition-colors"><X size={20} /></button>
          </div>
        </div>

        {/* Daily Check-in */}
        <div className="mx-8 mb-4 p-5 bg-gradient-to-r from-art-primary/10 to-amber-50 border border-art-primary/20 rounded-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-art-primary/10 flex items-center justify-center text-2xl">🎁</div>
            <div>
              <p className="font-bold text-art-accent text-sm">{t('shop.checkin_title')}</p>
              <p className="text-stone-500 text-xs mt-0.5">
                {streak > 0 ? <span className="flex items-center gap-1"><Flame size={11} className="text-orange-500" />{t('shop.checkin_streak').replace('{n}', String(streak))}</span> : t('shop.checkin_idle')}
              </p>
            </div>
            <div className="flex gap-1.5 ml-2">
              {CHECKIN_REWARDS.map((r, i) => (
                <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold border transition-all
                  ${i < streak ? 'bg-art-primary text-white border-art-primary' : i === streak && !checkinDone ? 'bg-amber-100 border-amber-400 text-amber-700 animate-pulse' : 'bg-white border-stone-200 text-stone-400'}`}>
                  {r >= 500 ? '⭐' : r >= 300 ? '🔥' : `+${r}`}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleCheckin}
            disabled={checkinDone || checkinLoading}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95
              ${checkinDone ? 'bg-stone-100 text-stone-400 cursor-default' : 'bg-art-primary text-white hover:bg-art-accent shadow-md'}`}
          >
            {checkinDone ? <span className="flex items-center gap-1.5"><Check size={12} /> {t('shop.checkin_done')}</span> : checkinLoading ? '...' : t('shop.checkin_claim').replace('{n}', String(todayReward))}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-8 mb-4 shrink-0">
          {(['all','tool','cosmetic','collectible'] as const).map((key) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all
                ${tab === key ? 'bg-art-accent text-white shadow-sm' : 'bg-white text-stone-500 hover:text-stone-800 border border-stone-200'}`}>
              {t(`shop.tab_${key}`)}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="overflow-y-auto px-8 pb-8 flex-1 scrollbar-hide">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map(item => {
              const isOwned = owned.includes(item.id);
              const isBuying = purchasing === item.id;
              const canAfford = balance >= item.price;
              return (
                <div key={item.id} className={`relative p-5 rounded-2xl border-2 transition-all ${rarityStyle[item.rarity]} ${isOwned ? 'opacity-70' : ''}`}>
                  {item.rarity === 'legendary' && <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />}
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <p className="font-bold text-art-accent text-sm leading-tight">{t(`shop.item_${item.id}_name`)}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${rarityBadge[item.rarity]}`}>{t(`shop.rarity_${item.rarity}`)}</span>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed mb-4">{t(`shop.item_${item.id}_desc`)}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-600 font-bold text-sm flex items-center gap-1">🪙 {item.price.toLocaleString()}</span>
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={isOwned || isBuying || !canAfford}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95
                        ${isOwned ? 'bg-stone-100 text-stone-400 cursor-default'
                          : !canAfford ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                          : 'bg-art-accent text-white hover:bg-art-primary shadow-sm'}`}
                    >
                      {isOwned ? <span className="flex items-center gap-1"><Check size={10} />{t('shop.owned')}</span> : isBuying ? '...' : !canAfford ? t('shop.insufficient') : t('shop.redeem')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-bold shadow-xl animate-fade-in
            ${toast.ok ? 'bg-art-accent text-white' : 'bg-red-500 text-white'}`}>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtCoinShop;

