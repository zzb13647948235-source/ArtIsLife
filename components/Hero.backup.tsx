
import React, { useEffect, useState } from 'react';
import { ViewState } from '../types';
import { PlayCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroProps {
  onNavigate: (view: ViewState) => void;
  isActive?: boolean;
}

const HERO_IMAGES = [
  {
    id: 'mona-lisa',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/600px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    rotation: -12, zIndex: 10, scale: 0.8,
    targetX: -350, targetY: -150, isMain: false
  },
  {
    id: 'starry-night',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/600px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    rotation: 8, zIndex: 20, scale: 0.85,
    targetX: 300, targetY: -220, isMain: false
  },
  {
    id: 'pearl',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/600px-1665_Girl_with_a_Pearl_Earring.jpg',
    rotation: 0, zIndex: 60, scale: 1, isMain: true,
    targetX: 0, targetY: 0
  },
  {
    id: 'night-watch',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/800px-The_Night_Watch_-_HD.jpg',
    rotation: 15, zIndex: 15, scale: 0.75,
    targetX: -280, targetY: 220, isMain: false
  },
  {
    id: 'great-wave',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Great_Wave_off_Kanagawa2.jpg/800px-Great_Wave_off_Kanagawa2.jpg',
    rotation: 5, zIndex: 5, scale: 0.65,
    targetX: 420, targetY: 20, isMain: false
  },
  {
    id: 'birth-of-venus',
    url: '/artworks/paintings/Birth of Venus.jpg',
    rotation: -6, zIndex: 8, scale: 0.7,
    targetX: -440, targetY: 80, isMain: false
  },
  {
    id: 'the-swing',
    url: '/artworks/paintings/The Swing.jpg',
    rotation: 10, zIndex: 12, scale: 0.72,
    targetX: 380, targetY: 190, isMain: false
  }
];

const BrushText: React.FC<{ text: string; delay?: number; className?: string }> = ({ text, delay = 0, className = '' }) => {
    return (
        <span className={`inline-block whitespace-nowrap ${className}`} aria-label={text}>
            {text.split('').map((char, i) => (
                <span 
                    key={i} 
                    className="inline-block opacity-0 animate-apple-reveal" 
                    style={{ animationDelay: `${delay + (i * 0.04)}s` }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
};

const Marquee: React.FC = () => {
    const items = ["IMPRESSIONISM", "REALISM", "SURREALISM", "RENAISSANCE", "BAROQUE", "CUBISM", "POP ART", "ABSTRACT"];
    return (
        <div className="absolute bottom-0 left-0 w-full overflow-hidden py-6 bg-white/5 backdrop-blur-[1px] border-t border-white/10 z-20 pointer-events-none">
            <div className="flex animate-marquee whitespace-nowrap">
                {[...items, ...items, ...items].map((item, i) => (
                    <span key={i} className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-stone-400/50 mx-8 flex items-center gap-4">
                        {item} <div className="w-1 h-1 bg-art-primary rounded-full opacity-50"></div>
                    </span>
                ))}
            </div>
        </div>
    );
}

const Hero: React.FC<HeroProps> = ({ onNavigate, isActive = true }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); 
  const [isAnimateStart, setIsAnimateStart] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (isActive) {
        setIsAnimateStart(false);
        // 延迟启动动画，等待 Preloader 幕布动画完成
        const timer = setTimeout(() => setIsAnimateStart(true), 800); 
        return () => clearTimeout(timer);
    }
  }, [isActive]);

  useEffect(() => {
    const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;
    const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        requestAnimationFrame(() => setMousePos({ x, y }));
    };
    if (isActive) window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  return (
    <div className="relative h-full w-full bg-transparent text-stone-900 flex items-center overflow-hidden perspective-2000">
      
      {/* Background Layer */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div 
             className="absolute top-[20%] left-[-10%] text-[20vw] font-serif text-art-primary opacity-[0.02] leading-none select-none mix-blend-multiply whitespace-nowrap"
             style={{ 
                 transform: `rotate(-5deg) translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
                 transition: 'transform 0.2s ease-out'
             }}
          >
              MASTERPIECE
          </div>
      </div>

      <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 h-full">
        
        <div className="lg:col-span-6 flex flex-col justify-center relative z-20 pt-24 lg:pt-0">
              <div className="flex items-center gap-6 mb-8 animate-fade-in group cursor-default">
                  <div className="w-16 h-[1px] bg-art-primary origin-left transition-all duration-700 group-hover:w-24 group-hover:h-[2px]"></div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-art-primary/80 group-hover:text-art-primary transition-colors">{t('hero.est')}</span>
              </div>
              
              {/* Refined H1 Structure for better wrapping */}
              <h1 className="font-serif text-art-accent tracking-tighter select-none flex flex-col gap-1 md:gap-3 drop-shadow-sm relative z-30 mb-10 w-full">
                <span className="text-[12vw] lg:text-[7rem] leading-[0.9] block mix-blend-multiply transition-transform hover:scale-[1.02] origin-left duration-500">
                    <BrushText text={t('hero.title_1')} delay={0.2} />
                </span>
                <span className="text-[8vw] lg:text-[5rem] leading-[1] block italic font-light text-stone-400 pl-2 lg:pl-16">
                    <BrushText text={t('hero.title_2')} delay={0.6} />
                </span>
                <span className="text-[12vw] lg:text-[7.5rem] leading-[0.9] block text-art-primary pb-2">
                    <BrushText text={t('hero.title_3')} delay={1.0} />
                </span>
              </h1>

           <div className="relative pl-8 border-l-2 border-art-primary/20 max-w-lg animate-fade-in-up delay-[1400ms]">
              <p className="text-lg md:text-xl text-stone-500 font-light leading-relaxed">
                  {t('hero.subtitle')}
              </p>
           </div>

           <div className="flex flex-wrap gap-6 mt-10 animate-fade-in-up delay-[1600ms]">
              <button onClick={() => onNavigate('game')} className="group relative px-10 py-5 bg-art-accent text-white rounded-full overflow-hidden shadow-hard hover:-translate-y-1 transition-all duration-500 active:scale-95">
                 <div className="absolute inset-0 w-full h-full bg-art-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)]"></div>
                 <div className="relative z-10 flex items-center gap-3">
                    <PlayCircle size={18} className="group-hover:fill-white/20 transition-all" /> 
                    <span className="font-bold uppercase tracking-[0.25em] text-xs">{t('hero.btn_start')}</span>
                 </div>
              </button>
              <button onClick={() => onNavigate('gallery')} className="group flex items-center gap-3 px-8 py-5 rounded-full border border-stone-200 hover:border-art-accent bg-white/40 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95">
                 <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-800 group-hover:text-art-accent">{t('hero.btn_create')}</span>
                 <ArrowRight size={16} className="text-art-primary group-hover:translate-x-1 transition-transform"/>
              </button>
           </div>
        </div>

        <div className="hidden lg:flex lg:col-span-6 relative items-center justify-center mt-12 lg:mt-0 h-full pointer-events-none">
            <div className="relative w-full max-w-[500px] aspect-square z-10 flex items-center justify-center">
                {HERO_IMAGES.map((img, index) => {
                    const arrivalDelay = index * 120;
                    const parallaxX = mousePos.x * (10 + index * 4);
                    const parallaxY = mousePos.y * (10 + index * 4);
                    
                    return (
                        <div 
                          key={img.id}
                          className={`absolute transition-all will-change-transform ${isAnimateStart ? 'opacity-100' : 'opacity-0'}`}
                          style={{
                            zIndex: img.zIndex,
                            width: img.isMain ? '100%' : '50%',
                            maxWidth: img.isMain ? '360px' : '220px',
                            transitionDuration: isAnimateStart ? '1.8s' : '0.1s',
                            transitionDelay: isAnimateStart ? `${arrivalDelay}ms` : '0ms',
                            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                            transform: isAnimateStart 
                              ? `translate3d(${img.targetX + parallaxX}px, ${img.targetY + parallaxY}px, 0) rotate(${img.rotation + mousePos.x * 5}deg) scale(${img.scale})`
                              : `translate3d(150vw, -150vh, 0) rotate(180deg) scale(0.2)`
                          }}
                        >
                          <div className="w-full aspect-[3/4] bg-white p-2 md:p-3 shadow-hard rounded-sm border border-stone-100 relative overflow-hidden group pointer-events-auto ring-1 ring-black/5 transform hover:scale-105 transition-all">
                              <div className="w-full h-full relative overflow-hidden bg-stone-200">
                                  <img src={img.url} className="w-full h-full object-cover" alt={img.id} />
                              </div>
                          </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
      <Marquee />
    </div>
  );
};

export default Hero;
