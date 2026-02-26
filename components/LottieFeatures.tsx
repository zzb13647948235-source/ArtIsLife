import React, { useRef, useEffect, useState } from 'react';
import Lottie from 'lottie-react';

const FEATURES = [
  {
    src: '/carte_crash.json',
    title: 'AI 艺术生成',
    subtitle: 'AI Generation',
    desc: '输入一句灵感，AI 即刻为你创作独一无二的艺术画作。',
    bg: '#FFF5F0',
    accent: '#E84B2A',
  },
  {
    src: '/carte_caf.json',
    title: '风格探索',
    subtitle: 'Style Explorer',
    desc: '从印象派到超现实主义，沉浸式探索 100+ 经典艺术流派。',
    bg: '#F0F8FF',
    accent: '#2B4590',
  },
  {
    src: '/carte_antiox.json',
    title: '名画修复',
    subtitle: 'Restore Masters',
    desc: '在游戏中修复大师名画，感受色彩与构图的极致魅力。',
    bg: '#F5FFF0',
    accent: '#52B788',
  },
  {
    src: '/carte_vege.json',
    title: '艺术社区',
    subtitle: 'Art Community',
    desc: '分享你的创作，与全球艺术爱好者共鸣，共建创作生态。',
    bg: '#FFFBF0',
    accent: '#E9C46A',
  },
];

type Feature = typeof FEATURES[0];

const FeatureCard: React.FC<{ feature: Feature; index: number }> = ({ feature, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [animData, setAnimData] = useState<object | null>(null);

  useEffect(() => {
    fetch(feature.src).then(r => r.json()).then(setAnimData).catch(() => {});
  }, [feature.src]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col gap-3 md:gap-4 cursor-default transition-all duration-700"
      style={{
        background: feature.bg,
        border: `2px solid ${hovered ? feature.accent : 'transparent'}`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transitionDelay: `${index * 0.12}s`,
        boxShadow: hovered ? `0 20px 60px -10px ${feature.accent}30` : '0 4px 20px rgba(0,0,0,0.04)',
        transition: `opacity 0.7s ease ${index * 0.12}s, transform 0.7s ease ${index * 0.12}s, border-color 0.3s ease, box-shadow 0.3s ease`,
      }}
    >
      <div className="w-14 h-14 md:w-20 md:h-20 mx-auto">
        {animData && (
          <Lottie animationData={animData} loop autoplay style={{ width: '100%', height: '100%' }} />
        )}
      </div>
      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: feature.accent }}>
          {feature.subtitle}
        </div>
        <h3 className="text-sm md:text-lg font-black text-stone-900 mb-1 md:mb-2">{feature.title}</h3>
        <p className="text-xs md:text-sm text-stone-500 leading-relaxed hidden sm:block">{feature.desc}</p>
      </div>
      <div
        className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full transition-all duration-500"
        style={{
          background: feature.accent,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
        }}
      />
    </div>
  );
};

const LottieFeatures: React.FC = () => {
  const titleRef = useRef<HTMLDivElement>(null);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTitleVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (titleRef.current) obs.observe(titleRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-12 bg-art-bg relative z-30 -mt-px">
      <div
        ref={titleRef}
        className="text-center mb-10 md:mb-16 transition-all duration-1000"
        style={{
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? 'translateY(0)' : 'translateY(30px)',
        }}
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-8 md:w-12 h-px bg-art-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-art-primary">核心体验</span>
          <div className="w-8 md:w-12 h-px bg-art-primary" />
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-[-0.03em] text-stone-900 leading-none">
          四大<br />
          <span className="text-art-primary">体验</span>
        </h2>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.subtitle} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
};

export default LottieFeatures;
