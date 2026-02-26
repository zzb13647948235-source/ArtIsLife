import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, Flame, Gift, Lightbulb, Brush, Image as ImageIcon, Square, Crown, Palette, LayoutGrid, BookOpen, Star, LucideIcon } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

interface ShopItem {
  id: string;
  price: number;
  category: 'tool' | 'cosmetic' | 'collectible';
  rarity: 'common' | 'rare' | 'legendary';
  Icon: LucideIcon;
}

const SHOP_ITEMS: ShopItem[] = [
  { id: 'hint_pack',      price: 200,  category: 'tool',        rarity: 'common',    Icon: Lightbulb },
  { id: 'magic_brush',    price: 500,  category: 'tool',        rarity: 'rare',      Icon: Brush },
  { id: 'hd_export',      price: 300,  category: 'tool',        rarity: 'common',    Icon: ImageIcon },
  { id: 'silver_frame',   price: 500,  category: 'cosmetic',    rarity: 'common',    Icon: Square },
  { id: 'gold_frame',     price: 1000, category: 'cosmetic',    rarity: 'rare',      Icon: Crown },
  { id: 'artist_badge',   price: 800,  category: 'cosmetic',    rarity: 'rare',      Icon: Palette },
  { id: 'wallpaper_pack', price: 400,  category: 'collectible', rarity: 'common',    Icon: LayoutGrid },
  { id: 'color_theory',   price: 600,  category: 'collectible', rarity: 'rare',      Icon: BookOpen },
  { id: 'master_seal',    price: 2000, category: 'collectible', rarity: 'legendary', Icon: Star },
];

const CHECKIN_REWARDS = [100, 150, 200, 250, 300, 400, 500];
const STORAGE_CHECKIN = 'artislife_checkin';

