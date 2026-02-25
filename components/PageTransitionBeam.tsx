import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ViewState } from '../types';

interface PageTransitionBeamProps {
  currentView: ViewState;
  previousView: ViewState;
}

const PINK   = '#FF8BA7';
const YELLOW = '#FFC65C';
const ORANGE = '#FF7F50';

// ─── RELAY BATON PRINCIPLE ────────────────────────────────────────────────────
// Each page's start X must match the previous page's end X.

const PAGE_PATHS: Record<string, { d: string; color: string }[]> = {
  intro: [],

  home: [
    { d: 'M 55,-30 L 55,280 Q 55,480 160,560 Q 265,640 220,780 L 180,930', color: ORANGE },
    { d: 'M 90,-30 L 90,280 Q 90,450 195,530 Q 300,610 255,750 L 215,900', color: YELLOW },
    { d: 'M 125,-30 L 125,280 Q 125,420 230,500 Q 335,580 290,720 L 250,870', color: PINK },
    { d: 'M 1385,-30 L 1385,480 Q 1385,700 1265,790 Q 1145,880 1100,930', color: ORANGE },
    { d: 'M 1350,-30 L 1350,480 Q 1350,670 1230,760 Q 1110,850 1065,900', color: YELLOW },
    { d: 'M 1315,-30 L 1315,480 Q 1315,640 1195,730 Q 1075,820 1030,870', color: PINK },
  ],

  journal: [
    { d: 'M 180,-30 Q 100,80 60,200 Q 40,380 100,480 Q 160,580 80,720 L 50,930', color: ORANGE },
    { d: 'M 215,-30 Q 135,80 95,200 Q 75,350 135,450 Q 195,550 115,690 L 85,900', color: YELLOW },
    { d: 'M 250,-30 Q 170,80 130,200 Q 110,320 170,420 Q 230,520 150,660 L 120,870', color: PINK },
    { d: 'M 1100,-30 Q 1180,80 1340,200 Q 1400,380 1340,480 Q 1280,580 1360,720 L 1390,930', color: ORANGE },
    { d: 'M 1065,-30 Q 1145,80 1305,200 Q 1365,350 1305,450 Q 1245,550 1325,690 L 1355,900', color: YELLOW },
    { d: 'M 1030,-30 Q 1110,80 1270,200 Q 1330,320 1270,420 Q 1210,520 1290,660 L 1320,870', color: PINK },
  ],

  styles: [
    { d: 'M 50,-30 L 50,120 Q 50,300 360,400 Q 670,500 780,660 L 860,930', color: ORANGE },
    { d: 'M 85,-30 L 85,120 Q 85,270 395,370 Q 705,470 815,630 L 895,900', color: YELLOW },
    { d: 'M 120,-30 L 120,120 Q 120,240 430,340 Q 740,440 850,600 L 930,870', color: PINK },
    { d: 'M 1390,-30 L 1390,120 Q 1390,300 1080,400 Q 770,500 660,660 L 580,930', color: ORANGE },
    { d: 'M 1355,-30 L 1355,120 Q 1355,270 1045,370 Q 735,470 625,630 L 545,900', color: YELLOW },
    { d: 'M 1320,-30 L 1320,120 Q 1320,240 1010,340 Q 700,440 590,600 L 510,870', color: PINK },
  ],

  gallery: [
    { d: 'M 580,-30 Q 400,100 200,180 Q 100,220 130,400 L 130,930', color: ORANGE },
    { d: 'M 545,-30 Q 365,100 165,180 Q 65,220 163,400 L 163,900', color: YELLOW },
    { d: 'M 510,-30 Q 330,100 130,180 Q 30,220 196,400 L 196,870', color: PINK },
    { d: 'M 860,-30 Q 1040,100 1240,180 Q 1340,220 1310,500 Q 1280,780 1060,930', color: ORANGE },
    { d: 'M 895,-30 Q 1075,100 1275,180 Q 1375,220 1345,500 Q 1315,780 1025,900', color: YELLOW },
    { d: 'M 930,-30 Q 1110,100 1310,180 Q 1410,220 1380,500 Q 1350,780 990,870', color: PINK },
  ],

  chat: [
    { d: 'M 130,-30 L 130,160 Q 130,320 155,420 Q 180,520 155,700 L 155,930', color: ORANGE },
    { d: 'M 163,-30 L 163,160 Q 163,290 188,390 Q 213,490 188,670 L 188,900', color: YELLOW },
    { d: 'M 196,-30 L 196,160 Q 196,260 221,360 Q 246,460 221,640 L 221,870', color: PINK },
    { d: 'M 1060,-30 L 1060,160 Q 1060,360 1150,460 Q 1240,560 1250,730 L 1250,930', color: ORANGE },
    { d: 'M 1025,-30 L 1025,160 Q 1025,330 1115,430 Q 1205,530 1215,700 L 1215,900', color: YELLOW },
    { d: 'M 990,-30 L 990,160 Q 990,300 1080,400 Q 1170,500 1180,670 L 1180,870', color: PINK },
  ],

  game: [
    { d: 'M 155,-30 L 155,60 Q 400,40 720,80 Q 1040,120 1470,60', color: ORANGE },
    { d: 'M 188,-30 L 188,98 Q 400,78 720,118 Q 1040,158 1470,98', color: YELLOW },
    { d: 'M 221,-30 L 221,136 Q 400,116 720,156 Q 1040,196 1470,136', color: PINK },
    { d: 'M 1250,-30 L 1250,760 Q 1040,800 720,760 Q 400,720 -30,780', color: ORANGE },
    { d: 'M 1215,-30 L 1215,798 Q 1040,838 720,798 Q 400,758 -30,818', color: YELLOW },
    { d: 'M 1180,-30 L 1180,836 Q 1040,876 720,836 Q 400,796 -30,856', color: PINK },
  ],

  map: [
    { d: 'M 50,-30 L 50,300 Q 50,520 130,590 Q 210,660 175,800 L 145,930', color: ORANGE },
    { d: 'M 85,-30 L 85,300 Q 85,490 165,560 Q 245,630 210,770 L 178,900', color: YELLOW },
    { d: 'M 120,-30 L 120,300 Q 120,460 200,530 Q 280,600 245,740 L 211,870', color: PINK },
    { d: 'M 1390,-30 L 1390,360 Q 1390,560 1285,640 Q 1180,720 1110,840 L 1070,930', color: ORANGE },
    { d: 'M 1355,-30 L 1355,360 Q 1355,530 1250,610 Q 1145,690 1075,810 L 1035,900', color: YELLOW },
    { d: 'M 1320,-30 L 1320,360 Q 1320,500 1215,580 Q 1110,660 1040,780 L 1000,870', color: PINK },
  ],

  market: [
    { d: 'M 145,-30 Q 100,100 60,260 L 60,500 Q 60,680 120,730 Q 180,780 130,930', color: ORANGE },
    { d: 'M 178,-30 Q 133,100 93,260 L 93,500 Q 93,650 153,700 Q 213,750 160,900', color: YELLOW },
    { d: 'M 211,-30 Q 166,100 126,260 L 126,500 Q 126,620 186,670 Q 246,720 190,870', color: PINK },
    { d: 'M 1070,-30 Q 1200,100 1360,260 L 1360,400 Q 1360,580 1150,660 Q 940,740 855,930', color: ORANGE },
    { d: 'M 1035,-30 Q 1165,100 1325,260 L 1325,400 Q 1325,550 1115,630 Q 905,710 820,900', color: YELLOW },
    { d: 'M 1000,-30 Q 1130,100 1290,260 L 1290,400 Q 1290,520 1080,600 Q 870,680 785,870', color: PINK },
  ],

  community: [
    { d: 'M 130,-30 L 130,200 Q 130,440 200,560 Q 270,680 165,860 L 165,930', color: ORANGE },
    { d: 'M 160,-30 L 160,200 Q 160,410 230,530 Q 300,650 198,830 L 198,900', color: YELLOW },
    { d: 'M 190,-30 L 190,200 Q 190,380 260,500 Q 330,620 231,800 L 231,870', color: PINK },
    { d: 'M 855,-30 L 855,200 Q 855,440 1060,560 Q 1265,680 1275,860 L 1275,930', color: ORANGE },
    { d: 'M 820,-30 L 820,200 Q 820,410 1025,530 Q 1230,650 1242,830 L 1242,900', color: YELLOW },
    { d: 'M 785,-30 L 785,200 Q 785,380 990,500 Q 1195,620 1209,800 L 1209,870', color: PINK },
  ],
};

