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

  // ── HOME ──────────────────────────────────────────────────────────────────────
  // Left trio: enters top-right ~x=1100, makes a grand sweeping arc that
  // plunges deep toward the left wall, then gracefully exits bottom-left ~x=120.
  // Right trio: mirrors — enters top-left ~x=340, arcs deep right, exits ~x=1320.
  // The two groups form a wide open "mouth" shape framing the page content.
  home: [
    { d: 'M 1100,-30 C 1100,180 -80,480 -80,700 C -80,860 80,900 120,930', color: ORANGE },
    { d: 'M 1140,-30 C 1140,180 -40,480 -40,700 C -40,860 115,900 155,930', color: YELLOW },
    { d: 'M 1180,-30 C 1180,180  0,480   0,700 C   0,860 150,900 190,930', color: PINK },
    { d: 'M 340,-30  C 340,180 1520,480 1520,700 C 1520,860 1360,900 1320,930', color: ORANGE },
    { d: 'M 300,-30  C 300,180 1480,480 1480,700 C 1480,860 1325,900 1285,930', color: YELLOW },
    { d: 'M 260,-30  C 260,180 1440,480 1440,700 C 1440,860 1290,900 1250,930', color: PINK },
  ],

  // ── JOURNAL ───────────────────────────────────────────────────────────────────
  // Left trio: picks up from home's bottom-left ~x=120. Hugs the left wall with
  // a deep inward bow — dips toward x=-120 at mid-height, resurfaces at ~x=60.
  // Right trio: picks up ~x=1320. Hugs right wall, bows to x=1560, exits ~x=1380.
  // Creates a "breathing" bilateral symmetry — walls inhaling and exhaling.
  journal: [
    { d: 'M 120,-30 C -120,150 -120,450 -60,600 C 0,750 60,840 60,930', color: ORANGE },
    { d: 'M 155,-30 C -85,150 -85,450 -25,600 C 35,750 95,840 95,930', color: YELLOW },
    { d: 'M 190,-30 C -50,150 -50,450  10,600 C 70,750 130,840 130,930', color: PINK },
    { d: 'M 1320,-30 C 1560,150 1560,450 1500,600 C 1440,750 1380,840 1380,930', color: ORANGE },
    { d: 'M 1285,-30 C 1525,150 1525,450 1465,600 C 1405,750 1345,840 1345,930', color: YELLOW },
    { d: 'M 1250,-30 C 1490,150 1490,450 1430,600 C 1370,750 1310,840 1310,930', color: PINK },
  ],

  // ── STYLES ────────────────────────────────────────────────────────────────────
  // The showstopper: a full diagonal cross. Left trio enters ~x=60 (bottom of
  // journal left), sweeps all the way to bottom-right ~x=1260 in one bold slash.
  // Right trio enters ~x=1380, slashes to bottom-left ~x=180.
  // The two groups cross at screen center — a dramatic X that commands attention.
  styles: [
    { d: 'M 60,-30 C 60,200 1400,700 1260,930', color: ORANGE },
    { d: 'M 95,-30 C 95,200 1435,700 1295,930', color: YELLOW },
    { d: 'M 130,-30 C 130,200 1470,700 1330,930', color: PINK },
    { d: 'M 1380,-30 C 1380,200  40,700  180,930', color: ORANGE },
    { d: 'M 1345,-30 C 1345,200   5,700  145,930', color: YELLOW },
    { d: 'M 1310,-30 C 1310,200 -30,700  110,930', color: PINK },
  ],

  // ── GALLERY ───────────────────────────────────────────────────────────────────
  // After the cross, stripes need to "unwind". Left trio enters ~x=1260 (styles
  // right exit), makes a sweeping reverse arc back to left ~x=100.
  // Right trio enters ~x=180 (styles left exit), reverse arc back to right ~x=1340.
  // Like a ribbon being pulled back to its natural side — graceful recovery.
  gallery: [
    { d: 'M 1260,-30 C 1260,100 -160,550 100,930', color: ORANGE },
    { d: 'M 1295,-30 C 1295,100 -125,550 135,930', color: YELLOW },
    { d: 'M 1330,-30 C 1330,100  -90,550 170,930', color: PINK },
    { d: 'M 180,-30  C 180,100 1600,550 1340,930', color: ORANGE },
    { d: 'M 145,-30  C 145,100 1565,550 1305,930', color: YELLOW },
    { d: 'M 110,-30  C 110,100 1530,550 1270,930', color: PINK },
  ],

  // ── CHAT ──────────────────────────────────────────────────────────────────────
  // Organic double-S wave. Left trio enters ~x=100, swings right to x=700 at
  // 1/3 height, swings back left to x=-80 at 2/3 height, exits ~x=140.
  // Right trio mirrors. Creates a lively, conversational rhythm — like speech
  // bubbles bouncing back and forth.
  chat: [
    { d: 'M 100,-30 C 800,150 -200,550 -80,750 C 0,880 100,910 140,930', color: ORANGE },
    { d: 'M 135,-30 C 835,150 -165,550 -45,750 C 35,880 135,910 175,930', color: YELLOW },
    { d: 'M 170,-30 C 870,150 -130,550 -10,750 C 70,880 170,910 210,930', color: PINK },
    { d: 'M 1340,-30 C 640,150 1640,550 1520,750 C 1440,880 1340,910 1300,930', color: ORANGE },
    { d: 'M 1305,-30 C 605,150 1605,550 1485,750 C 1405,880 1305,910 1265,930', color: YELLOW },
    { d: 'M 1270,-30 C 570,150 1570,550 1450,750 C 1370,880 1270,910 1230,930', color: PINK },
  ],

  // ── GAME ──────────────────────────────────────────────────────────────────────
  // Energetic convergence — both groups race toward the center of the screen.
  // Left trio enters ~x=140, arcs inward to exit ~x=560 (center-left).
  // Right trio enters ~x=1300, arcs inward to exit ~x=880 (center-right).
  // The gap between them narrows dramatically — tension and excitement.
  game: [
    { d: 'M 140,-30 C 140,350 800,600 560,930', color: ORANGE },
    { d: 'M 175,-30 C 175,350 835,600 595,930', color: YELLOW },
    { d: 'M 210,-30 C 210,350 870,600 630,930', color: PINK },
    { d: 'M 1300,-30 C 1300,350 640,600 880,930', color: ORANGE },
    { d: 'M 1265,-30 C 1265,350 605,600 845,930', color: YELLOW },
    { d: 'M 1230,-30 C 1230,350 570,600 810,930', color: PINK },
  ],

  // ── MAP ───────────────────────────────────────────────────────────────────────
  // After converging, stripes fan back out like compass needles pointing to
  // the four corners of the world. Left trio enters ~x=560, fans hard left
  // to exit ~x=80. Right trio enters ~x=880, fans hard right to exit ~x=1360.
  // The motion feels like zooming out on a map — expanding outward.
  map: [
    { d: 'M 560,-30 C 560,200 -200,650  80,930', color: ORANGE },
    { d: 'M 595,-30 C 595,200 -165,650 115,930', color: YELLOW },
    { d: 'M 630,-30 C 630,200 -130,650 150,930', color: PINK },
    { d: 'M 880,-30  C 880,200 1640,650 1360,930', color: ORANGE },
    { d: 'M 845,-30  C 845,200 1605,650 1325,930', color: YELLOW },
    { d: 'M 810,-30  C 810,200 1570,650 1290,930', color: PINK },
  ],

  // ── MARKET ────────────────────────────────────────────────────────────────────
  // Left trio enters ~x=80, makes a bold outward loop — swings far left to
  // x=-200 at mid-height, then curves back in to exit ~x=120.
  // Right trio enters ~x=1360, loops far right to x=1640, exits ~x=1320.
  // Like price charts — volatile swings that ultimately return to baseline.
  market: [
    { d: 'M 80,-30 C -300,200 -300,600 -100,780 C 0,870 80,910 120,930', color: ORANGE },
    { d: 'M 115,-30 C -265,200 -265,600  -65,780 C 35,870 115,910 155,930', color: YELLOW },
    { d: 'M 150,-30 C -230,200 -230,600  -30,780 C 70,870 150,910 190,930', color: PINK },
    { d: 'M 1360,-30 C 1740,200 1740,600 1540,780 C 1440,870 1360,910 1320,930', color: ORANGE },
    { d: 'M 1325,-30 C 1705,200 1705,600 1505,780 C 1405,870 1325,910 1285,930', color: YELLOW },
    { d: 'M 1290,-30 C 1670,200 1670,600 1470,780 C 1370,870 1290,910 1250,930', color: PINK },
  ],

  // ── COMMUNITY ─────────────────────────────────────────────────────────────────
  // Grand finale. Left trio enters ~x=120, makes the most dramatic sweep of all:
  // a full outward spiral that swings to x=-400 then comes back to embrace
  // the center, exiting ~x=200. Right trio mirrors to x=1840, exits ~x=1240.
  // The stripes feel like arms opening wide to welcome everyone — community.
  community: [
    { d: 'M 120,-30 C -400,100 -400,500 -200,700 C 0,880 160,920 200,930', color: ORANGE },
    { d: 'M 155,-30 C -365,100 -365,500 -165,700 C 35,880 195,920 235,930', color: YELLOW },
    { d: 'M 190,-30 C -330,100 -330,500 -130,700 C 70,880 230,920 270,930', color: PINK },
    { d: 'M 1320,-30 C 1840,100 1840,500 1640,700 C 1440,880 1280,920 1240,930', color: ORANGE },
    { d: 'M 1285,-30 C 1805,100 1805,500 1605,700 C 1405,880 1245,920 1205,930', color: YELLOW },
    { d: 'M 1250,-30 C 1770,100 1770,500 1570,700 C 1370,880 1210,920 1170,930', color: PINK },
  ],
};

const HIDDEN_VIEWS = new Set(['login', 'membership', 'about']);

// ─── Stroke style: thick rounded lines with black outline ─────────────────────
// To match flowfest's thick filled stripes with black outlines, we render each
// path TWICE: once with a slightly thicker black stroke (outline), once with
// the color stroke on top. This gives the black border effect without SVG filters.

const STROKE_W = 56;       // colored stroke width
const OUTLINE_W = 68;      // black outline stroke width (drawn behind)

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
      className="absolute inset-0 pointer-events-none overflow-hidden"
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
