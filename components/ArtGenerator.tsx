
import React, { useState, useEffect, useMemo } from 'react';
import { generateImage as generateArtImage } from '../services/geminiService';
import { GeneratedImage, ImageSize, UserTier, ViewState } from '../types';
import { ART_STYLES } from '../constants';
import { Wand2, Download, Loader2, Trash2, History, Quote, PenTool, Brush, Maximize2, Sparkles, LogIn, Crown, Lock, Shuffle, Plus, X, Share2, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ArtGeneratorProps {
  history: GeneratedImage[];
  onImageGenerated: (img: GeneratedImage) => void;
  onClearHistory: () => void;
  prefilledPrompt: string;
  setPrefilledPrompt: (prompt: string) => void;
  userTier: UserTier;
  onNavigateToMembership: () => void;
  onAuthRequired: () => void;
  isLoggedIn: boolean;
  onImageSelect: (image: GeneratedImage | null) => void;
}

const AppleText: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className = "", delay = 0 }) => (
  <span className={`inline-block ${className}`} aria-label={text}>
    {text.split('').map((char, i) => (
      <span key={i} className="inline-block opacity-0 animate-apple-reveal" style={{ animationDelay: `${delay + i * 0.05}s` }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))}
  </span>
);

// Improved FadeInImage for History Items with clearer placeholder
const FadeInImage: React.FC<{ src: string; className?: string }> = ({ src, className = "" }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className={`relative overflow-hidden w-full h-full ${className}`}>
            {!loaded && (
                <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-stone-400" />
                </div>
            )}
            <img 
                src={src} 
                className={`w-full h-full object-cover transition-all duration-700 ease-out ${loaded ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-110 blur-sm'}`}
                onLoad={() => setLoaded(true)}
                loading="lazy"
            />
        </div>
    );
};

