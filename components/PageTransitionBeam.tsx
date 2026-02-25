import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ViewState } from '../types';

interface PageTransitionBeamProps {
  currentView: ViewState;
  previousView: ViewState;
}

// Colors — warm retro palette
const PINK   = '#FF8BA7';
const YELLOW = '#FFC65C';
const ORANGE = '#FF7F50';

// viewBox is 1440 x 900 (fixed viewport)
// Paths are designed per-page, each set of 6 lines (3 left + 3 right)
// Lines flow continuously — end of one page connects visually to start of next
// All coordinates are in the 1440x900 viewBox space

const PAGE_PATHS: Record<string, { d: string; color: string }[]> = {
  intro: [],

  home: [
    // Left group — flows down from top-left, curves toward center
    { d: 'M 55,-30 L 55,260 Q 55,460 155,530 Q 255,600 220,750 L 180,900', color: ORANGE },
    { d: 'M 90,-30 L 90,260 Q 90,430 190,500 Q 290,570 255,720 L 215,870', color: YELLOW },
    { d: 'M 125,-30 L 125,260 Q 125,400 225,470 Q 325,540 290,690 L 250,840', color: PINK },
    // Right group — flows down from top-right, curves inward
    { d: 'M 1385,-30 L 1385,500 Q 1385,720 1270,800 Q 1155,880 1100,900', color: ORANGE },
    { d: 'M 1350,-30 L 1350,500 Q 1350,690 1235,770 Q 1120,850 1065,870', color: YELLOW },
    { d: 'M 1315,-30 L 1315,500 Q 1315,660 1200,740 Q 1085,820 1030,840', color: PINK },
  ],

  journal: [
    // Left — hugs left edge, dips inward mid-page (editorial feel)
    { d: 'M 40,-30 L 40,180 Q 40,380 110,460 Q 180,540 100,680 L 50,900', color: ORANGE },
    { d: 'M 75,-30 L 75,180 Q 75,350 145,430 Q 215,510 135,650 L 85,870', color: YELLOW },
    { d: 'M 110,-30 L 110,180 Q 110,320 180,400 Q 250,480 170,620 L 120,840', color: PINK },
    // Right — mirrors left
    { d: 'M 1400,-30 L 1400,180 Q 1400,380 1330,460 Q 1260,540 1340,680 L 1390,900', color: ORANGE },
    { d: 'M 1365,-30 L 1365,180 Q 1365,350 1295,430 Q 1225,510 1305,650 L 1355,870', color: YELLOW },
    { d: 'M 1330,-30 L 1330,180 Q 1330,320 1260,400 Q 1190,480 1270,620 L 1320,840', color: PINK },
  ],

  styles: [
    // Left starts high, crosses to right side mid-page (alternating layout)
    { d: 'M 1390,-30 L 1390,160 Q 1390,320 1080,400 Q 770,480 660,620 L 580,900', color: ORANGE },
    { d: 'M 1355,-30 L 1355,160 Q 1355,290 1045,370 Q 735,450 625,590 L 545,870', color: YELLOW },
    { d: 'M 1320,-30 L 1320,160 Q 1320,260 1010,340 Q 700,420 590,560 L 510,840', color: PINK },
    // Right starts low, crosses to left
    { d: 'M 50,-30 L 50,160 Q 50,320 360,400 Q 670,480 780,620 L 860,900', color: ORANGE },
    { d: 'M 85,-30 L 85,160 Q 85,290 395,370 Q 705,450 815,590 L 895,870', color: YELLOW },
    { d: 'M 120,-30 L 120,160 Q 120,260 430,340 Q 740,420 850,560 L 930,840', color: PINK },
  ],

  gallery: [
    // Left — short, hugs sidebar
    { d: 'M 45,-30 L 45,140 Q 45,260 115,300 Q 185,340 160,480 L 130,620', color: ORANGE },
    { d: 'M 78,-30 L 78,140 Q 78,235 148,275 Q 218,315 193,455 L 163,595', color: YELLOW },
    { d: 'M 111,-30 L 111,140 Q 111,210 181,250 Q 251,290 226,430 L 196,570', color: PINK },
    // Right — tall, sweeps the canvas area
    { d: 'M 1395,-30 L 1395,600 Q 1395,800 1265,870 L 1060,900', color: ORANGE },
    { d: 'M 1360,-30 L 1360,600 Q 1360,770 1230,840 L 1025,870', color: YELLOW },
    { d: 'M 1325,-30 L 1325,600 Q 1325,740 1195,810 L 990,840', color: PINK },
  ],

  chat: [
    // Left — mid-height, sidebar width
    { d: 'M 50,-30 L 50,190 Q 50,340 130,380 Q 210,420 185,560 L 155,700', color: ORANGE },
    { d: 'M 83,-30 L 83,190 Q 83,310 163,350 Q 243,390 218,530 L 188,670', color: YELLOW },
    { d: 'M 116,-30 L 116,190 Q 116,280 196,320 Q 276,360 251,500 L 221,640', color: PINK },
    // Right — full height chat area
    { d: 'M 1390,-30 L 1390,680 Q 1390,840 1250,900', color: ORANGE },
    { d: 'M 1355,-30 L 1355,680 Q 1355,810 1215,870', color: YELLOW },
    { d: 'M 1320,-30 L 1320,680 Q 1320,780 1180,840', color: PINK },
  ],

  game: [
    // Horizontal arcs across top — immersive feel
    { d: 'M -30,70 Q 180,50 380,110 Q 580,170 720,150 Q 860,130 1060,170 Q 1260,210 1470,70', color: ORANGE },
    { d: 'M -30,108 Q 180,88 380,148 Q 580,208 720,188 Q 860,168 1060,208 Q 1260,248 1470,108', color: YELLOW },
    { d: 'M -30,146 Q 180,126 380,186 Q 580,246 720,226 Q 860,206 1060,246 Q 1260,286 1470,146', color: PINK },
    // Bottom arcs
    { d: 'M -30,830 Q 180,850 380,790 Q 580,730 720,750 Q 860,770 1060,730 Q 1260,690 1470,830', color: ORANGE },
    { d: 'M -30,792 Q 180,812 380,752 Q 580,692 720,712 Q 860,732 1060,692 Q 1260,652 1470,792', color: YELLOW },
    { d: 'M -30,754 Q 180,774 380,714 Q 580,654 720,674 Q 860,694 1060,654 Q 1260,614 1470,754', color: PINK },
  ],

  map: [
    // Left — sidebar, flows down
    { d: 'M 42,-30 L 42,320 Q 42,520 122,580 Q 202,640 175,780 L 145,900', color: ORANGE },
    { d: 'M 75,-30 L 75,320 Q 75,490 155,550 Q 235,610 208,750 L 178,870', color: YELLOW },
    { d: 'M 108,-30 L 108,320 Q 108,460 188,520 Q 268,580 241,720 L 211,840', color: PINK },
    // Right — map area, wide sweep
    { d: 'M 1398,-30 L 1398,380 Q 1398,580 1295,650 Q 1192,720 1110,820 L 1070,900', color: ORANGE },
    { d: 'M 1363,-30 L 1363,380 Q 1363,550 1260,620 Q 1157,690 1075,790 L 1035,870', color: YELLOW },
    { d: 'M 1328,-30 L 1328,380 Q 1328,520 1225,590 Q 1122,660 1040,760 L 1000,840', color: PINK },
  ],

  market: [
    // Left — filter sidebar, tight
    { d: 'M 38,-30 L 38,460 Q 38,660 108,710 Q 178,760 150,880 L 130,900', color: ORANGE },
    { d: 'M 68,-30 L 68,460 Q 68,630 138,680 Q 208,730 180,850 L 160,870', color: YELLOW },
    { d: 'M 98,-30 L 98,460 Q 98,600 168,650 Q 238,700 210,820 L 190,840', color: PINK },
    // Right — grid sweeps wide and curves down
    { d: 'M 1402,-30 L 1402,280 Q 1402,480 1195,560 Q 988,640 890,780 L 855,900', color: ORANGE },
    { d: 'M 1367,-30 L 1367,280 Q 1367,450 1160,530 Q 953,610 855,750 L 820,870', color: YELLOW },
    { d: 'M 1332,-30 L 1332,280 Q 1332,420 1125,500 Q 918,580 820,720 L 785,840', color: PINK },
  ],

  community: [
    // Both sides flow down symmetrically — masonry grid
    { d: 'M 48,-30 L 48,360 Q 48,580 158,660 Q 268,740 195,880 L 165,900', color: ORANGE },
    { d: 'M 81,-30 L 81,360 Q 81,550 191,630 Q 301,710 228,850 L 198,870', color: YELLOW },
    { d: 'M 114,-30 L 114,360 Q 114,520 224,600 Q 334,680 261,820 L 231,840', color: PINK },
    { d: 'M 1392,-30 L 1392,360 Q 1392,580 1282,660 Q 1172,740 1245,880 L 1275,900', color: ORANGE },
    { d: 'M 1359,-30 L 1359,360 Q 1359,550 1249,630 Q 1139,710 1212,850 L 1242,870', color: YELLOW },
    { d: 'M 1326,-30 L 1326,360 Q 1326,520 1216,600 Q 1106,680 1179,820 L 1209,840', color: PINK },
  ],
};

