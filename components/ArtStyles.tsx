import React, { useEffect, useRef, useState, useMemo, memo, useCallback } from 'react';
import { ART_STYLES } from '../constants';
import { ArrowUpRight, X, Info, Search, Loader2 } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { gsap } from 'gsap';

// Sticky follow-cursor label for each style row
const useStickyLabel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    posRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (labelRef.current) {
      gsap.to(labelRef.current, {
        x: posRef.current.x,
        y: posRef.current.y,
        duration: 0.4,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }
  }, []);

  const onMouseEnter = useCallback(() => setVisible(true), []);
  const onMouseLeave = useCallback(() => setVisible(false), []);

  return { containerRef, labelRef, visible, onMouseMove, onMouseEnter, onMouseLeave };
};

// --- HELPER & GENERIC COMPONENTS ---

const AppleText: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className = "", delay = 0 }) => (
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

const FadeInImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = "" }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {!loaded && (
                <div className="absolute inset-0 bg-stone-200 animate-pulse z-10 flex items-center justify-center">
                    <Loader2 size={24} className="text-stone-400 animate-spin opacity-50" />
                </div>
            )}
            <img 
                src={src} 
                alt={alt}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-1000 ease-out 
                    ${loaded ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-105 blur-lg'}
                `}
            />
        </div>
    );
};

const useTilt = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState({});
    const isTouchDevice = typeof window !== 'undefined' && (('ontouchstart' in window) || navigator.maxTouchPoints > 0);
    const onMouseMove = isTouchDevice ? undefined : (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 25;
        const y = (e.clientY - top - height / 2) / 25;
        setStyle({ transform: `rotateY(${x}deg) rotateX(${-y}deg) scale(1.02)` });
    };
    const onMouseLeave = isTouchDevice ? undefined : () => {
        setStyle({ transform: `rotateY(0deg) rotateX(0deg) scale(1)` });
    };
    return { ref, style, onMouseMove, onMouseLeave };
};

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const TiltFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { ref, style, onMouseMove, onMouseLeave } = useTilt();
    return (
        <div
          ref={ref}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          style={isMobile ? undefined : { ...style, transition: 'transform 0.1s ease-out' }}
          className={isMobile ? undefined : "perspective-1000"}
        >
            {children}
        </div>
    );
};

// --- REFACTORED & MEMOIZED COMPONENTS ---

// StyleRow: wraps each art style row with a sticky follow-cursor label
const StyleRow: React.FC<{ styleName: string; children: React.ReactNode; id?: string }> = ({ styleName, children, id }) => {
  const { containerRef, labelRef, visible, onMouseMove, onMouseEnter, onMouseLeave } = useStickyLabel();
  return (
    <div
      id={id}
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="group relative border-t border-stone-200/60 transition-colors duration-1000 hover:bg-white/40 animate-fade-in"
    >
      <div
        ref={labelRef}
        className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: visible ? 1 : 0, top: 0, left: 0, transition: 'opacity 0.2s' }}
      >
        <div className="flex items-center gap-2 bg-art-accent text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-hard whitespace-nowrap">
          <span>{styleName}</span>
          <ArrowUpRight size={12} />
        </div>
      </div>
      {children}
    </div>
  );
};

interface ArtStyleListProps {
    styles: any[];
    t: (key: string) => string;
    onTryStyle: (styleName: string) => void;
    onSelectStyle: (style: any) => void;
}

const ArtStyleList: React.FC<ArtStyleListProps> = memo(({ styles, t, onTryStyle, onSelectStyle }) => {
    const [hoveredIdx, setHoveredIdx] = useState<string | null>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            const { type, id } = (e as CustomEvent).detail;
            if (type !== 'style') return;
            const el = document.getElementById(`style-${id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        window.addEventListener('search-target', handler);
        return () => window.removeEventListener('search-target', handler);
    }, []);

    if (styles.length === 0) {
        return (
            <div className="text-center py-32 animate-fade-in">
                <Search size={48} className="mx-auto mb-6 text-stone-300" />
                <p className="text-stone-500 text-lg font-serif italic">{t('styles.no_results')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0 min-h-[50vh]">
            {styles.map((style, index) => {
                const styleName = t(`styles.${style.id}_name`);
                return (
                    <StyleRow key={style.id} styleName={styleName} id={`style-${style.id}`}>
                        <div className="px-4 md:px-12 max-w-[1800px] mx-auto py-8 md:py-24 lg:py-48 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-16 items-start">
                            <div className="md:col-span-4 md:sticky md:top-28 reveal-on-scroll z-10">
                                <div className="flex items-center gap-4 mb-6 opacity-60">
                                    <span className="font-mono text-xs block font-bold text-stone-600">0{index + 1}</span>
                                    <div className="h-px flex-1 bg-stone-300"></div>
                                </div>
                                <h3 className="font-serif text-3xl md:text-5xl lg:text-7xl text-art-accent mb-3 tracking-tighter">{styleName}</h3>
                                <p className="font-serif text-xl text-stone-400 italic mb-6 md:mb-10">{style.enName}</p>
                                <div className="relative mb-8 md:mb-12 p-6 md:p-8 bg-white/40 md:backdrop-blur-md rounded-2xl border border-white/60 shadow-soft transition-all duration-500 hover:shadow-medium group-hover:bg-white/60">
                                    <p className="text-stone-800 leading-loose text-base md:text-lg font-light">{t(`styles.${style.id}_desc`)}</p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <button onClick={() => onTryStyle(styleName)} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-art-accent hover:text-art-primary transition-all pb-2 border-b border-art-accent/20 hover:border-art-primary group/btn w-fit">
                                        <span>{t('styles.try_btn')}</span>
                                        <ArrowUpRight size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"/>
                                    </button>
                                    <button onClick={() => onSelectStyle(style)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-700 transition-colors w-fit">
                                        <Info size={14} /> {t('styles.info_btn')}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 lg:gap-32">
                                {style.works.map((work: any, idx: number) => {
                                    const workId = `${style.id}-${idx}`;
                                    const transTitleKey = `styles.works.${style.id}-${idx}-title`;
                                    const transDescKey = `styles.works.${style.id}-${idx}-desc`;
                                    const workTitle = t(transTitleKey) !== transTitleKey ? t(transTitleKey) : work.title;
                                    const workDesc = t(transDescKey) !== transDescKey ? t(transDescKey) : work.desc;
                                    return (
                                        <div key={idx} onMouseEnter={() => setHoveredIdx(workId)} onMouseLeave={() => setHoveredIdx(null)} className={`flex flex-col gap-8 md:gap-12 frame-reveal ${idx % 2 === 0 ? 'from-right' : 'from-left'} ${idx % 2 !== 0 ? 'md:mt-40' : ''}`} style={{ transitionDelay: `${idx * 0.15}s` }}>
                                            <TiltFrame>
                                                <div className="relative group/work transition-all duration-700 ease-luxury hover:z-20">
                                                    <div className="absolute top-20 left-10 w-full h-full bg-black/30 blur-[40px] opacity-40 z-0 hidden md:block"></div>
                                                    <div className="relative z-10 bg-[#2b2722] p-4 rounded-sm md:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5),0_18px_36px_-18px_rgba(0,0,0,0.5)] shadow-lg border-t border-[#3d3831] border-b border-[#1a1815]">
                                                        <div className="border-[3px] border-[#a68a53] p-[1px]">
                                                            <div className="bg-[#f0f0e8] p-4 md:p-14 relative overflow-hidden">
                                                                <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-multiply pointer-events-none hidden md:block"></div>
                                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/5 pointer-events-none"></div>
                                                                <div className="relative border-[5px] border-[#c5a059] bg-[#1a1a1a]">
                                                                    <div className="relative aspect-[3/4] overflow-hidden">
                                                                        <FadeInImage src={work.imageUrl} alt={workTitle} className="w-full h-full object-cover opacity-90 group-hover/work:opacity-100 group-hover/work:scale-105 transition-all duration-[3s] ease-out" />
                                                                        <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/canvas-orange.png')] mix-blend-overlay pointer-events-none hidden md:block"></div>
                                                                    </div>
                                                                </div>
                                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#c5a059] border border-[#a68a53] shadow-sm hidden group-hover/work:block animate-fade-in">
                                                                    <span className="text-[7px] text-[#1a1a1a] font-bold uppercase tracking-widest">{work.artist}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TiltFrame>
                                            <div className={`transition-all duration-700 ${hoveredIdx === workId ? 'translate-x-2' : ''}`}>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className={`h-px bg-art-primary transition-all duration-700 ${hoveredIdx === workId ? 'w-16' : 'w-8'}`}></div>
                                                    <h4 className="font-serif text-2xl md:text-3xl lg:text-4xl text-art-accent leading-tight">《{workTitle}》</h4>
                                                </div>
                                                <div className="pl-12">
                                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-stone-500 mb-4">{work.artist}</p>
                                                    <div className="max-w-xs relative p-4 bg-white/30 md:backdrop-blur-sm rounded-lg border-l-2 border-art-primary/30 shadow-sm">
                                                        <p className="text-stone-600 text-sm leading-loose font-serif italic">{workDesc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </StyleRow>
                );
            })}
        </div>
    );
});

const ScrollProgressBar: React.FC<{ isActive: boolean, scrollContainerRef: React.RefObject<HTMLDivElement> }> = ({ isActive, scrollContainerRef }) => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current?.closest('.scroll-container');
        if (!scrollContainer || !isActive) return;

        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            const progress = target.scrollTop / (target.scrollHeight - target.clientHeight);
            setScrollProgress(progress);
        };
        
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, [isActive, scrollContainerRef]);

    return (
        <div className={`fixed right-8 top-1/2 -translate-y-1/2 h-[40vh] w-[2px] bg-stone-200 hidden xl:block z-50 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
            <div 
              className="w-full bg-art-primary transition-all duration-100 ease-out" 
              style={{ height: `${scrollProgress * 100}%` }}
            ></div>
        </div>
    );
};


// --- MAIN COMPONENT ---

interface ArtStylesProps {
  onNavigate: (view: ViewState) => void;
  setPrefilledPrompt?: (prompt: string) => void;
  isActive?: boolean;
}

const ArtStyles: React.FC<ArtStylesProps> = ({ onNavigate, setPrefilledPrompt, isActive = false }) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEra, setActiveEra] = useState('全部');
  const [activeRegion, setActiveRegion] = useState('全部');
  const [activeMedium, setActiveMedium] = useState('全部');

  const getRecommendations = useCallback((style: any) => {
    return ART_STYLES
      .filter(s => s.id !== style.id)
      .map(s => {
        let score = 0;
        const tagOverlap = ((s as any).tags || []).filter((tag: string) => ((style as any).tags || []).includes(tag)).length;
        score += tagOverlap * 3;
        if ((s as any).era === (style as any).era) score += 2;
        if ((s as any).region === (style as any).region) score += 1;
        return { ...s, score };
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3);
  }, []);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    const timeout = setTimeout(() => {
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
              observerRef.current?.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, root: null });
        const elements = containerRef.current?.querySelectorAll('.reveal-on-scroll, .frame-reveal');
        elements?.forEach(el => observerRef.current?.observe(el));
    }, 100);
    return () => {
        clearTimeout(timeout);
        observerRef.current?.disconnect();
    };
  }, [isActive, searchQuery, activeEra, activeRegion, activeMedium]);

  const handleFilterChange = useCallback((setter: (v: string) => void, value: string, resets: Array<(v: string) => void>) => {
    setter(value);
    resets.forEach(r => r('全部'));
    const scrollContainer = containerRef.current?.closest('.scroll-container') as HTMLElement | null;
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }, []);

  const handleTryStyle = useCallback((styleName: string) => {
    if (setPrefilledPrompt) {
      setPrefilledPrompt(`请创作一幅${styleName}风格的油画，画面内容是...`);
    }
    onNavigate('gallery');
  }, [setPrefilledPrompt, onNavigate]);

  const eras = useMemo(() => ['全部', ...Array.from(new Set(ART_STYLES.map(s => (s as any).era).filter(Boolean)))], []);
  const regions = useMemo(() => ['全部', ...Array.from(new Set(ART_STYLES.map(s => (s as any).region).filter(Boolean)))], []);
  const mediums = useMemo(() => ['全部', ...Array.from(new Set(ART_STYLES.map(s => (s as any).medium).filter(Boolean)))], []);

  const filteredStyles = useMemo(() => {
      let result: typeof ART_STYLES = ART_STYLES;
      if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          result = result.filter(style => {
              const styleName = t(`styles.${style.id}_name`).toLowerCase();
              const enName = style.enName.toLowerCase();
              if (styleName.includes(query) || enName.includes(query)) return true;
              return style.works.some(work => {
                  return work.title.toLowerCase().includes(query) || work.artist.toLowerCase().includes(query);
              });
          });
      }
      if (activeEra !== '全部') result = result.filter(s => (s as any).era === activeEra);
      if (activeRegion !== '全部') result = result.filter(s => (s as any).region === activeRegion);
      if (activeMedium !== '全部') result = result.filter(s => (s as any).medium === activeMedium);
      return result;
  }, [searchQuery, activeEra, activeRegion, activeMedium, t]);

  return (
    <div ref={containerRef} className="min-h-screen bg-transparent py-20 md:py-32 relative overflow-x-hidden">
      
      <ScrollProgressBar isActive={isActive} scrollContainerRef={containerRef} />

      <div className="px-4 md:px-12 max-w-[1800px] mx-auto mb-12 md:mb-20 flex flex-col md:flex-row justify-between items-end gap-8 md:gap-12">
        <div className="relative z-10">
           <span className={`block font-sans text-xs font-bold tracking-[0.3em] uppercase text-art-primary mb-4 text-shadow-sm transition-all duration-1000 delay-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {t('styles.subtitle')}
           </span>
           <h2 className="font-serif text-4xl md:text-6xl lg:text-8xl text-art-accent leading-none drop-shadow-sm">
             {isActive && <AppleText text={t('styles.title_1')} delay={0.4} />} <br/>
             {isActive && <AppleText text={t('styles.title_2')} delay={0.6} />}
           </h2>
        </div>
        
        <div className={`w-full md:max-w-md transition-all duration-1000 delay-700 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
           <div className="relative group">
               <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="relative bg-white/60 md:backdrop-blur-xl border border-white/40 shadow-medium rounded-full flex items-center p-2 transition-all focus-within:shadow-lg focus-within:bg-white/80">
                   <div className="pl-4 text-stone-400"><Search size={20} /></div>
                   <input 
                       type="text"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder={t('styles.search_placeholder')}
                       className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-stone-800 placeholder:text-stone-400 font-serif"
                   />
                   {searchQuery && (
                       <button onClick={() => setSearchQuery('')} className="p-2 text-stone-400 hover:text-stone-600 transition-colors">
                           <X size={16} />
                       </button>
                   )}
               </div>
           </div>
        </div>
      </div>

      <div className={`px-4 md:px-12 max-w-[1800px] mx-auto mb-8 transition-all duration-1000 delay-900 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {[
          {
            label: t('styles.filter_era'), values: eras, active: activeEra,
            onSelect: (v: string) => handleFilterChange(setActiveEra, v, [setActiveRegion, setActiveMedium])
          },
          {
            label: t('styles.filter_region'), values: regions, active: activeRegion,
            onSelect: (v: string) => handleFilterChange(setActiveRegion, v, [setActiveEra, setActiveMedium])
          },
          {
            label: t('styles.filter_medium'), values: mediums, active: activeMedium,
            onSelect: (v: string) => handleFilterChange(setActiveMedium, v, [setActiveEra, setActiveRegion])
          },
        ].map(({ label, values, active, onSelect }) => (
          <div key={label} className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400 w-10 shrink-0">{label}</span>
            {values.map(v => (
              <button
                key={v}
                onClick={() => onSelect(v)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                  active === v
                    ? 'bg-art-accent text-white border-art-accent shadow-sm'
                    : 'bg-white/60 text-stone-600 border-stone-200 hover:border-art-accent/50 hover:text-art-accent'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        ))}
        {(activeEra !== '全部' || activeRegion !== '全部' || activeMedium !== '全部') && (
          <button
            onClick={() => { setActiveEra('全部'); setActiveRegion('全部'); setActiveMedium('全部'); }}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-art-primary transition-colors mt-1"
          >
            <X size={12} /> {t('styles.filter_clear')}
          </button>
        )}
      </div>

      <ArtStyleList
        styles={filteredStyles}
        t={t}
        onTryStyle={handleTryStyle}
        onSelectStyle={setSelectedStyle}
      />

      <div className="bg-art-accent text-white py-16 md:py-48 text-center px-8 relative overflow-hidden reveal-on-scroll mt-20">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="relative z-10 max-w-4xl mx-auto">
            <h3 className="font-serif text-4xl md:text-5xl lg:text-8xl mb-10 md:mb-16 leading-tight">
               {isActive && <AppleText text={t('styles.cta_title')} delay={0.2} />}
            </h3>
            <button
                onClick={() => onNavigate('gallery')}
                className="group relative px-10 md:px-16 py-5 md:py-6 bg-white text-art-accent rounded-full text-xs font-bold uppercase tracking-[0.3em] overflow-hidden hover:text-white transition-all shadow-hard active:scale-95"
            >
                <div className="absolute inset-0 bg-art-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-luxury"></div>
                <span className="relative z-10">{t('styles.cta_btn')}</span>
            </button>
         </div>
      </div>

      {selectedStyle && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4 bg-stone-900/80 md:backdrop-blur-sm animate-fade-in" onClick={() => setSelectedStyle(null)}>
              <div className="bg-white w-full max-w-4xl max-h-[92vh] md:max-h-[90vh] rounded-t-[28px] md:rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setSelectedStyle(null)} className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors z-50 active:scale-90">
                      <X size={18} />
                  </button>
                  <div className="w-full md:w-1/3 bg-stone-50 p-5 md:p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-stone-100 relative overflow-hidden shrink-0">
                      <div className={`absolute inset-0 opacity-10 ${selectedStyle.color}`}></div>
                      <div className="relative z-10 space-y-3 md:space-y-8">
                          <h3 className="font-serif text-2xl md:text-5xl text-art-accent tracking-tighter">{t(`styles.${selectedStyle.id}_name`)}</h3>
                          <p className="font-serif text-base md:text-2xl text-stone-400 italic">{selectedStyle.enName}</p>
                          <div className="font-mono text-xs text-stone-500 flex items-center gap-2">
                            <span>{selectedStyle.period}</span>
                          </div>
                          {((selectedStyle as any).era || (selectedStyle as any).region || (selectedStyle as any).medium) && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {(selectedStyle as any).era && <span className="px-2 py-1 bg-stone-100 rounded text-[10px] text-stone-500">{(selectedStyle as any).era}</span>}
                              {(selectedStyle as any).region && <span className="px-2 py-1 bg-stone-100 rounded text-[10px] text-stone-500">{(selectedStyle as any).region}</span>}
                              {(selectedStyle as any).medium && <span className="px-2 py-1 bg-stone-100 rounded text-[10px] text-stone-500">{(selectedStyle as any).medium}</span>}
                            </div>
                          )}
                          <p className="text-stone-600 leading-relaxed text-sm pt-3 border-t border-stone-200 hidden md:block">{t(`styles.${selectedStyle.id}_desc`)}</p>
                      </div>
                  </div>
                  <div className="w-full md:w-2/3 overflow-y-auto">
                      <div className="p-5 md:p-12 grid grid-cols-1 gap-6 md:gap-12">
                          {selectedStyle.works.map((work: any, index: number) => {
                              const transTitleKey = `styles.works.${selectedStyle.id}-${index}-title`;
                              const transDescKey = `styles.works.${selectedStyle.id}-${index}-desc`;
                              const workTitle = t(transTitleKey) !== transTitleKey ? t(transTitleKey) : work.title;
                              const workDesc = t(transDescKey) !== transDescKey ? t(transDescKey) : work.desc;
                              return (
                                  <div key={index} className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                                      <div className="w-full sm:w-1/3 flex-shrink-0 rounded-md overflow-hidden shadow-md border-4 border-white">
                                          <FadeInImage src={work.imageUrl} alt={workTitle} className="aspect-[3/4]" />
                                      </div>
                                      <div className="flex-grow">
                                          <h4 className="font-serif text-xl md:text-2xl text-art-accent mb-1">《{workTitle}》</h4>
                                          <p className="text-sm text-stone-500 mb-2 font-mono">{work.artist}</p>
                                          <p className="text-stone-600 text-sm leading-loose">{workDesc}</p>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                      {(() => {
                        const recs = getRecommendations(selectedStyle);
                        if (recs.length === 0) return null;
                        return (
                          <div className="px-5 md:px-12 pb-6 md:pb-12 border-t border-stone-100 pt-5 md:pt-8">
                            <h5 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">{t('styles.recommendations')}</h5>
                            <div className="flex flex-col gap-3">
                              {recs.map((rec: any) => (
                                <button
                                  key={rec.id}
                                  onClick={() => setSelectedStyle(rec)}
                                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors text-left group"
                                >
                                  <div className={`w-10 h-10 rounded-lg ${rec.color} border flex-shrink-0`}></div>
                                  <div>
                                    <p className="font-serif text-sm text-art-accent group-hover:text-art-primary transition-colors">{t(`styles.${rec.id}_name`)}</p>
                                    <p className="text-xs text-stone-400">{rec.period}</p>
                                  </div>
                                  <ArrowUpRight size={14} className="ml-auto text-stone-300 group-hover:text-art-primary transition-colors" />
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ArtStyles;
