
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PRICING_PLANS } from '../constants';
import { Check, Crown, Loader2, X, ShieldCheck, Zap, Award, Star, AlertCircle, CheckCircle, Palette, MessageSquare, Gift, Ticket, Clock, ChevronDown, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { UserTier } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MembershipProps {
  currentTier: UserTier;
  onUpgrade: (tier: UserTier) => Promise<void>;
  onClose?: () => void;
}

// ── Countdown to end of month ──────────────────────────────────────────────
const useCountdown = () => {
  const calc = () => {
    const end = new Date(); end.setMonth(end.getMonth() + 1, 1); end.setHours(0,0,0,0);
    const d = Math.max(0, end.getTime() - Date.now());
    return { h: Math.floor(d/3600000), m: Math.floor((d%3600000)/60000), s: Math.floor((d%60000)/1000) };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, []);
  return t;
};

// ── Animated number counter ────────────────────────────────────────────────
const AnimatedNumber: React.FC<{ value: number; suffix?: string; prefix?: string }> = ({ value, suffix = '', prefix = '' }) => {
  const [cur, setCur] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0; const step = value / 60;
      const id = setInterval(() => { start = Math.min(start + step, value); setCur(Math.floor(start)); if (start >= value) clearInterval(id); }, 16);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{prefix}{cur.toLocaleString()}{suffix}</span>;
};

// ── Testimonials data ──────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: '林晓雨', role: '插画师', tier: 'Artist', text: '订阅后每天都在用 AI 创作，灵感从未枯竭。修复游戏让我对色彩的理解提升了一个维度。', avatar: '林' },
  { name: 'Marcus Chen', role: 'Art Director', tier: 'Patron', text: 'The museum finder and AI chat are genuinely useful for my work. Worth every penny.', avatar: 'M' },
  { name: '张明远', role: '艺术收藏家', tier: 'Patron', text: '藏馆市场的 ArtCoin 体系设计得很聪明，我已经用游戏赚的币买了好几幅作品。', avatar: '张' },
  { name: 'Sophie L.', role: 'Design Student', tier: 'Artist', text: 'The art style explorer changed how I study art history. Absolutely love it.', avatar: 'S' },
];

// ── FAQ data ───────────────────────────────────────────────────────────────
const FAQ = [
  { q: '可以随时取消订阅吗？', a: '可以，随时取消，无任何违约金。取消后当前周期内权益继续有效。' },
  { q: 'ArtCoin 是什么？', a: 'ArtCoin 是平台内部货币，可通过游戏赚取，用于购买藏馆作品或解锁高级内容。会员每月自动获得奖励。' },
  { q: '支持哪些支付方式？', a: '支持微信支付、支付宝、银联及主流信用卡。所有支付均经过 SSL 加密保护。' },
  { q: 'AI 创作的图片版权归谁？', a: '您创作的所有 AI 作品版权归您所有，平台提供数字水印认证服务。' },
];