const HIDDEN_VIEWS = new Set(['login', 'membership', 'about']);

const PageTransitionBeam: React.FC<PageTransitionBeamProps> = ({ currentView, previousView }) => {
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const lengthsRef = useRef<Map<string, number>>(new Map());
  const rafRef = useRef<number | null>(null);
  const [displayView, setDisplayView] = useState<ViewState>(currentView);
  const [opacity, setOpacity] = useState(0);

  const paths = HIDDEN_VIEWS.has(displayView) ? [] : (PAGE_PATHS[displayView] ?? []);

  // Compute lengths when paths change
  const computeLengths = useCallback(() => {
    lengthsRef.current.clear();
    pathRefs.current.forEach((el, key) => {
      const len = el.getTotalLength();
      lengthsRef.current.set(key, len);
      el.style.strokeDasharray = `${len} ${len}`;
      el.style.strokeDashoffset = `${len}`;
    });
  }, []);

  // Draw lines based on scroll progress 0..1
  const draw = useCallback((progress: number) => {
    const p = Math.min(progress * 1.2, 1);
    pathRefs.current.forEach((el, key) => {
      const len = lengthsRef.current.get(key) ?? 0;
      if (!len) return;
      const idx = parseInt(key.split('-')[1] ?? '0');
      const stagger = idx * 0.05;
      const local = Math.min(Math.max((p - stagger) / (1 - stagger * 5 + 0.01), 0), 1);
      el.style.strokeDashoffset = `${Math.max(len - len * local, 0)}`;
    });
  }, []);

  // Listen to scroll on active page container
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

  // Page transition
  useEffect(() => {
    if (currentView === previousView) return;
    setOpacity(0);
    const t = setTimeout(() => {
      setDisplayView(currentView);
      setOpacity(1);
    }, 300);
    return () => clearTimeout(t);
  }, [currentView, previousView]);

  // Initial fade-in
  useEffect(() => {
    const t = setTimeout(() => setOpacity(1), 900);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute lengths after paths render
  useEffect(() => {
    const t = setTimeout(computeLengths, 50);
    return () => clearTimeout(t);
  }, [displayView, computeLengths]);

  if (paths.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 55, opacity, transition: 'opacity 300ms ease' }}
      aria-hidden="true"
    >
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {paths.map((p, i) => {
          const key = `${displayView}-${i}`;
          return (
            <path
              key={key}
              ref={el => {
                if (el) pathRefs.current.set(key, el);
                else pathRefs.current.delete(key);
              }}
              d={p.d}
              fill="none"
              stroke={p.color}
              strokeWidth="38"
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
