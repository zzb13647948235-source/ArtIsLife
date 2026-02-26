import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { X, Palette } from 'lucide-react';

const ART_TIPS = [
  '达芬奇画蒙娜丽莎用了约 4 年时间',
  '梵高一生只卖出过一幅画',
  '毕加索 9 岁完成了第一幅油画',
  '《星夜》是梵高在精神病院里画的',
  '卢浮宫收藏超过 38 万件艺术品',
  '莫奈晚年患有白内障，仍坚持创作',
  '《呐喊》的作者蒙克一生画了 4 个版本',
  '达利的胡子是他的标志性符号',
  '拉斐尔 37 岁去世，留下了无数传世之作',
  '米开朗基罗画西斯廷天顶花了 4 年',
];

const FloatingArtTip: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tip] = useState(() => ART_TIPS[Math.floor(Math.random() * ART_TIPS.length)]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const card = cardRef.current;
    if (!card) return;

    gsap.set(card, { x: 280, opacity: 0 });

    // 3 秒后滑入
    const showTimer = setTimeout(() => {
      gsap.to(card, { x: 0, opacity: 1, duration: 1.0, ease: 'expo.out' });
    }, 3000);

    // 8 秒后自动收起
    const hideTimer = setTimeout(() => {
      gsap.to(card, { x: 280, opacity: 0, duration: 0.7, ease: 'expo.in',
        onComplete: () => setDismissed(true)
      });
    }, 11000);

    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [dismissed]);

  const handleDismiss = () => {
    gsap.to(cardRef.current, {
      x: 280, opacity: 0, duration: 0.6, ease: 'expo.in',
      onComplete: () => setDismissed(true),
    });
  };

  if (dismissed) return null;

  return (
    <div
      ref={cardRef}
      className="fixed bottom-8 right-6 z-[500] w-56 pointer-events-auto"
      style={{ willChange: 'transform, opacity' }}
    >
      <div className="bg-art-surface/95 backdrop-blur-md border border-art-border rounded-2xl shadow-hard p-4 relative overflow-hidden">
        {/* 装饰色条 */}
        <div className="absolute top-0 left-0 w-1 h-full bg-art-primary rounded-l-2xl" />
        <button
          onClick={handleDismiss}
          className="no-min absolute top-2 right-2 w-6 h-6 min-h-0 min-w-0 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors text-art-muted"
        >
          <X size={11} />
        </button>
        <div className="flex items-center gap-2 mb-2 pl-2">
          <Palette size={13} className="text-art-primary flex-shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-art-primary">艺术小知识</span>
        </div>
        <p className="text-[11px] text-art-secondary leading-relaxed font-serif italic pl-2">
          {tip}
        </p>
      </div>
    </div>
  );
};

export default FloatingArtTip;
