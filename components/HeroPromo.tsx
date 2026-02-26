import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { ViewState } from '../types';
import MagneticButton from './MagneticButton';

interface HeroPromoProps {
  onNavigate?: (v: ViewState) => void;
}

const useCountUp = (target: number, active: boolean, duration = 1400) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let current = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [active, target, duration]);
  return count;
};

const STATS = [
  { target: 100, suffix: '+', label: '艺术风格', delay: 0 },
  { target: 50,  suffix: 'K+', label: '用户创作', delay: 150 },
  { target: 500, suffix: '+', label: '馆藏名画', delay: 300 },
];

const HeroPromo: React.FC<HeroPromoProps> = ({ onNavigate }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const c0 = useCountUp(STATS[0].target, visible, 1200);
  const c1 = useCountUp(STATS[1].target, visible, 1400);
  const c2 = useCountUp(STATS[2].target, visible, 1000);
  const counts = [c0, c1, c2];

  return (
    <section className="w-full bg-stone-900 py-16 md:py-28 px-6 md:px-12 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-art-primary" />
      <div className="absolute -top-20 right-[10%] w-80 h-80 rounded-full bg-art-primary/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-[5%] w-60 h-60 rounded-full bg-art-primary/8 blur-[60px] pointer-events-none" />

      <div ref={ref} className="max-w-5xl mx-auto text-center relative z-10">

        {/* Eyebrow */}
        <div
          className="flex items-center justify-center gap-4 mb-6 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
        >
          <div className="w-8 h-px bg-art-primary/60" />
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-art-primary/80">开启艺术之旅</span>
          <div className="w-8 h-px bg-art-primary/60" />
        </div>

        {/* Giant text */}
        <div
          className="transition-all duration-1000"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(60px)' }}
        >
          <div className="font-black uppercase leading-[0.85] text-white tracking-[-0.04em]"
            style={{ fontSize: 'clamp(4rem, 14vw, 10rem)' }}>
            START
          </div>
          <div className="font-black uppercase leading-[0.85] text-art-primary tracking-[-0.04em]"
            style={{ fontSize: 'clamp(4rem, 14vw, 10rem)', marginTop: '-0.05em' }}>
            CREATING
          </div>
        </div>

        {/* Subtitle + CTA */}
        <div
          className="mt-10 transition-all duration-1000"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transitionDelay: '0.25s' }}
        >
          <p className="text-stone-400 text-base md:text-lg font-light max-w-sm mx-auto mb-10 leading-relaxed">
            每一笔都是你的表达。用 AI 点燃灵感，让艺术真正属于你。
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <MagneticButton>
              <button
                onClick={() => onNavigate?.('gallery')}
                className="group relative inline-flex items-center gap-3 px-10 py-4 bg-art-primary text-white rounded-full font-black uppercase tracking-[0.3em] text-xs overflow-hidden"
                style={{ boxShadow: '0 20px 60px -10px rgba(188,75,26,0.45)' }}
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)]" />
                <span className="relative z-10">立即开始</span>
                <ArrowRight size={13} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </MagneticButton>

            <MagneticButton>
              <button
                onClick={() => onNavigate?.('game')}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full border border-stone-600 hover:border-art-primary text-stone-400 hover:text-white font-black uppercase tracking-[0.25em] text-xs transition-all duration-300"
              >
                修复名画
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </MagneticButton>
          </div>
        </div>

        {/* Animated stats */}
        <div
          className="mt-10 md:mt-16 grid grid-cols-3 gap-4 md:gap-6 max-w-lg mx-auto transition-all duration-1000"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transitionDelay: '0.45s' }}
        >
          {STATS.map(({ suffix, label }, i) => (
            <div key={label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-white tracking-tight tabular-nums">
                {counts[i]}{suffix}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-stone-800" />
    </section>
  );
};

export default HeroPromo;