// ── Feature comparison ─────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { label: 'AI 绘画创作', guest: '每日 3 次', artist: '无限次 (2K)', patron: '无限次 (4K)' },
  { label: '修复关卡', guest: '前 2 关', artist: '全部 50+', patron: '全部 50+' },
  { label: '智能吸色', guest: false, artist: true, patron: true },
  { label: 'AI 艺术顾问对话', guest: '每日 5 次', artist: '无限次', patron: '无限次' },
  { label: '博物馆查找', guest: true, artist: true, patron: true },
  { label: '藏馆市场交易', guest: '仅浏览', artist: '买卖', patron: '买卖 + 优先' },
  { label: '每月 ArtCoin 奖励', guest: false, artist: '5,000', patron: '20,000' },
  { label: '4K 超清画质', guest: false, artist: false, patron: true },
  { label: '一键修复道具', guest: false, artist: false, patron: true },
  { label: '专属客服', guest: false, artist: false, patron: true },
];
// ── Pricing Card ──────────────────────────────────────────────────────────
const MembershipCard: React.FC<{
  plan: any; isCurrent: boolean; isProcessing: boolean; onSelect: () => void; t: any; isPopular?: boolean;
}> = ({ plan, isCurrent, isProcessing, onSelect, t, isPopular }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const isPatron = plan.id === 'patron';
  const isArtist = plan.id === 'artist';

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left - r.width / 2) / 25, y: -(e.clientY - r.top - r.height / 2) / 25 });
  };

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative h-full" style={{ perspective: '1000px' }}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-5 py-1.5 bg-art-primary text-white text-[9px] font-black uppercase tracking-[0.4em] rounded-full shadow-lg whitespace-nowrap">
          ✦ 最受欢迎
        </div>
      )}
      <div
        className={`h-full relative rounded-[40px] flex flex-col overflow-hidden border transition-shadow duration-300 hover:shadow-2xl
          ${isPatron ? 'bg-[#0d0d0d] border-art-gold/40 text-white' : isArtist ? 'bg-white border-art-primary/30 text-stone-900 shadow-xl' : 'bg-stone-50 border-stone-200 text-stone-600'}`}
        style={{ transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`, transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out, box-shadow 0.3s' }}
      >
        {isPatron && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(197,160,89,0.15),_transparent_60%)] pointer-events-none" />}
        {isArtist && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(188,75,26,0.08),_transparent_60%)] pointer-events-none" />}

        <div className="p-8 md:p-10 flex flex-col flex-1">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${isPatron ? 'text-art-gold' : isArtist ? 'text-art-primary' : 'text-stone-400'}`}>
                {plan.id === 'guest' ? '✏️ FREE' : plan.id === 'artist' ? '🎨 ARTIST' : '👑 PATRON'}
              </span>
              {isCurrent && <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-green-100 text-green-600">当前方案</span>}
            </div>
            <h3 className="font-serif text-3xl tracking-tight mb-1">{t(`membership.plans.${plan.id}_name`)}</h3>
            <p className={`text-xs font-light ${isPatron ? 'text-white/50' : 'text-stone-400'}`}>{plan.description}</p>
          </div>

          <div className="mb-8 flex items-end gap-2">
            <span className="font-serif text-5xl tracking-tighter">{plan.price}</span>
            <span className={`text-xs mb-1.5 ${isPatron ? 'text-white/40' : 'text-stone-400'}`}>{plan.period}</span>
          </div>

          <div className="space-y-3 mb-8 flex-1">
            {plan.features.map((f: string, i: number) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={`mt-0.5 shrink-0 ${isPatron ? 'text-art-gold' : isArtist ? 'text-art-primary' : 'text-stone-400'}`}>
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className={`font-light leading-snug ${isPatron ? 'text-white/80' : ''}`}>{f}</span>
              </div>
            ))}
          </div>

          <button onClick={onSelect} disabled={isCurrent || isProcessing}
            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-2 active:scale-[0.97]
              ${isCurrent ? 'bg-stone-100 text-stone-300 cursor-default' :
                isPatron ? 'bg-art-gold text-black hover:brightness-110 shadow-[0_8px_30px_rgba(197,160,89,0.4)]' :
                'bg-stone-900 text-white hover:bg-art-primary shadow-lg'}`}>
            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : isCurrent ? '✓ 当前方案' : t('membership.card.sign_pact')}
            {!isCurrent && !isProcessing && <ArrowRight size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── FAQ Item ───────────────────────────────────────────────────────────────
const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-100 dark:border-white/10 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left gap-4 group">
        <span className="font-medium text-stone-800 dark:text-stone-200 group-hover:text-art-primary transition-colors">{q}</span>
        <ChevronDown size={16} className={`shrink-0 text-stone-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">{a}</p>
      </div>
    </div>
  );
};
// ── Main Component ─────────────────────────────────────────────────────────
const Membership: React.FC<MembershipProps> = ({ currentTier, onUpgrade, onClose }) => {
  const [processingTier, setProcessingTier] = useState<UserTier | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const { t } = useLanguage();
  const countdown = useCountdown();

  const handleSelect = async (tier: UserTier) => {
    if (tier === currentTier) return;
    setProcessingTier(tier); setErrorMessage(null);
    try {
      await onUpgrade(tier);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (e: any) {
      if (e.message !== 'AUTH_REQUIRED') setErrorMessage(e.message || t('membership.error'));
    } finally { setProcessingTier(null); }
  };

  const handleClose = () => { setIsExiting(true); setTimeout(() => onClose?.(), 500); };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className={`min-h-screen bg-[#fafaf9] dark:bg-stone-950 text-stone-900 dark:text-white relative overflow-x-hidden transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-16 md:pt-20 pb-32 scroll-container overflow-y-auto">

        {/* ── Hero ── */}
        <div className="text-center mb-12 md:mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-art-gold/10 text-art-gold mb-6 md:mb-8 border border-art-gold/20 text-[9px] font-black uppercase tracking-[0.5em]">
            <Crown size={12} className="animate-pulse" /> 会员专属
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-8xl xl:text-9xl tracking-tighter leading-[0.9] mb-6 md:mb-8">
            解锁<br /><span className="italic text-stone-300">无限</span>创作
          </h1>
          <p className="text-stone-500 font-light max-w-xl mx-auto text-base md:text-lg leading-relaxed">
            每天一杯咖啡的价格，换来 AI 艺术创作的完整体验。
          </p>
        </div>

        {/* ── Social Proof Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12 md:mb-20">
          {[
            { val: 12847, suffix: '+', label: '活跃创作者' },
            { val: 580000, suffix: '+', label: 'AI 作品生成' },
            { val: 98, suffix: '%', label: '用户满意度' },
            { val: 50, suffix: '+', label: '大师修复关卡' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-stone-900 rounded-2xl md:rounded-3xl p-4 md:p-6 text-center border border-stone-100 dark:border-white/10 shadow-sm">
              <p className="font-mono text-2xl md:text-4xl text-stone-900 font-bold mb-1">
                <AnimatedNumber value={s.val} suffix={s.suffix} />
              </p>
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center gap-3 text-red-600 text-sm font-medium max-w-lg mx-auto">
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}

        {/* ── Pricing Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-8">
          {PRICING_PLANS.map((plan, i) => (
            <MembershipCard key={plan.id} plan={plan} isCurrent={plan.id === currentTier}
              isProcessing={processingTier === plan.id} onSelect={() => handleSelect(plan.id as UserTier)}
              t={t} isPopular={plan.id === 'artist'} />
          ))}
        </div>

        {/* ── Guarantee ── */}
        <div className="flex items-center justify-center gap-3 text-stone-400 text-xs mb-24">
          <ShieldCheck size={16} className="text-green-500" />
          <span>7 天无理由退款 · SSL 加密支付 · 随时取消</span>
        </div>
        {/* ── Feature Comparison Table ── */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-art-gold mb-3">详细对比</p>
            <h2 className="font-serif text-5xl tracking-tighter">功能<span className="italic text-stone-300">一览</span></h2>
          </div>
          <div className="overflow-x-auto rounded-[32px] border border-stone-100 dark:border-white/10 shadow-sm">
            <div className="bg-white dark:bg-stone-900 min-w-[480px]">
              <div className="grid grid-cols-4 bg-stone-50 dark:bg-stone-800 border-b border-stone-100 dark:border-white/10">
                <div className="p-4 md:p-5 text-xs font-black uppercase tracking-widest text-stone-400">功能</div>
                {['速写客', '创作者', '赞助人'].map((n, i) => (
                  <div key={i} className={`p-4 md:p-5 text-center text-xs font-black uppercase tracking-widest ${i === 1 ? 'text-art-primary' : i === 2 ? 'text-art-gold' : 'text-stone-400'}`}>{n}</div>
                ))}
              </div>
              {COMPARE_ROWS.map((row, i) => (
                <div key={i} className={`grid grid-cols-4 border-b border-stone-50 last:border-0 ${i % 2 === 0 ? '' : 'bg-stone-50/50'}`}>
                  <div className="p-3 md:p-4 text-sm text-stone-600 font-medium flex items-center">{row.label}</div>
                  {[row.guest, row.artist, row.patron].map((val, j) => (
                    <div key={j} className="p-3 md:p-4 flex items-center justify-center">
                      {typeof val === 'boolean' ? (
                        val ? <Check size={16} className={j === 1 ? 'text-art-primary' : j === 2 ? 'text-art-gold' : 'text-stone-400'} strokeWidth={3} />
                             : <X size={14} className="text-stone-200" />
                      ) : (
                        <span className={`text-xs font-bold ${j === 1 ? 'text-art-primary' : j === 2 ? 'text-art-gold' : 'text-stone-400'}`}>{val}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Testimonials ── */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-art-gold mb-3">用户评价</p>
            <h2 className="font-serif text-5xl tracking-tighter">他们<span className="italic text-stone-300">怎么说</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white dark:bg-stone-900 rounded-[28px] p-8 border border-stone-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={12} className="fill-art-gold text-art-gold" />)}
                </div>
                <p className="text-stone-600 font-light leading-relaxed mb-6 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif text-sm font-bold">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-sm text-stone-900">{t.name}</p>
                    <p className="text-xs text-stone-400">{t.role} · {t.tier}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mb-24 max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-art-gold mb-3">常见问题</p>
            <h2 className="font-serif text-5xl tracking-tighter">你可能<span className="italic text-stone-300">想知道</span></h2>
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-[28px] border border-stone-100 dark:border-white/10 px-8 shadow-sm">
            {FAQ.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>

        {/* ── Final CTA ── */}
        <div className="text-center bg-stone-900 rounded-[28px] md:rounded-[40px] p-8 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(197,160,89,0.15),_transparent_70%)] pointer-events-none" />
          <Crown size={32} className="text-art-gold mx-auto mb-6 animate-pulse" />
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white tracking-tighter mb-4">现在加入<span className="italic text-art-gold">创作者</span></h2>
          <p className="text-white/50 font-light mb-8 md:mb-10 max-w-md mx-auto text-sm md:text-base">与 12,000+ 艺术创作者一起，用 AI 重新定义艺术创作。</p>
          <button onClick={() => handleSelect('artist')} disabled={currentTier !== 'guest' || !!processingTier}
            className="inline-flex items-center gap-3 px-8 md:px-12 py-4 md:py-5 bg-art-gold text-black font-black uppercase tracking-[0.3em] text-xs rounded-full hover:brightness-110 transition-all shadow-[0_8px_40px_rgba(197,160,89,0.4)] active:scale-95 disabled:opacity-50">
            {processingTier === 'artist' ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14} /> 立即订阅 · ¥39/月</>}
          </button>
          <p className="text-white/30 text-xs mt-6">7 天无理由退款 · 随时取消</p>
        </div>
      </div>

      {/* ── Success overlay ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-white/90 backdrop-blur-md flex items-center justify-center animate-fade-in" onClick={() => setShowSuccess(false)}>
          <div className="text-center space-y-6 animate-scale-in">
            <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl"><CheckCircle size={48} /></div>
            <h3 className="font-serif text-5xl italic text-stone-900">{t('membership.success_fullscreen.title')}</h3>
            <p className="text-stone-500 font-light">{t('membership.success_fullscreen.description')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
