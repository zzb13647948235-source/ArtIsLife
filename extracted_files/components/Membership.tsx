
import React, { useState, useRef, useEffect } from 'react';
import { PRICING_PLANS } from '../constants';
import { Check, Crown, Loader2, Sparkles, X, ArrowRight, ShieldCheck, Zap, Diamond, Award, Star } from 'lucide-react';
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
        <div 
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            className="h-full perspective-1000"
        >
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
                            <div className="bg-art-primary text-white text-[8px] font-bold uppercase tracking-[0.3em] px-3 py-1.5 rounded-full shadow-lg">
                                Most Chosen
                            </div>
                        )}
                    </div>

                    <div className="mb-10 flex items-baseline gap-2">
                        <span className="text-6xl font-serif tracking-tighter">{plan.price}</span>
                        <span className="text-xs opacity-40 font-mono italic">{plan.period}</span>
                    </div>

                    <div className="space-y-5 mb-12">
                        {plan.features.map((f: string, i: number) => (
                            <div key={i} className="flex items-start gap-4 text-sm">
                                <div className={`mt-0.5 shrink-0 ${isPatron ? 'text-art-gold' : 'text-art-primary'}`}>
                                    <ShieldCheck size={16} />
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
                        isCurrent ? 'Current Master' : '签署此契约'
                    )}
                </button>
            </div>
        </div>
    );
};

const Membership: React.FC<MembershipProps> = ({ currentTier, onUpgrade, onClose }) => {
  const [processingTier, setProcessingTier] = useState<UserTier | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExiting, setIsExiting] = useState(false); // New state for exit animation
  const { t } = useLanguage();

  const handleSelect = async (tier: UserTier) => {
      if (tier === currentTier) return;
      setProcessingTier(tier);
      try {
          await onUpgrade(tier);
          setShowSuccess(true);
          // Show success message briefly then fade out gracefully
          setTimeout(() => {
              // Trigger exit animation for the success modal
              const modal = document.getElementById('success-modal');
              if (modal) {
                  modal.classList.add('opacity-0', 'scale-95');
                  setTimeout(() => {
                      setShowSuccess(false);
                  }, 500); // Wait for fade out
              } else {
                  setShowSuccess(false);
              }
          }, 1500);
      } catch (e: any) {
          if (e.message !== "AUTH_REQUIRED") {
              alert("签署过程由于以太网波动被中断");
          }
      } finally {
          setProcessingTier(null);
      }
  };

  const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => {
          onClose?.();
      }, 500); // Match transition duration
  };

  return (
    <div className={`min-h-screen bg-white text-stone-900 pt-32 pb-24 relative flex flex-col items-center scroll-container overflow-y-auto transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      
      {onClose && (
          // Optimized position: moved slightly down and left to avoid overlap with top-right global navigation elements
          <button 
            onClick={handleClose} 
            className="fixed top-24 right-8 md:top-32 md:right-12 z-[150] p-4 rounded-full bg-white shadow-xl hover:bg-stone-50 text-stone-400 hover:text-stone-900 transition-all border border-stone-100 group"
            title="Return to previous page"
          >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
      )}

      <div className="max-w-[1200px] w-full mx-auto px-6 relative z-10">
          
          <div className="text-center mb-24 animate-fade-in">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-art-gold/10 text-art-gold mb-8 border border-art-gold/20 shadow-inner">
                  <Crown size={16} className="animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em]">The Patronage Program</span>
              </div>
              <h2 className="font-serif text-7xl md:text-8xl mb-8 tracking-tighter leading-none text-stone-900">
                  支持<span className="italic text-stone-300">经典，</span><br/>定义未来。
              </h2>
              <p className="text-stone-500 font-light max-w-2xl mx-auto text-xl leading-relaxed italic">
                  加入全球赞助人计划，消除创作边界，让每一次笔触都闪耀数字复兴的光芒。
              </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
              {PRICING_PLANS.map(plan => (
                  <MembershipCard 
                    key={plan.id}
                    plan={plan}
                    isCurrent={plan.id === currentTier}
                    isProcessing={processingTier === plan.id}
                    onSelect={() => handleSelect(plan.id as UserTier)}
                    t={t}
                  />
              ))}
          </div>

          {/* 补充权益卡片 */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-stone-100 pt-24 pb-12">
              <div className="space-y-6">
                  <div className="w-14 h-14 bg-stone-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Zap size={24}/></div>
                  <h4 className="font-serif text-2xl">瞬时渲染引擎</h4>
                  <p className="text-sm text-stone-400 font-light leading-loose">赞助人独享高优先级计算节点，在灵感闪现的瞬间完成杰作生成，无需等待。</p>
              </div>
              <div className="space-y-6">
                  <div className="w-14 h-14 bg-art-gold text-white rounded-2xl flex items-center justify-center shadow-lg"><Star size={24}/></div>
                  <h4 className="font-serif text-2xl">无限资产配额</h4>
                  <p className="text-sm text-stone-400 font-light leading-loose">大幅提升每日 AI 创作限额，通过参与艺术挑战获得双倍 ArtCoin 奖励。</p>
              </div>
              <div className="space-y-6">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Award size={24}/></div>
                  <h4 className="font-serif text-2xl">数字版权存证</h4>
                  <p className="text-sm text-stone-400 font-light leading-loose">所有生成的 4K 作品均获得基于 ArtIsLife 协议的唯一身份证明，保护您的艺术尊严。</p>
              </div>
          </div>
      </div>

      {/* 全屏成功状态 - 优化退出动画 */}
      {showSuccess && (
          <div 
            id="success-modal"
            className="fixed inset-0 z-[200] bg-white flex items-center justify-center animate-fade-in transition-all duration-500 ease-out" 
            onClick={() => setShowSuccess(false)}
          >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40"></div>
              <div className="relative text-center space-y-10 max-w-md animate-scale-in">
                  <div className="w-28 h-28 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl border-8 border-green-50">
                      <ShieldCheck size={56} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-serif text-5xl italic text-stone-900">契约生效</h3>
                    <p className="text-stone-500 font-light text-lg leading-relaxed px-10">
                        您的身份已获得画室验证。卓越的艺术特权现已注入您的账号。
                    </p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Membership;
