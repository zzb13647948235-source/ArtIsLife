import React, { useState, useEffect } from 'react';

const JournalTransition: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'enter' | 'shrink'>('enter');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // slide-in takes 600ms, hold until 1100ms, then shrink
    const t1 = setTimeout(() => setPhase('shrink'), 1100);
    const t2 = setTimeout(() => { setVisible(false); onComplete(); }, 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  if (!visible) return null;

  const shrinkStyle: React.CSSProperties = {
    transform: 'scale(0.34) translateY(-62%)',
    opacity: 0,
    borderRadius: '40px',
    transformOrigin: 'top center',
    transition: [
      'transform 750ms cubic-bezier(0.24, 1, 0.36, 1)',
      'opacity 500ms cubic-bezier(0.24, 1, 0.36, 1)',
      'border-radius 750ms ease',
    ].join(', '),
  };

  return (
    <div
      className={`fixed inset-0 z-[80] overflow-hidden bg-white ${phase === 'enter' ? 'animate-slide-from-bottom' : ''}`}
      style={{ pointerEvents: 'none', ...(phase === 'shrink' ? shrinkStyle : {}) }}
    >
      <div className="w-full h-full flex flex-col md:flex-row">
        <div className="md:w-[58%] relative h-[45vh] md:h-full overflow-hidden bg-stone-200">
          <img src="/artworks/paintings/Water Lilies.jpg" className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </div>
        <div className="md:w-[42%] px-10 py-12 md:px-20 md:py-0 flex flex-col justify-center gap-6 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-art-primary">深度专栏</span>
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight">
            数字工具如何重塑当代绘画技巧
          </h2>
          <p className="text-stone-500 text-base md:text-lg leading-relaxed font-light max-w-md">
            从图层叠加到撤销操作，数字逻辑正在潜移默化地改变艺术家的思维方式。探讨 AI 辅助创作对传统油画技法的冲击与融合。
          </p>
          <div className="pt-6 border-t border-stone-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 text-sm font-bold font-serif">S</div>
            <div>
              <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">Sophia Chen</p>
              <p className="text-[10px] text-stone-400">2025.06.10</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalTransition;
