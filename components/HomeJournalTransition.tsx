import React, { useRef, useEffect, useCallback, useState } from 'react';

// ── Scroll zones (px) ─────────────────────────────────────────────
const SLIDE_IN_START = 80;
const SLIDE_IN_END   = 500;
const PIN_END        = 800;
const SHRINK_END     = 1400;

// ── Helpers ───────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp  = (a: number, b: number, t: number)   => a + (b - a) * clamp(t, 0, 1);
const prog  = (y: number, s: number, e: number)   => clamp((y - s) / (e - s), 0, 1);
const easeOutExpo    = (t: number) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
const easeInOutCubic = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const HomeJournalTransition: React.FC<Props> = ({ onComplete, onBack }) => {
  const scrollRef      = useRef<HTMLDivElement>(null);
  const cardRef        = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const doneRef        = useRef(false);
  const backRef        = useRef(false);
  const [fadingOut, setFadingOut] = useState(false);

  const update = useCallback(() => {
    const container = scrollRef.current;
    const card      = cardRef.current;
    const ph        = placeholderRef.current;
    if (!container || !card || !ph) return;

    const sy = container.scrollTop;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Back: user scrolled back to top
    if (sy <= 0 && !doneRef.current && !backRef.current) {
      backRef.current = true;
      onBack();
      return;
    }

    // Placeholder rect (live, changes as page scrolls)
    const rect    = ph.getBoundingClientRect();
    const targetTX    = (rect.left + rect.width  / 2) - vw / 2;
    const targetTY    = (rect.top  + rect.height / 2) - vh / 2;
    const targetScale = Math.min(rect.width / vw, rect.height / vh);

    // Phase A
    if (sy < SLIDE_IN_START) {
      card.style.transform    = 'translate3d(0, 100vh, 0) scale(1)';
      card.style.borderRadius = '0px';
      return;
    }
    // Phase B: slide in
    if (sy < SLIDE_IN_END) {
      const p = easeOutExpo(prog(sy, SLIDE_IN_START, SLIDE_IN_END));
      card.style.transform    = `translate3d(0, ${lerp(100, 0, p)}vh, 0) scale(1)`;
      card.style.borderRadius = '0px';
      return;
    }
    // Phase C: pinned full screen
    if (sy < PIN_END) {
      card.style.transform    = 'translate3d(0, 0, 0) scale(1)';
      card.style.borderRadius = '0px';
      return;
    }
    // Phase D: shrink to placeholder
    if (sy < SHRINK_END) {
      const p = easeInOutCubic(prog(sy, PIN_END, SHRINK_END));
      card.style.transform    = `translate3d(${lerp(0, targetTX, p)}px, ${lerp(0, targetTY, p)}px, 0) scale(${lerp(1, targetScale, p)})`;
      card.style.borderRadius = `${lerp(0, 28, p)}px`;
      return;
    }
    // Phase E: done — fade out and hand off to journal
    card.style.transform    = `translate3d(${targetTX}px, ${targetTY}px, 0) scale(${targetScale})`;
    card.style.borderRadius = '28px';
    if (!doneRef.current) {
      doneRef.current = true;
      setFadingOut(true);
      setTimeout(() => onComplete(), 350);
    }
  }, [onComplete, onBack]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    // Start slightly scrolled so animation begins immediately on mount
    container.scrollTop = SLIDE_IN_START + 10;
    update();
    container.addEventListener('scroll', update, { passive: true });
    return () => container.removeEventListener('scroll', update);
  }, [update]);

  return (
    <div
      className="fixed inset-0 z-[80]"
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? 'opacity 350ms ease' : 'none',
        pointerEvents: fadingOut ? 'none' : 'auto',
      }}
    >
      {/* ── Scroll driver ── */}
      <div
        ref={scrollRef}
        className="w-full h-full overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Home sticky section — transparent so real home shows through */}
        <div style={{ height: '1700px', background: 'transparent' }}>
          <div style={{
            position: 'sticky', top: 0, height: '100vh',
            background: '#F9F8F6',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            <h1 style={{ fontFamily: 'serif', fontSize: 'clamp(3rem,8vw,6rem)', fontWeight: 900, color: '#1a1a1a', fontStyle: 'italic' }}>
              ArtIsLife
            </h1>
            <p style={{ fontSize: '0.7rem', color: '#bbb', letterSpacing: '0.4em', textTransform: 'uppercase' }}>
              继续向下滚动
            </p>
          </div>
        </div>

        {/* Journal section */}
        <div style={{ background: '#fff', padding: '48px 48px 120px', minHeight: '100vh' }}>
          <h2 style={{
            fontFamily: 'serif', fontSize: 'clamp(2rem,5vw,3.5rem)',
            fontWeight: 900, fontStyle: 'italic', color: '#1a1a1a', marginBottom: 32,
          }}>
            创作日志
          </h2>
          {/* Invisible placeholder — card lands here */}
          <div ref={placeholderRef} style={{ width: '100%', height: 420, borderRadius: 28, marginBottom: 24 }} />
          {/* Other articles */}
          {['卡拉瓦乔的光影革命', '克林姆特的金色密码', '莫奈的睡莲', '伦勃朗自画像'].map((title, i) => (
            <div key={i} style={{
              background: '#f5f3f0', borderRadius: 16,
              padding: '24px 28px', marginBottom: 16, color: '#666', fontSize: '1rem',
            }}>
              {title}
            </div>
          ))}
        </div>
      </div>

      {/* ── Overlay card (scroll-driven) ── */}
      <div
        ref={cardRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          background: '#BC4B1A', color: 'white',
          display: 'flex', borderRadius: 0,
          overflow: 'hidden',
          willChange: 'transform, border-radius',
          transformOrigin: 'center center',
          transform: 'translate3d(0, 100vh, 0) scale(1)',
          pointerEvents: 'none',
        }}
      >
        {/* Image side */}
        <div style={{ width: '58%', height: '100%', flexShrink: 0, overflow: 'hidden', background: '#8B3510' }}>
          <img
            src="/artworks/paintings/Water Lilies.jpg"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt=""
          />
        </div>
        {/* Text side */}
        <div style={{ flex: 1, padding: 'clamp(32px,5vw,60px) clamp(24px,4vw,48px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.7 }}>
            深度专栏
          </span>
          <h2 style={{ fontFamily: 'serif', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, lineHeight: 1.1 }}>
            数字工具如何重塑当代绘画技巧
          </h2>
          <p style={{ fontSize: '1rem', opacity: 0.75, lineHeight: 1.6, maxWidth: 360 }}>
            从图层叠加到撤销操作，数字逻辑正在潜移默化地改变艺术家的思维方式。
          </p>
          <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>S</div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sophia Chen</p>
              <p style={{ fontSize: 10, opacity: 0.6 }}>2025.06.10</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeJournalTransition;
