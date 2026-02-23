
import React, { useState, useRef, useEffect } from 'react';
import { PRICING_PLANS } from '../constants';
import { Check, Crown, Loader2, Sparkles, X, ArrowRight, ShieldCheck, Zap, Diamond, Award, Star, AlertCircle, CheckCircle, Palette, MessageSquare, Gift, Ticket, Users, TrendingUp } from 'lucide-react';
import { UserTier } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface MembershipProps {
  currentTier: UserTier;
  onUpgrade: (tier: UserTier) => Promise<void>;
  onClose?: () => void;
}

const MembershipCard: React.FC<{ 
    plan: any; 
    isCurrent: boolean; 
    isProcessing: boolean; 
    onSelect: () => void;
    t: any;
}> = ({ plan, isCurrent, isProcessing, onSelect, t }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 20;
        const y = -(e.clientY - rect.top - rect.height / 2) / 20;
        setTilt({ x, y });
    };

    const isPatron = plan.id === 'patron';
    const isArtist = plan.id === 'artist';

    return (
        <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} className="h-full perspective-1000">
            <div 
                className={`h-full relative p-10 md:p-12 rounded-[48px] flex flex-col justify-between overflow-hidden transition-all duration-300 transform-gpu border
                    ${isPatron 
                        ? 'bg-[#111] border-art-gold/30 text-white shadow-[0_40px_80px_-20px_rgba(197,160,89,0.25)]' 
                        : isArtist 
                            ? 'bg-white border-stone-200 text-stone-900 shadow-xl' 
                            : 'bg-stone-50 border-stone-100 text-stone-600'
                    }
                    ${isCurrent ? 'ring-2 ring-art-primary/40' : ''}`}
                style={{ transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}
            >
                {isPatron && <div className="absolute -top-24 -right-24 w-64 h-64 bg-art-gold/10 blur-[100px] rounded-full"></div>}
                {isArtist && <div className="absolute -top-16 -left-16 w-48 h-48 bg-art-primary/10 blur-[80px] rounded-full"></div>}
                
                <div>
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">
                                    {plan.id === 'guest' ? '✏️' : plan.id === 'artist' ? '🎨' : '👑'}
                                </span>
                                <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isPatron ? 'text-art-gold' : 'text-stone-400'}`}>
                                    {plan.id.toUpperCase()}
                                </p>
                            </div>
                            <h3 className="font-serif text-4xl leading-none tracking-tight">{t(`membership.plans.${plan.id}_name`)}</h3>
                        </div>
                        {plan.highlight && (
                            <div className="bg-art-primary text-white text-[8px] font-bold uppercase tracking-[0.3em] px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                                {t('membership.card.most_chosen')}
                            </div>
                        )}
                    </div>

                    <div className="mb-10 flex items-baseline gap-2">
                        <span className="text-6xl font-serif tracking-tighter">{plan.price}</span>
                        <span className="text-xs opacity-40 font-mono italic">{plan.period}</span>
                    </div>

                    <div className="space-y-4 mb-12">
                        {plan.features.map((f: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 text-sm group/item">
                                <div className={`mt-0.5 shrink-0 transition-transform group-hover/item:scale-110 ${isPatron ? 'text-art-gold' : isArtist ? 'text-art-primary' : 'text-stone-400'}`}>
                                    <ShieldCheck size={15} />
                                </div>
                                <span className="font-light leading-snug">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={onSelect}
                    disabled={isCurrent || isProcessing}
                    className={`w-full py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 active:scale-[0.97]
                        ${isCurrent 
                            ? 'bg-stone-100 text-stone-300 border border-stone-200 cursor-default' 
                            : isPatron 
                                ? 'bg-art-gold text-black hover:brightness-110 shadow-xl' 
                                : 'bg-stone-900 text-white hover:bg-art-primary shadow-xl'
                        }`}
                >
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : (
                        isCurrent ? t('membership.card.current_master') : t('membership.card.sign_pact')
                    )}
                </button>
            </div>
        </div>
    );
};

const Membership: React.FC<MembershipProps> = ({ currentTier, onUpgrade, onClose }) => {
  const [processingTier, setProcessingTier] = useState<UserTier | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const { t } = useLanguage();

  const handleSelect = async (tier: UserTier) => {
      if (tier === currentTier) return;
      setProcessingTier(tier);
      setErrorMessage(null);
      try {
          await onUpgrade(tier);
          setShowSuccess(true);
          setTimeout(() => { setShowSuccess(false); }, 1500);
      } catch (e: any) {
          if (e.message !== "AUTH_REQUIRED") {
              setErrorMessage(e.message || t('membership.error'));
          }
      } finally {
          setProcessingTier(null);
      }
  };

  const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => { onClose?.(); }, 500);
  };

  const benefitHighlights = [
      { icon: <Zap size={24}/>, title: 'AI 极速渲染', desc: '基于 Gemini 2.5 Flash 的毫秒级图像生成，比传统方式快 10 倍。支持实时预览和迭代优化。', bg: 'bg-stone-900', color: 'text-white' },
      { icon: <Palette size={24}/>, title: '无限创作 & 交易', desc: '不限次数的 AI 艺术创作，并可在藏馆市场上架交易，用 ArtCoin 赚取收益。', bg: 'bg-art-gold', color: 'text-white' },
      { icon: <Award size={24}/>, title: '专属数字版权', desc: '所有 AI 创作作品均享有数字水印认证，区块链存证确保您的创作权益。', bg: 'bg-blue-600', color: 'text-white' },
      { icon: <Gift size={24}/>, title: '每月 ArtCoin 奖励', desc: '订阅会员每月自动获得 ArtCoin 奖励，用于藏馆购买、竞拍和解锁高级内容。', bg: 'bg-purple-600', color: 'text-white' },
      { icon: <MessageSquare size={24}/>, title: 'AI 艺术顾问', desc: '与 Gemini 驱动的专业艺术顾问无限对话，获取创作灵感、画作鉴赏和艺术史知识。', bg: 'bg-green-600', color: 'text-white' },
      { icon: <Ticket size={24}/>, title: '限定活动特权', desc: '优先参与限时拍卖、稀有藏品首发、线下艺术展览特邀通道等专属活动。', bg: 'bg-red-600', color: 'text-white' },
  ];

  return (
    <div className={`min-h-screen bg-white text-stone-900 pt-32 pb-24 relative flex flex-col items-center scroll-container overflow-y-auto transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      
      {onClose && (
          <button onClick={handleClose} className="fixed top-24 right-8 md:top-32 md:right-12 z-[150] p-4 rounded-full bg-white shadow-xl hover:bg-stone-50 text-stone-400 hover:text-stone-900 transition-all border border-stone-100 group" title={t('membership.close_button_title')}>
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
      )}

      <div className="max-w-[1200px] w-full mx-auto px-6 relative z-10">
          
          <div className="text-center mb-24 animate-fade-in">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-art-gold/10 text-art-gold mb-8 border border-art-gold/20 shadow-inner">
                  <Crown size={16} className="animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em]">{t('membership.title')}</span>
              </div>
              <h2 className="font-serif text-7xl md:text-8xl mb-8 tracking-tighter leading-none text-stone-900">
                  {t('membership.headline.line1')}<span className="italic text-stone-300">{t('membership.headline.line2')}</span>
              </h2>
              <p className="text-stone-500 font-light max-w-2xl mx-auto text-xl leading-relaxed italic">
                  {t('membership.description')}
              </p>
          </div>

          {errorMessage && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center gap-3 text-red-600 text-sm font-medium animate-shake max-w-lg mx-auto">
                <AlertCircle size={18} /> {errorMessage}
            </div>
          )}

          {showSuccess && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center animate-fade-in" id="success-modal">
                <div className="bg-white p-12 rounded-[40px] shadow-2xl text-center space-y-6 animate-scale-in border border-green-100 text-green-700">
                    <CheckCircle size={48} className="text-green-500 mx-auto" />
                    <h3 className="font-serif text-3xl font-bold">{t('membership.success_modal.title')}</h3>
                    <p className="text-stone-500">{t('membership.success_modal.description')}</p>
                </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
              {PRICING_PLANS.map(plan => (
                  <MembershipCard 
                    key={plan.id} plan={plan} isCurrent={plan.id === currentTier}
                    isProcessing={processingTier === plan.id} onSelect={() => handleSelect(plan.id as UserTier)} t={t}
                  />
              ))}
          </div>

          {/* Detailed Benefits Grid */}
          <div className="mt-32 mb-16">
              <div className="text-center mb-16">
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-art-gold mb-4">Why Subscribe</p>
                  <h3 className="font-serif text-5xl md:text-6xl tracking-tighter text-stone-900">会员专属<span className="italic text-stone-300">权益</span></h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {benefitHighlights.map((b, i) => (
                      <div key={i} className="group p-8 bg-stone-50 rounded-[32px] border border-stone-100 hover:border-stone-200 transition-all hover:shadow-xl hover:-translate-y-1">
                          <div className={`w-14 h-14 ${b.bg} ${b.color} rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>{b.icon}</div>
                          <h4 className="font-serif text-2xl text-stone-900 mb-3">{b.title}</h4>
                          <p className="text-sm text-stone-400 font-light leading-loose">{b.desc}</p>
                      </div>
                  ))}
              </div>
          </div>

          {/* Social Proof / Stats */}
          <div className="mt-16 mb-12 p-12 bg-stone-900 rounded-[40px] text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                      <p className="font-mono text-4xl md:text-5xl text-art-gold mb-2">12K+</p>
                      <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">活跃创作者</p>
                  </div>
                  <div>
                      <p className="font-mono text-4xl md:text-5xl text-art-gold mb-2">580K+</p>
                      <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">AI 作品生成</p>
                  </div>
                  <div>
                      <p className="font-mono text-4xl md:text-5xl text-art-gold mb-2">98%</p>
                      <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">用户满意度</p>
                  </div>
                  <div>
                      <p className="font-mono text-4xl md:text-5xl text-art-gold mb-2">50+</p>
                      <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">大师修复关卡</p>
                  </div>
              </div>
          </div>
      </div>

      {/* Full-screen Success State */}
      {showSuccess && (
          <div id="success-modal" className="fixed inset-0 z-[200] bg-white flex items-center justify-center animate-fade-in transition-all duration-500 ease-out" onClick={() => setShowSuccess(false)}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40"></div>
              <div className="relative text-center space-y-10 max-w-md animate-scale-in">
                  <div className="w-28 h-28 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl border-8 border-green-50"><ShieldCheck size={56} /></div>
                  <div className="space-y-4">
                    <h3 className="font-serif text-5xl italic text-stone-900">{t('membership.success_fullscreen.title')}</h3>
                    <p className="text-stone-500 font-light text-lg leading-relaxed px-10">{t('membership.success_fullscreen.description')}</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Membership;