const rarityLabel: Record<string, string> = { common: '普通', rare: '稀有', legendary: '传说' };
const rarityColor: Record<string, string> = { common: 'text-stone-500', rare: 'text-[#c5a059]', legendary: 'text-[#f0c040]' };
const rarityBorder: Record<string, string> = { common: 'border-white/[0.07]', rare: 'border-[#c5a059]/25', legendary: 'border-[#f0c040]/40' };
const rarityIconBg: Record<string, string> = { common: 'bg-white/5 text-stone-400', rare: 'bg-[#c5a059]/10 text-[#c5a059]', legendary: 'bg-[#f0c040]/10 text-[#f0c040]' };

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
        setCheckinDone(data.lastDate === new Date().toDateString());
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
      showToast(`签到成功 +${reward} ArtCoin`, true);
    } catch (e: any) {
      showToast(e.message || '签到失败', false);
    } finally { setCheckinLoading(false); }
  }, [user, checkinDone, checkinLoading, onAuthRequired, onUserUpdate]);

  const handleBuy = useCallback(async (item: ShopItem) => {
    if (!user) { onAuthRequired(); return; }
    if (purchasing) return;
    setPurchasing(item.id);
    try {
      const updated = await authService.purchaseItem(user.id, item.price, item.id);
      onUserUpdate(updated);
      showToast(`${t(`shop.item_${item.id}_name`)} 兑换成功`, true);
    } catch (e: any) {
      showToast(e.message || t('shop.toast_fail'), false);
    } finally { setPurchasing(null); }
  }, [user, purchasing, onAuthRequired, onUserUpdate, t]);

  const owned = user?.inventoryIds || [];
  const balance = user?.balance ?? 0;
  const filtered = tab === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === tab);
  const todayReward = CHECKIN_REWARDS[Math.min(streak, CHECKIN_REWARDS.length - 1)];
  const tabs = [
    { key: 'all' as const, label: '全部' },
    { key: 'tool' as const, label: '道具' },
    { key: 'cosmetic' as const, label: '装扮' },
    { key: 'collectible' as const, label: '藏品' },
  ];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-[#0d0d0d] rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)] flex flex-col border border-white/[0.06]" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-8 pt-5 md:pt-7 pb-4 md:pb-6 shrink-0 border-b border-white/[0.06]">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#c5a059] mb-1">ArtCoin</p>
            <h2 className="font-serif text-2xl text-white tracking-tight">兑换商店</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-full">
              <span className="text-[#c5a059] text-[11px] font-bold">◈</span>
              <span className="font-bold text-[#c5a059] text-sm font-mono">{balance.toLocaleString()}</span>
              <span className="text-[#c5a059]/40 text-[9px] uppercase tracking-widest">ArtCoin</span>
            </div>
            <button onClick={onClose} className="p-2 text-white/25 hover:text-white/70 transition-colors rounded-full hover:bg-white/5">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Daily Check-in */}
        <div className="mx-4 md:mx-8 mt-4 md:mt-5 p-4 md:p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-9 h-9 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center shrink-0">
              <Gift size={15} className="text-[#c5a059]" />
            </div>
            <div>
              <p className="font-medium text-white/80 text-sm">每日签到</p>
              <p className="text-white/25 text-[11px] mt-0.5 flex items-center gap-1">
                {streak > 0 ? <><Flame size={10} className="text-orange-400" />连续 {streak} 天</>  : '今日尚未签到'}
              </p>
            </div>
            <div className="hidden sm:flex gap-1.5 ml-1">
              {CHECKIN_REWARDS.map((r, i) => (
                <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold border transition-all
                  ${i < streak ? 'bg-[#c5a059] text-black border-[#c5a059]'
                    : i === streak && !checkinDone ? 'bg-[#c5a059]/15 border-[#c5a059]/50 text-[#c5a059]'
                    : 'bg-white/[0.03] border-white/[0.07] text-white/20'}`}>
                  {r >= 500 ? '★' : r >= 300 ? '▲' : `+${r}`}
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleCheckin} disabled={checkinDone || checkinLoading}
            className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95
              ${checkinDone ? 'text-white/20 cursor-default'
                : 'border border-[#c5a059]/40 text-[#c5a059] hover:bg-[#c5a059]/10'}`}>
            {checkinDone ? <span className="flex items-center gap-1.5"><Check size={10} /> 已签到</span>
              : checkinLoading ? '···' : `领取 +${todayReward}`}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 md:px-8 mt-4 md:mt-5 shrink-0 border-b border-white/[0.06]">
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 pb-3 text-[10px] font-bold uppercase tracking-[0.25em] transition-all border-b-2 -mb-px
                ${tab === key ? 'border-[#c5a059] text-[#c5a059]' : 'border-transparent text-white/25 hover:text-white/50'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="overflow-y-auto px-4 md:px-8 py-4 md:py-6 flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
            {filtered.map(item => {
              const isOwned = owned.includes(item.id);
              const isBuying = purchasing === item.id;
              const canAfford = balance >= item.price;
              const { Icon } = item;
              return (
                <div key={item.id} className={`relative p-4 md:p-5 rounded-2xl border transition-all
                  ${rarityBorder[item.rarity]} bg-white/[0.03] hover:bg-white/[0.05]
                  ${item.rarity === 'legendary' ? 'shadow-[0_0_24px_rgba(240,192,64,0.05)]' : ''}
                  ${isOwned ? 'opacity-35' : ''}`}>
                  {item.rarity === 'legendary' && <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f0c040]/40 to-transparent rounded-t-2xl" />}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${rarityIconBg[item.rarity]}`}>
                    <Icon size={15} strokeWidth={1.5} />
                  </div>
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <p className="font-serif text-white/90 text-sm leading-tight">{t(`shop.item_${item.id}_name`)}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${rarityColor[item.rarity]}`}>{rarityLabel[item.rarity]}</span>
                  </div>
                  <p className="text-white/25 text-[11px] leading-relaxed mb-5">{t(`shop.item_${item.id}_desc`)}</p>
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-sm font-bold flex items-center gap-1.5 ${canAfford && !isOwned ? 'text-[#c5a059]' : 'text-white/20'}`}>
                      <span className="text-[10px]">◈</span>{item.price.toLocaleString()}
                    </span>
                    <button onClick={() => handleBuy(item)} disabled={isOwned || isBuying || !canAfford}
                      className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95
                        ${isOwned ? 'text-white/15 cursor-default'
                          : !canAfford ? 'text-white/15 cursor-not-allowed'
                          : 'border border-white/15 text-white/50 hover:border-[#c5a059]/50 hover:text-[#c5a059] hover:bg-[#c5a059]/5'}`}>
                      {isOwned ? <span className="flex items-center gap-1"><Check size={9} /> 已拥有</span>
                        : isBuying ? '···' : !canAfford ? '不足' : '兑换'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {toast && (
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full text-xs font-bold tracking-wider shadow-2xl animate-fade-in whitespace-nowrap
            ${toast.ok ? 'bg-[#c5a059] text-black' : 'bg-red-500/90 text-white'}`}>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtCoinShop;


