import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ART_STYLES } from '../constants';
import { ArrowUpRight, X, Info, Search, Loader2 } from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import OptimizedImage from './OptimizedImage';

const ArtStyles: React.FC<ArtStylesProps> = ({ onNavigate, setPrefilledPrompt, isActive = false }) => {
  const { t } = useLanguage();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<any>(null);
  
  // 新增：搜索功能状态
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll Progress Logic
  useEffect(() => {
      const handleScroll = (e: Event) => {
          const target = e.target as HTMLElement;
          const progress = target.scrollTop / (target.scrollHeight - target.clientHeight);
          setScrollProgress(progress);
      };

      const scrollContainer = containerRef.current?.closest('.scroll-container');
      
      if (scrollContainer) {
          scrollContainer.addEventListener('scroll', handleScroll);
          return () => scrollContainer.removeEventListener('scroll', handleScroll);
      }
  }, [isActive]);

  // Intersection Observer for scroll reveal within the page
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Wait a bit for page transition to settle before observing
    const timeout = setTimeout(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('active');
              observerRef.current?.unobserve(entry.target); // Trigger once
            }
          });
        }, { threshold: 0.1, root: null }); // Use viewport as root

        const elements = containerRef.current?.querySelectorAll('.reveal-on-scroll, .frame-reveal');
        elements?.forEach(el => observerRef.current?.observe(el));
    }, 100);

    return () => {
        clearTimeout(timeout);
        observerRef.current?.disconnect();
    };
  }, [isActive, searchQuery]); // Re-run when search changes content

  const handleTryStyle = (styleName: string) => {
    if (setPrefilledPrompt) {
      setPrefilledPrompt(`请创作一幅${styleName}风格的油画，画面内容是...`);
    }
    onNavigate('gallery');
  };

  // 3D Tilt Hook
  const useTilt = () => {
      const ref = useRef<HTMLDivElement>(null);
      const [style, setStyle] = useState({});

      const onMouseMove = (e: React.MouseEvent) => {
          if (!ref.current) return;
          const { left, top, width, height } = ref.current.getBoundingClientRect();
          const x = (e.clientX - left - width / 2) / 25; 
          const y = (e.clientY - top - height / 2) / 25;
          setStyle({ transform: `rotateY(${x}deg) rotateX(${-y}deg) scale(1.02)` });
      };

      const onMouseLeave = () => {
          setStyle({ transform: `rotateY(0deg) rotateX(0deg) scale(1)` });
      };

      return { ref, style, onMouseMove, onMouseLeave };
  };

  const TiltFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const { ref, style, onMouseMove, onMouseLeave } = useTilt();
      return (
          <div 
            ref={ref} 
            onMouseMove={onMouseMove} 
            onMouseLeave={onMouseLeave}
            style={{ ...style, transition: 'transform 0.1s ease-out' }}
            className="perspective-1000 will-change-transform"
          >
              {children}
          </div>
      );
  }

  // 新增：过滤逻辑
  const filteredStyles = useMemo(() => {
      if (!searchQuery.trim()) return ART_STYLES;
      
      const query = searchQuery.toLowerCase();
      return ART_STYLES.filter(style => {
          const styleName = t(`styles.${style.id}_name`).toLowerCase();
          const enName = style.enName.toLowerCase();
          // Check style name
          if (styleName.includes(query) || enName.includes(query)) return true;
          
          // Check works (title & artist)
          return style.works.some(work => {
              // Note: using raw strings from constant as generic check, but ideally check translation
              const workTitle = work.title.toLowerCase();
              const artist = work.artist.toLowerCase();
              return workTitle.includes(query) || artist.includes(query);
          });
      });
  }, [searchQuery, t]);

  return (
    <div ref={containerRef} className="min-h-screen bg-transparent py-32 relative overflow-x-hidden">
      
      {/* Scroll Progress Bar */}
      <div className={`fixed right-8 top-1/2 -translate-y-1/2 h-[40vh] w-[2px] bg-stone-200 hidden xl:block z-50 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
          <div 
            className="w-full bg-art-primary transition-all duration-100 ease-out" 
            style={{ height: `${scrollProgress * 100}%` }}
          ></div>
      </div>

      <div className="px-6 md:px-12 max-w-[1800px] mx-auto mb-20 flex flex-col md:flex-row justify-between items-end gap-12">
        <div className="relative z-10">
           <span className={`block font-sans text-xs font-bold tracking-[0.3em] uppercase text-art-primary mb-4 text-shadow-sm transition-all duration-1000 delay-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {t('styles.subtitle')}
           </span>
           <h2 className="font-serif text-6xl md:text-8xl text-art-accent leading-none drop-shadow-sm">
             {isActive && <AppleText text={t('styles.title_1')} delay={0.4} />} <br/>
             {isActive && <AppleText text={t('styles.title_2')} delay={0.6} />}
           </h2>
        </div>
        
        {/* 新增：搜索框 */}
        <div className={`w-full md:max-w-md transition-all duration-1000 delay-700 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
           <div className="relative group">
               <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="relative bg-white/60 backdrop-blur-xl border border-white/40 shadow-medium rounded-full flex items-center p-2 transition-all focus-within:shadow-lg focus-within:bg-white/80">
                   <div className="pl-4 text-stone-400">
                       <Search size={20} />
                   </div>
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

      <div className="flex flex-col gap-0 min-h-[50vh]">
        {filteredStyles.length > 0 ? filteredStyles.map((style, index) => {
          const styleName = t(`styles.${style.id}_name`);
          return (
            <div key={style.id} className="group relative border-t border-stone-200/60 transition-colors duration-1000 hover:bg-white/40 animate-fade-in">
                <div className="px-6 md:px-12 max-w-[1800px] mx-auto py-24 md:py-48 grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
                
                {/* Left Column: Sticky Info */}
                <div className="md:col-span-4 md:sticky md:top-40 reveal-on-scroll z-10">
                    <div className="flex items-center gap-4 mb-8 opacity-60">
                        <span className="font-mono text-xs block font-bold text-stone-600">0{index + 1}</span>
                        <div className="h-px flex-1 bg-stone-300"></div>
                    </div>

                    <h3 className="font-serif text-5xl md:text-7xl text-art-accent mb-4 tracking-tighter">
                        {styleName}
                    </h3>
                    <p className="font-serif text-2xl text-stone-400 italic mb-10">{style.enName}</p>
                    
                    <div className="relative mb-12 p-8 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-soft transition-all duration-500 hover:shadow-medium group-hover:bg-white/60">
                        <p className="text-stone-800 leading-loose text-lg font-light">
                            {t(`styles.${style.id}_desc`)}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={() => handleTryStyle(styleName)}
                            className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-art-accent hover:text-art-primary transition-all pb-2 border-b border-art-accent/20 hover:border-art-primary group/btn w-fit"
                        >
                            <span>{t('styles.try_btn')}</span>
                            <ArrowUpRight size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"/>
                        </button>
                        
                        <button 
                            onClick={() => setSelectedStyle(style)}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-700 transition-colors w-fit"
                        >
                            <Info size={14} /> 更多信息
                        </button>
                    </div>
                </div>

                {/* Right Column: The Perfect Museum Frames */}
                <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-32">
                    {style.works.map((work: any, idx) => {
                        const workId = `${style.id}-${idx}`;
                        
                        const transTitleKey = `styles.works.${style.id}-${idx}-title`;
                        const transDescKey = `styles.works.${style.id}-${idx}-desc`;
                        
                        const workTitle = t(transTitleKey) !== transTitleKey ? t(transTitleKey) : work.title;
                        const workDesc = t(transDescKey) !== transDescKey ? t(transDescKey) : work.desc;

                        return (
                        <div 
                            key={idx} 
                            onMouseEnter={() => setHoveredIdx(workId)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            className={`
                            flex flex-col gap-12 frame-reveal
                            ${idx % 2 === 0 ? 'from-right' : 'from-left'}
                            ${idx % 2 !== 0 ? 'md:mt-40' : ''} 
                            `}
                            style={{ transitionDelay: `${idx * 0.15}s` }}
                        >
                            <TiltFrame>
                                <div className="relative group/work transition-all duration-700 ease-luxury hover:z-20">
                                    <div className="absolute top-20 left-10 w-full h-full bg-black/30 blur-[40px] opacity-40 z-0"></div>
                                    <div className="relative z-10 bg-[#2b2722] p-4 rounded-sm shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5),0_18px_36px_-18px_rgba(0,0,0,0.5)] border-t border-[#3d3831] border-b border-[#1a1815]">
                                        <div className="border-[3px] border-[#a68a53] p-[1px] shadow-sm">
                                            <div className="bg-[#f0f0e8] p-10 md:p-14 relative shadow-[inset_0_0_30px_rgba(0,0,0,0.1)] overflow-hidden">
                                                <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-multiply pointer-events-none"></div>
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/5 pointer-events-none"></div>
                                                
                                                <div className="relative border-[5px] border-[#c5a059] shadow-inner bg-[#1a1a1a]">
                                                    <div className="relative aspect-[3/4] overflow-hidden">
                                                        {/* 新增：使用 FadeInImage 替代原生 img */}
                                                        <OptimizedImage 
                                                            src={work.imageUrl} 
                                                            alt={workTitle}
                                                            className="w-full h-full object-cover opacity-90 group-hover/work:opacity-100 group-hover/work:scale-105 transition-all duration-[3s] ease-out"
                                                        />
                                                        
                                                        <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/canvas-orange.png')] mix-blend-overlay pointer-events-none"></div>
                                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover/work:opacity-100 transition-opacity duration-1000"></div>
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
                                    <h4 className="font-serif text-3xl md:text-4xl text-art-accent leading-tight">《{workTitle}》</h4>
                                </div>
                                
                                <div className="pl-12">
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-stone-500 mb-4">{work.artist}</p>
                                    <div className="max-w-xs relative p-4 bg-white/30 backdrop-blur-sm rounded-lg border-l-2 border-art-primary/30 shadow-sm">
                                    <p className="text-stone-600 text-sm leading-loose font-serif italic">
                                        {workDesc}
                                    </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
                </div>
            </div>
          );
        }) : (
            <div className="text-center py-32 animate-fade-in">
                <Search size={48} className="mx-auto mb-6 text-stone-300" />
                <p className="text-stone-500 text-lg font-serif italic">{t('styles.no_results')}</p>
            </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-art-accent text-white py-48 text-center px-8 relative overflow-hidden reveal-on-scroll mt-20">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="relative z-10 max-w-4xl mx-auto">
            <h3 className="font-serif text-5xl md:text-8xl mb-16 leading-tight">
               {isActive && <AppleText text={t('styles.cta_title')} delay={0.2} />}
            </h3>
            <button 
                onClick={() => onNavigate('gallery')}
                className="group relative px-16 py-6 bg-white text-art-accent rounded-full text-xs font-bold uppercase tracking-[0.3em] overflow-hidden hover:text-white transition-all shadow-hard"
            >
                <div className="absolute inset-0 bg-art-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-luxury"></div>
                <span className="relative z-10">{t('styles.cta_btn')}</span>
            </button>
         </div>
      </div>

      {/* Detail Modal */}
      {selectedStyle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedStyle(null)}>
              <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                  <button 
                      onClick={() => setSelectedStyle(null)}
                      className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 transition-colors z-50"
                  >
                      <X size={20} />
                  </button>

                  <div className="w-full md:w-1/3 bg-stone-50 p-8 flex flex-col justify-center border-r border-stone-100 relative overflow-hidden">
                      <div className={`absolute inset-0 opacity-10 ${selectedStyle.color}`}></div>
                      <div className="relative z-10 space-y-8">
                          <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Period</span>
                              <p className="font-serif text-2xl text-stone-800">{selectedStyle.period}</p>
                          </div>
                          <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Representative Color</span>
                              <div className={`w-16 h-16 rounded-full shadow-lg border-4 border-white ${selectedStyle.color.replace('bg-', 'bg-').replace('border-', '')}`}></div>
                          </div>
                      </div>
                  </div>

                  <div className="w-full md:w-2/3 p-10 md:p-12 overflow-y-auto">
                      <div className="mb-8">
                          <h2 className="font-serif text-4xl md:text-5xl text-art-accent mb-2">{t(`styles.${selectedStyle.id}_name`)}</h2>
                          <p className="font-serif text-xl text-stone-400 italic">{selectedStyle.enName}</p>
                      </div>
                      
                      <div className="prose prose-stone mb-10">
                          <p className="text-lg leading-relaxed text-stone-600">
                              {t(`styles.${selectedStyle.id}_desc`)}
                          </p>
                      </div>

                      <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">Featured Works</h4>
                          <div className="space-y-4">
                              {selectedStyle.works.map((work: any, idx: number) => (
                                  <div key={idx} className="flex gap-4 items-start p-3 rounded-xl hover:bg-stone-50 transition-colors">
                                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                                          <FadeInImage src={work.imageUrl} alt={work.title} className="w-full h-full" />
                                      </div>
                                      <div>
                                          <h5 className="font-serif text-lg text-stone-800 leading-tight">
                                              {t(`styles.works.${selectedStyle.id}-${idx}-title`) !== `styles.works.${selectedStyle.id}-${idx}-title` ? t(`styles.works.${selectedStyle.id}-${idx}-title`) : work.title}
                                          </h5>
                                          <p className="text-xs text-stone-500 mt-1">{work.artist}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ArtStyles;