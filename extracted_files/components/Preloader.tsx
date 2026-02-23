
import React, { useEffect, useState } from 'react';
import { Palette, Sparkles } from 'lucide-react';

const QUOTES = [
  "艺术不是你看到了什么，而是你让别人看到了什么。",
  "每一位艺术家都是将自己的灵魂蘸在笔尖。",
  "创造力需要勇气。",
  "绘画是看得见的诗歌，而诗歌是听得见的绘画。"
];

const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [showCurtain, setShowCurtain] = useState(true);

  useEffect(() => {
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length));

    // Precise 4 seconds duration for luxury feel
    const duration = 4000; 
    const start = Date.now();
    let animationFrame: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const ratio = Math.min(1, elapsed / duration);
      // Quintic ease out for a more weighted progress feel
      const eased = 1 - Math.pow(1 - ratio, 5);
      
      const nextProgress = Math.floor(eased * 100);
      setProgress(nextProgress);

      if (ratio >= 1) {
        // Step 1: Start fading out preloader UI
        setTimeout(() => setIsExiting(true), 200);
        
        // Step 2: Trigger the parent complete (Home view enters behind curtains)
        setTimeout(() => {
            onComplete();
            // Step 3: Remove preloader completely
            setTimeout(() => setShowCurtain(false), 2000); // Wait for curtain animation
        }, 800); 
      } else {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => cancelAnimationFrame(animationFrame);
  }, [onComplete]);

  if (!showCurtain) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      
      {/* Texture Background Overlay */}
      <div className={`absolute inset-0 bg-[#080808] z-10 transition-opacity duration-1000 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/film-grain.png')]"></div>
      </div>

      {/* Left Curtain */}
      <div 
        className={`absolute top-0 left-0 h-full bg-[#0a0a0a] z-20 transition-transform duration-[2000ms] ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform flex items-center justify-end
        ${isExiting ? '-translate-x-full' : 'translate-x-0'}`}
        style={{ width: '50%' }}
      >
          <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-art-primary/40 to-transparent"></div>
      </div>

      {/* Right Curtain */}
      <div 
        className={`absolute top-0 right-0 h-full bg-[#0a0a0a] z-20 transition-transform duration-[2000ms] ease-[cubic-bezier(0.76,0,0.24,1)] will-change-transform flex items-center justify-start
        ${isExiting ? 'translate-x-full' : 'translate-x-0'}`}
        style={{ width: '50%' }}
      >
          <div className="absolute left-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-art-primary/40 to-transparent"></div>
      </div>

      {/* Center Content UI */}
      <div className={`relative z-30 flex flex-col items-center justify-center transition-all duration-800 ${isExiting ? 'opacity-0 scale-90 blur-xl' : 'opacity-100 scale-100'}`}>
         
         <div className="mb-12 relative group">
             <div className="absolute inset-0 bg-art-primary/20 blur-[50px] rounded-full animate-pulse"></div>
             <div className="relative w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-md">
                <Palette size={40} className="text-white opacity-90 animate-spin-slow" strokeWidth={1} />
             </div>
         </div>

         <div className="flex flex-col items-center gap-2 mb-10">
             <div className="flex items-baseline gap-3">
                <span className="font-serif text-[12vh] leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-200 to-stone-500 font-medium tabular-nums">
                    {progress}
                </span>
                <span className="text-art-primary font-bold text-lg">%</span>
             </div>
             <span className="text-[9px] font-bold uppercase tracking-[0.6em] text-white/30">Curating the Masterpieces</span>
         </div>

         {/* Cinematic Progress Bar */}
         <div className="w-80 h-[1.5px] bg-stone-900 relative overflow-hidden rounded-full mb-14 border border-white/5">
            <div 
                className="absolute top-0 left-0 h-full bg-art-primary shadow-[0_0_20px_rgba(188,75,26,0.8)] transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
         </div>

         <div className="h-20 flex items-center justify-center text-center px-8">
             <p className="font-serif italic text-stone-400 text-lg tracking-widest max-w-lg leading-relaxed animate-fade-in-up">
                 “{QUOTES[quoteIdx]}”
             </p>
         </div>
      </div>
    </div>
  );
};

export default Preloader;
