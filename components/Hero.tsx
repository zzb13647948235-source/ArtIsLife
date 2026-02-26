
import React, { useEffect, useRef, useState } from 'react';
import { ViewState } from '../types';
import { PlayCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Sparkle from './Sparkle';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import LottieFeatures from './LottieFeatures';
import HeroPromo from './HeroPromo';
import MagneticButton from './MagneticButton';

gsap.registerPlugin(Draggable);

interface HeroProps {
  onNavigate: (view: ViewState) => void;
  isActive?: boolean;
}

const HERO_IMAGES = [
  {
    id: 'mona-lisa',
    url: '/artworks/paintings/The Isleworth Mona Lisa.jpg',
    hoverUrl: '/artworks/paintings/The Isleworth Mona Lisa.jpg',
    rotation: -12, zIndex: 10, scale: 0.8,
    targetX: -350, targetY: -150, isMain: false
  },
  {
    id: 'starry-night',
    url: '/artworks/paintings/Van Gogh - The Starry Night.jpg',
    hoverUrl: '/artworks/paintings/Van Gogh - The Starry Night.jpg',
    rotation: 8, zIndex: 20, scale: 0.85,
    targetX: 300, targetY: -220, isMain: false
  },
  {
    id: 'pearl',
    url: '/artworks/paintings/Vermeer - Girl with a Pearl Earring.jpg',
    hoverUrl: '/artworks/paintings/Vermeer - Girl with a Pearl Earring.jpg',
    rotation: 0, zIndex: 60, scale: 1, isMain: true,
    targetX: 0, targetY: 0
  },
  {
    id: 'night-watch',
    url: '/artworks/paintings/Rembrandt - The Night Watch.jpg',
    hoverUrl: '/artworks/paintings/Rembrandt - The Night Watch.jpg',
    rotation: 15, zIndex: 15, scale: 0.75,
    targetX: -280, targetY: 220, isMain: false
  },
  {
    id: 'great-wave',
    url: '/artworks/paintings/Aivazovsky - The Ninth Wave.jpg',
    hoverUrl: '/artworks/paintings/Aivazovsky - The Ninth Wave.jpg',
    rotation: 5, zIndex: 5, scale: 0.65,
    targetX: 420, targetY: 20, isMain: false
  },
  {
    id: 'birth-of-venus',
    url: '/artworks/paintings/Birth of Venus.jpg',
    hoverUrl: '/artworks/paintings/Birth of Venus.jpg',
    rotation: -6, zIndex: 8, scale: 0.7,
    targetX: -440, targetY: 80, isMain: false
  },
  {
    id: 'the-swing',
    url: '/artworks/paintings/The Swing.jpg',
    hoverUrl: '/artworks/paintings/The Swing.jpg',
    rotation: 10, zIndex: 12, scale: 0.72,
    targetX: 380, targetY: 190, isMain: false
  }
];

// Original per-letter apple-reveal animation
const BrushText: React.FC<{ text: string; delay?: number; className?: string; colorOffset?: number }> = ({
  text, delay = 0, className = '',
}) => {
  return (
    <span className={`inline-block ${className}`} aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block opacity-0 animate-apple-reveal"
          style={{ animationDelay: `${delay + i * 0.04}s` }}
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
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-20 pointer-events-none border-t-2 border-b-0 border-stone-900">
            <div className="flex animate-marquee whitespace-nowrap py-4 bg-art-bg">
                {[...items, ...items, ...items].map((item, i) => (
                    <span key={i} className="text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-stone-900 mx-6 md:mx-10 flex items-center gap-4 md:gap-6">
                        {item}
                        <svg width="8" height="8" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                            <path d="M14 0L15.8 12.2L28 14L15.8 15.8L14 28L12.2 15.8L0 14L12.2 12.2Z" fill="currentColor" className="text-art-primary"/>
                        </svg>
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

  // 画作拖拽效果
  useEffect(() => {
    if (!isAnimateStart) return;
    const cards = document.querySelectorAll<HTMLElement>('.hero-painting-card');

    // hover 放大
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => gsap.to(card, { scale: 1.06, duration: 0.3, ease: 'power2.out' }));
      card.addEventListener('mouseleave', () => gsap.to(card, { scale: 1, duration: 0.4, ease: 'power2.out' }));
    });

    const instances = Draggable.create(cards, {
      type: 'x,y',
      inertia: false,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onDragStart(this: Draggable) {
        gsap.to(this.target, { scale: 1.1, boxShadow: '0 30px 60px rgba(0,0,0,0.3)', duration: 0.2 });
      },
      onDrag(this: Draggable) {
        gsap.set(this.target, { rotation: this.x * 0.06 });
      },
      onDragEnd(this: Draggable) {
        const dist = Math.hypot(this.x, this.y);
        gsap.to(this.target, {
          x: 0, y: 0, rotation: 0, scale: 1,
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          duration: dist > 100 ? 1.4 : 0.9,
          ease: 'elastic.out(1, 0.55)',
        });
      },
    });
    return () => instances.forEach(d => d.kill());
  }, [isAnimateStart]);

  return (
    <div className="relative w-full h-full bg-transparent text-stone-900">
      {/* Hero full-height section */}
      <div className="relative h-full flex items-center overflow-hidden perspective-2000">
      
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
        
        <div className="lg:col-span-6 flex flex-col justify-center relative z-20 pt-4 md:pt-8 lg:pt-0 min-w-0">
              <div className="flex items-center gap-4 mb-8 animate-fade-in">
                  <div className="w-8 h-[1px] bg-art-primary"></div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-art-primary/80">{t('hero.est')}</span>
              </div>

              {/* Original serif title */}
              <h1 className="font-serif text-art-accent tracking-tighter select-none flex flex-col gap-1 md:gap-3 drop-shadow-sm relative z-30 mb-6 w-full overflow-hidden">
                <Sparkle size={32} opacity={0.9} className="absolute -top-4 left-[30%] text-art-primary" style={{ animationDelay: '0s' }} />
                <Sparkle size={18} opacity={0.5} className="absolute top-8 left-[55%] text-art-accent" style={{ animationDelay: '0.6s' }} />
                <Sparkle size={24} opacity={0.7} className="absolute top-2 right-8 text-art-gold" style={{ animationDelay: '1.2s' }} />
                <Sparkle size={14} opacity={0.4} variant="circle" className="absolute top-16 left-[20%] text-art-primary" style={{ animationDelay: '1.8s' }} />
                <Sparkle size={10} opacity={0.35} variant="circle" className="absolute -top-2 left-[70%] text-art-muted" style={{ animationDelay: '0.9s' }} />

                <span className="leading-[0.9] block mix-blend-multiply transition-transform hover:scale-[1.02] origin-left duration-500" style={{ fontSize: 'clamp(2rem, 10vw, 13rem)' }}>
                    <BrushText text={t('hero.title_1')} delay={0.2} />
                </span>
                <span className="leading-[1] block italic font-light text-stone-400 pl-2 lg:pl-16" style={{ fontSize: 'clamp(1.5rem, 7vw, 8.5rem)' }}>
                    <BrushText text={t('hero.title_2')} delay={0.5} />
                </span>
                <span className="leading-[0.9] block text-art-primary pb-2" style={{ fontSize: 'clamp(2rem, 10vw, 13.5rem)' }}>
                    <BrushText text={t('hero.title_3')} delay={0.8} />
                </span>

                <Sparkle size={28} opacity={0.8} className="absolute bottom-4 left-[10%] text-art-primary" style={{ animationDelay: '0.4s' }} />
                <Sparkle size={16} opacity={0.45} className="absolute bottom-8 left-[45%] text-art-accent" style={{ animationDelay: '1.5s' }} />
                <Sparkle size={12} opacity={0.3} variant="circle" className="absolute bottom-2 right-12 text-art-gold" style={{ animationDelay: '2.1s' }} />
              </h1>

           <div className="relative pl-4 md:pl-6 border-l-2 border-art-primary/30 max-w-md animate-fade-in-up delay-[1200ms]">
              <p className="text-sm md:text-base text-stone-500 font-light leading-relaxed uppercase tracking-wide">
                  {t('hero.subtitle')}
              </p>
           </div>

           <div className="flex items-center gap-3 md:gap-4 mt-6 md:mt-8 animate-fade-in-up delay-[1400ms] flex-wrap">
              <MagneticButton>
                <button onClick={() => onNavigate('game')} className="group relative px-7 md:px-8 py-3.5 md:py-4 bg-art-accent text-white rounded-full overflow-hidden shadow-hard active:scale-95">
                   <div className="absolute inset-0 w-full h-full bg-art-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)]"></div>
                   <div className="relative z-10 flex items-center gap-3">
                      <PlayCircle size={16} className="group-hover:fill-white/20 transition-all" />
                      <span className="font-black uppercase tracking-[0.3em] text-xs">{t('hero.btn_start')}</span>
                   </div>
                </button>
              </MagneticButton>
              <MagneticButton>
                <button onClick={() => onNavigate('gallery')} className="group flex items-center gap-3 px-6 md:px-7 py-3.5 md:py-4 rounded-full border-2 border-stone-300 hover:border-art-accent bg-transparent transition-all duration-300 active:scale-95">
                   <span className="text-xs font-black uppercase tracking-[0.25em] text-stone-700 group-hover:text-art-accent">{t('hero.btn_create')}</span>
                   <ArrowRight size={14} className="text-art-primary group-hover:translate-x-1 transition-transform"/>
                </button>
              </MagneticButton>
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
                          <div className="hero-painting-card w-full aspect-[3/4] bg-white p-2 md:p-3 shadow-hard rounded-sm border border-stone-100 relative overflow-hidden group pointer-events-auto ring-1 ring-black/5">
                              <div className="w-full h-full relative overflow-hidden bg-stone-200">
                                  {/* base image */}
                                  <img src={img.url} className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" alt={img.id} />
                                  {/* hover image — fades in on hover */}
                                  <img src={img.hoverUrl} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-transform" alt={img.id} aria-hidden="true" />
                                  {/* 蒙娜丽莎眼睛跟踪 */}
                                  {img.id === 'mona-lisa' && (
                                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                      {[
                                        { top: '38%', left: '37%' },
                                        { top: '38%', left: '53%' },
                                      ].map((pos, i) => (
                                        <div key={i} className="absolute" style={{ top: pos.top, left: pos.left, width: '7%', height: '3.5%' }}>
                                          <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden">
                                            <div
                                              className="w-1.5 h-1.5 rounded-full bg-stone-900/50"
                                              style={{
                                                transform: `translate(${mousePos.x * 2.5}px, ${mousePos.y * 1.5}px)`,
                                                transition: 'transform 0.15s ease-out',
                                              }}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>
                          </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
      {/* MANA-style scroll indicator */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-fade-in pointer-events-none"
        style={{ animationDelay: '2s' }}>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-stone-400">Scroll</span>
        <div className="w-px h-10 bg-stone-300 origin-top" style={{
          animation: 'scrollLineCollapse 1.2s ease-in infinite',
          animationDelay: '2.2s'
        }} />
      </div>
      </div>{/* end hero h-screen */}

      {/* MANA-inspired Lottie features section */}
      <LottieFeatures />

    </div>
  );
};

export default Hero;