const HIDDEN_VIEWS = new Set(['login', 'membership', 'about']);

// ─── Stroke style: thick rounded lines with black outline ─────────────────────
// To match flowfest's thick filled stripes with black outlines, we render each
// path TWICE: once with a slightly thicker black stroke (outline), once with
// the color stroke on top. This gives the black border effect without SVG filters.

const STROKE_W = 42;       // colored stroke width
const OUTLINE_W = 50;      // black outline stroke width (drawn behind)

const PageTransitionBeam: React.FC<PageTransitionBeamProps> = ({ currentView, previousView }) => {
  const colorPathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const outlinePathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const lengthsRef = useRef<Map<string, number>>(new Map());
  const rafRef = useRef<number | null>(null);
  const [displayView, setDisplayView] = useState<ViewState>(currentView);
  const [opacity, setOpacity] = useState(0);

  const paths = HIDDEN_VIEWS.has(displayView) ? [] : (PAGE_PATHS[displayView] ?? []);

  const computeLengths = useCallback(() => {
    lengthsRef.current.clear();
    colorPathRefs.current.forEach((el, key) => {
      const len = el.getTotalLength();
      lengthsRef.current.set(key, len);
      el.style.strokeDasharray = `${len} ${len}`;
      el.style.strokeDashoffset = `${len}`;
    });
    outlinePathRefs.current.forEach((el, key) => {
      const len = lengthsRef.current.get(key) ?? el.getTotalLength();
      el.style.strokeDasharray = `${len} ${len}`;
      el.style.strokeDashoffset = `${len}`;
    });
  }, []);

  const draw = useCallback((progress: number) => {
    const p = Math.min(progress * 1.2, 1);
    colorPathRefs.current.forEach((el, key) => {
      const len = lengthsRef.current.get(key) ?? 0;
      if (!len) return;
      const idx = parseInt(key.split('-')[1] ?? '0');
      const stagger = idx * 0.04;
      const local = Math.min(Math.max((p - stagger) / (1 - stagger * 4 + 0.01), 0), 1);
      const offset = `${Math.max(len - len * local, 0)}`;
      el.style.strokeDashoffset = offset;
      const outline = outlinePathRefs.current.get(key);
      if (outline) outline.style.strokeDashoffset = offset;
    });
  }, []);

  useEffect(() => {
    let container: HTMLElement | null = null;
    const onScroll = () => {
      if (!container) return;
      const max = container.scrollHeight - container.clientHeight;
      if (max <= 0) return;
      const p = Math.min(1, Math.max(0, container.scrollTop / max));
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => draw(p));
    };
    const timer = setTimeout(() => {
      container = document.getElementById(`page-${displayView}`)
        ?.querySelector('.scroll-container') as HTMLElement | null;
      if (container) {
        container.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      if (container) container.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [displayView, draw]);

  useEffect(() => {
    if (currentView === previousView) return;
    setOpacity(0);
    const t = setTimeout(() => { setDisplayView(currentView); setOpacity(1); }, 280);
    return () => clearTimeout(t);
  }, [currentView, previousView]);

  useEffect(() => {
    const t = setTimeout(() => setOpacity(1), 900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(computeLengths, 50);
    return () => clearTimeout(t);
  }, [displayView, computeLengths]);

  if (paths.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 5, opacity, transition: 'opacity 280ms ease' }}
      aria-hidden="true"
    >
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Black outline layer (drawn first, behind) */}
        {paths.map((p, i) => {
          const key = `${displayView}-${i}`;
          return (
            <path
              key={`outline-${key}`}
              ref={el => {
                if (el) outlinePathRefs.current.set(key, el);
                else outlinePathRefs.current.delete(key);
              }}
              d={p.d}
              fill="none"
              stroke="#111111"
              strokeWidth={OUTLINE_W}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
        {/* Colored layer (drawn on top) */}
        {paths.map((p, i) => {
          const key = `${displayView}-${i}`;
          return (
            <path
              key={`color-${key}`}
              ref={el => {
                if (el) colorPathRefs.current.set(key, el);
                else colorPathRefs.current.delete(key);
              }}
              d={p.d}
              fill="none"
              stroke={p.color}
              strokeWidth={STROKE_W}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default PageTransitionBeam;