const ArtGenerator: React.FC<ArtGeneratorProps> = ({ 
  history, 
  onImageGenerated, 
  onClearHistory,
  prefilledPrompt,
  setPrefilledPrompt,
  userTier,
  onNavigateToMembership,
  onAuthRequired,
  isLoggedIn,
  onImageSelect
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<ImageSize>('1K');
  const [showTags, setShowTags] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isPlaceholderLoaded, setIsPlaceholderLoaded] = useState(false);
  
  // Share State
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  
  const { t } = useLanguage();

  const placeholderImage = useMemo(() => {
      const allWorks = ART_STYLES.flatMap(style => style.works);
      const randomWork = allWorks[Math.floor(Math.random() * allWorks.length)];
      return randomWork;
  }, []);

  const INSPIRATION_TAGS = {
      [t('generator.tag_style') || 'Style']: ['油画厚涂', '印象派光影', '赛博朋克', '水墨写意', '超现实主义', '洛可可风格'],
      [t('generator.tag_light') || 'Light']: ['丁达尔效应', '伦勃朗光', '赛博霓虹', '柔和漫射光', '金色黄昏'],
      [t('generator.tag_texture') || 'Texture']: ['龟裂纹理', '丝绸质感', '粗糙画布', '金属光泽', '磨砂玻璃']
  };

  useEffect(() => {
    if (history.length > 0 && !selectedImage) {
      const latestImage = history[history.length - 1];
      setSelectedImage(latestImage);
      onImageSelect(latestImage);
    }
  }, [history]);

  useEffect(() => {
    if (prefilledPrompt) {
      setPrompt(prefilledPrompt);
      if (setPrefilledPrompt) setPrefilledPrompt(''); 
    }
  }, [prefilledPrompt]);

  useEffect(() => {
      let interval: any;
      let progressTimer: any;
      
      if (loading) {
          setLoadingStep(0);
          setLoadingProgress(0);
          interval = setInterval(() => {
              setLoadingStep(prev => Math.min(prev + 1, 3));
          }, 2000);

          progressTimer = setInterval(() => {
              setLoadingProgress(prev => {
                  if (prev >= 99) return 99;
                  const increment = prev > 90 ? 0.05 : 0.8;
                  return prev + increment;
              });
          }, 50);
      } else {
          setLoadingProgress(100);
      }
      
      return () => {
          clearInterval(interval);
          clearInterval(progressTimer);
      };
  }, [loading]);

  const handleSizeSelect = (size: ImageSize) => {
      if (size !== '1K' && userTier === 'guest') {
          onNavigateToMembership();
          return;
      }
      setSelectedSize(size);
  }

  const handleGenerate = async () => {
    if (!isLoggedIn) {
        onAuthRequired();
        return;
    }
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setIsRevealing(false);
    setShareStatus('idle');
    
    try {
      const imageUrl = await generateArtImage(prompt);
      const newImage: GeneratedImage = { url: imageUrl, prompt, size: selectedSize, timestamp: Date.now() };
      onImageGenerated(newImage);
      setSelectedImage(newImage);
      onImageSelect(newImage);
      setTimeout(() => setIsRevealing(true), 100);
    } catch (err: any) {
      setError(err.message || t('generator.modal.fail_desc'));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
      if (!selectedImage) return;
      
      try {
          if (navigator.share) {
              const blob = await (await fetch(selectedImage.url)).blob();
              const file = new File([blob], "masterpiece.png", { type: blob.type });
              await navigator.share({
                  title: 'ArtIsLife Masterpiece',
                  text: `Check out this artwork I generated: "${selectedImage.prompt}"`,
                  files: [file]
              });
              setShareStatus('success');
          } else {
              await navigator.clipboard.writeText(selectedImage.url);
              setShareStatus('success');
          }
      } catch (err) {
          console.error("Share failed", err);
          setShareStatus('fail');
      }
      
      setTimeout(() => setShareStatus('idle'), 2500);
  };

  const addTag = (tag: string) => {
      if (prompt.includes(tag)) return;
      setPrompt(prev => prev ? `${prev}, ${tag}` : tag);
  };

  const loadingMessages = [
      t('generator.loading_1'), t('generator.loading_2'),
      t('generator.loading_3'), t('generator.loading_4')
  ];

  return (
    <div className="pt-28 pb-20 px-6 md:px-16 max-w-[1800px] mx-auto min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 scroll-container">
      <div className="lg:col-span-4 flex flex-col h-full space-y-8">
        <div className="space-y-4">
          <h2 className="font-serif text-6xl md:text-7xl text-art-accent italic tracking-tight">
             <AppleText text={t('generator.title')} delay={0.2} />
          </h2>
          <div className="h-1 w-12 bg-art-primary"></div>
        </div>

        <div className="bg-white p-8 md:p-10 shadow-hard rounded-[40px] border border-stone-50 transition-all hover:shadow-2xl relative overflow-hidden group flex flex-col h-full max-h-[800px]">
          <div className="flex justify-between items-center mb-6">
              <label className="flex items-center gap-2 text-art-secondary font-bold text-xs uppercase tracking-[0.2em]">
                 <PenTool size={16} className="text-art-primary" /> {t('generator.inspiration_label')}
              </label>
              <div className="flex bg-stone-100 rounded-full p-1 border border-stone-200">
                  {(['1K', '2K', '4K'] as ImageSize[]).map((size) => {
                      const isLocked = size !== '1K' && userTier === 'guest';
                      return (
                          <button
                              key={size}
                              onClick={() => handleSizeSelect(size)}
                              className={`px-3 py-1 text-[9px] font-bold rounded-full transition-all relative flex items-center gap-1
                                  ${selectedSize === size && !isLocked ? 'bg-white shadow-md text-art-accent' : 'text-stone-400 hover:text-stone-600'}
                              `}
                          >
                              {size}
                              {isLocked && <Lock size={8} className="text-art-gold" />}
                          </button>
                      );
                  })}
              </div>
          </div>
          
          <div className="relative flex-1 min-h-[160px] flex flex-col">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('generator.placeholder')}
              className="w-full h-full bg-transparent border-none outline-none text-xl font-serif text-art-accent placeholder:text-stone-200 resize-none leading-relaxed italic"
            />
            {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center animate-fade-in z-20"><Loader2 className="animate-spin text-art-primary" size={32} /></div>}
          </div>

          <div className="mt-4 border-t border-stone-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">TAGS</span>
                  <button onClick={() => setShowTags(!showTags)} className="text-stone-300 hover:text-stone-500">
                      {showTags ? <X size={14} /> : <Plus size={14} />}
                  </button>
              </div>
              
              {showTags && (
                  <div className="space-y-3 animate-fade-in">
                      {Object.entries(INSPIRATION_TAGS).map(([category, tags]) => (
                          <div key={category} className="flex flex-wrap gap-2 items-center">
                              <span className="text-[9px] text-stone-300 w-12">{category}</span>
                              <div className="flex-1 flex flex-wrap gap-1.5">
                                  {tags.map(tag => (
                                      <button 
                                        key={tag}
                                        onClick={() => addTag(tag)}
                                        className="px-2 py-1 bg-stone-50 hover:bg-art-primary/10 hover:text-art-primary text-stone-500 rounded-md text-[10px] transition-colors border border-stone-100"
                                      >
                                          {tag}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          <button
              onClick={handleGenerate}
              disabled={loading || (isLoggedIn && !prompt.trim())}
              className={`w-full mt-8 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl relative overflow-hidden group/btn
                ${!isLoggedIn ? 'bg-art-primary text-white' : 'bg-art-accent text-white'}`}
            >
              <span className="relative z-10 flex items-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={18} /> : isLoggedIn ? <Wand2 size={18} /> : <Sparkles size={18} />}
                <span>{loading ? t('generator.btn_generating') : isLoggedIn ? t('generator.btn_generate') : t('nav.login')}</span>
              </span>
          </button>
        </div>

        {/* Creation History Integrated Here */}
        {isLoggedIn && history.length > 0 && (
          <div className="pt-4 animate-fade-in-up">
             <div className="flex items-center justify-between mb-6 border-b border-stone-200 pb-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] flex items-center gap-2">
                   <History size={12} /> {t('generator.history')}
                </span>
                <button 
                    onClick={onClearHistory} 
                    className="text-stone-300 hover:text-red-500 transition-colors p-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                    title="Clear History"
                >
                    <Trash2 size={12} /> Clear
                </button>
             </div>
             <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {[...history].slice(-5).reverse().map((img) => (
                  <button 
                    key={img.timestamp} 
                    onClick={() => { setSelectedImage(img); onImageSelect(img); setIsRevealing(true); setShareStatus('idle'); }} 
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 shadow-medium border-2 
                        ${selectedImage?.timestamp === img.timestamp 
                            ? 'border-art-primary ring-2 ring-art-primary/20 scale-105' 
                            : 'border-transparent opacity-70 grayscale hover:grayscale-0 hover:opacity-100'
                        }`}
                  >
                     <FadeInImage src={img.url} className="w-full h-full" />
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-8 relative flex items-center justify-center min-h-[650px] bg-[#E0DDD7] rounded-[48px] overflow-hidden shadow-inner border-[1px] border-stone-200/20 group/canvas">
         {loading ? (
             <div className="text-center animate-fade-in flex flex-col items-center max-w-md w-full px-8">
                 <div className="w-64 h-80 bg-white shadow-2xl flex items-center justify-center mb-12 rotate-3 rounded-sm border border-stone-100 overflow-hidden relative">
                    <Brush size={56} className="text-art-primary animate-bounce relative z-10" />
                 </div>
                 
                 <div className="w-full mb-6 space-y-2">
                     <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
                         <span>{t('generator.phase_label')} {loadingStep + 1}/4</span>
                         <span>{Math.round(loadingProgress)}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                         <div className="h-full bg-art-primary transition-all duration-200" style={{ width: `${loadingProgress}%` }}></div>
                     </div>
                 </div>

                 <h3 className="font-serif text-3xl md:text-4xl text-art-accent mb-2 italic tracking-tight transition-all duration-500 min-h-[1.2em]">
                     {loadingMessages[loadingStep]}
                 </h3>
                 <p className="text-stone-500 text-[10px] font-bold uppercase tracking-[0.5em]">{t('generator.processing_subtitle')}</p>
             </div>
         ) : selectedImage ? (
            <div className="w-full max-w-2xl p-4 animate-scale-in relative z-10">
                <div className="relative bg-white p-8 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.4)] rounded-sm">
                    <div className="relative overflow-hidden aspect-square bg-stone-100 shadow-inner rounded-sm">
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.prompt}
                            className={`w-full h-full object-cover transition-all duration-[2.5s] ${isRevealing ? 'opacity-100 scale-100 filter-none' : 'opacity-0 scale-110 blur-2xl'}`}
                            onLoad={() => setIsRevealing(true)}
                        />
                        <div className={`absolute inset-0 bg-stone-200 transition-transform duration-[1.8s] ease-[cubic-bezier(0.85,0,0.15,1)] origin-left ${isRevealing ? 'scale-x-0' : 'scale-x-100'}`}></div>
                    </div>
                </div>
                <div className="mt-12 text-center space-y-6">
                    <p className="font-serif italic text-3xl text-art-accent leading-relaxed tracking-tight px-10">"{selectedImage.prompt}"</p>
                    <div className="pt-8 flex justify-center gap-4">
                        <a href={selectedImage.url} download className="inline-flex items-center gap-4 px-8 py-4 bg-white/80 backdrop-blur-xl border border-white/50 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] text-art-accent hover:bg-art-primary hover:text-white transition-all shadow-hard active:scale-95 group/down">
                            <Download size={18} /> {t('generator.modal.download')}
                        </a>
                        <button 
                            onClick={handleShare}
                            className={`inline-flex items-center gap-4 px-8 py-4 bg-white/80 backdrop-blur-xl border border-white/50 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] transition-all shadow-hard active:scale-95
                                ${shareStatus === 'success' ? 'text-green-600 border-green-200' : 'text-art-accent hover:bg-stone-900 hover:text-white'}
                            `}
                        >
                            {shareStatus === 'success' ? <Check size={18} /> : <Share2 size={18} />}
                            {shareStatus === 'success' ? t('generator.modal.share_success') : t('generator.modal.share')}
                        </button>
                    </div>
                </div>
            </div>
         ) : (
             <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-[48px] bg-stone-200">
                 <div className={`absolute inset-0 transition-opacity duration-1000 ${isPlaceholderLoaded ? 'opacity-20' : 'opacity-0'}`}>
                     <img src={placeholderImage?.imageUrl} className="w-full h-full object-cover filter grayscale blur-sm scale-110" onLoad={() => setIsPlaceholderLoaded(true)} />
                 </div>
                 
                 <div className="text-center space-y-10 animate-fade-in relative z-10 bg-white/80 backdrop-blur-md p-12 rounded-[40px] shadow-2xl border border-white/50 max-w-lg">
                     <Brush size={64} className="mx-auto text-stone-800" />
                     <div className="space-y-3">
                        <p className="font-serif text-4xl italic text-art-accent tracking-tighter">{t('generator.waiting_inspiration')}</p>
                        <p className="text-stone-500 text-[10px] font-bold uppercase tracking-[0.5em] text-stone-500">{!isLoggedIn ? t('nav.login') : t('generator.placeholder')}</p>
                     </div>
                 </div>
             </div>
         )}
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default ArtGenerator;
