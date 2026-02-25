import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ViewState } from '../types';

interface PageTransitionBeamProps {
  currentView: ViewState;
  previousView: ViewState;
}

// Colors
const C1 = '#FF8BA7'; // pink
const C2 = '#FFC65C'; // yellow
const C3 = '#FF7F50'; // orange

// Per-page SVG path sets (viewBox 0 0 1440 900)
// Each page has 6 paths: left-3, left-2, left-1, right-3, right-2, right-1
// Paths are designed around each page's visual layout/flow
// "waterfall" continuity: end region of one page connects to start of next

const PAGE_PATHS: Record<string, string[]> = {
  // intro: hidden (dark 3D scene)
  intro: [],

  // home: left text heavy, right carousel → lines flow down-left, curve right
  home: [
    // left group — flows down from top-left, curves toward center-bottom
    'M 60,-50 L 60,280 Q 60,480 160,540 L 320,610',
    'M 95,-50 L 95,280 Q 95,450 195,510 L 355,580',
    'M 130,-50 L 130,280 Q 130,420 230,480 L 390,550',
    // right group — flows down from top-right, curves toward bottom-right
    'M 1380,-50 L 1380,550 Q 1380,760 1270,820 L 1080,900',
    'M 1345,-50 L 1345,550 Q 1345,730 1235,790 L 1045,870',
    'M 1310,-50 L 1310,550 Q 1310,700 1200,760 L 1010,840',
  ],

  // journal: editorial centered → lines hug both sides, curve inward at bottom
  journal: [
    'M 40,-50 L 40,200 Q 40,420 100,500 Q 160,580 80,700 L 40,900',
    'M 75,-50 L 75,200 Q 75,390 135,470 Q 195,550 115,670 L 75,870',
    'M 110,-50 L 110,200 Q 110,360 170,440 Q 230,520 150,640 L 110,840',
    'M 1400,-50 L 1400,200 Q 1400,420 1340,500 Q 1280,580 1360,700 L 1400,900',
    'M 1365,-50 L 1365,200 Q 1365,390 1305,470 Q 1245,550 1325,670 L 1365,870',
    'M 1330,-50 L 1330,200 Q 1330,360 1270,440 Q 1210,520 1290,640 L 1330,840',
  ],

  // styles: alternating L/R layout → lines cross and swap sides
  styles: [
    'M 1380,-50 L 1380,180 Q 1380,350 1100,420 Q 820,490 700,620 L 600,900',
    'M 1345,-50 L 1345,180 Q 1345,320 1065,390 Q 785,460 665,590 L 565,870',
    'M 1310,-50 L 1310,180 Q 1310,290 1030,360 Q 750,430 630,560 L 530,840',
    'M 60,-50 L 60,180 Q 60,350 340,420 Q 620,490 740,620 L 840,900',
    'M 95,-50 L 95,180 Q 95,320 375,390 Q 655,460 775,590 L 875,870',
    'M 130,-50 L 130,180 Q 130,290 410,360 Q 690,430 810,560 L 910,840',
  ],

  // gallery: left sidebar + right canvas → left lines short, right lines tall
  gallery: [
    'M 50,-50 L 50,150 Q 50,280 120,320 L 280,360',
    'M 80,-50 L 80,150 Q 80,255 150,295 L 310,335',
    'M 110,-50 L 110,150 Q 110,230 180,270 L 340,310',
    'M 1390,-50 L 1390,650 Q 1390,820 1260,870 L 1050,900',
    'M 1355,-50 L 1355,650 Q 1355,790 1225,840 L 1015,870',
    'M 1320,-50 L 1320,650 Q 1320,760 1190,810 L 980,840',
  ],

  // chat: left sidebar + right chat → left lines mid, right lines full height
  chat: [
    'M 55,-50 L 55,200 Q 55,360 140,400 L 300,430',
    'M 88,-50 L 88,200 Q 88,330 173,370 L 333,400',
    'M 121,-50 L 121,200 Q 121,300 206,340 L 366,370',
    'M 1385,-50 L 1385,700 Q 1385,860 1240,900',
    'M 1350,-50 L 1350,700 Q 1350,830 1205,870',
    'M 1315,-50 L 1315,700 Q 1315,800 1170,840',
  ],

  // game: full-screen immersive → lines arc dramatically across top
  game: [
    'M -50,80 Q 200,60 400,120 Q 600,180 720,160',
    'M -50,115 Q 200,95 400,155 Q 600,215 720,195',
    'M -50,150 Q 200,130 400,190 Q 600,250 720,230',
    'M 1490,80 Q 1240,60 1040,120 Q 840,180 720,160',
    'M 1490,115 Q 1240,95 1040,155 Q 840,215 720,195',
    'M 1490,150 Q 1240,130 1040,190 Q 840,250 720,230',
  ],

  // map: left sidebar + right map → lines flow down both sides
  map: [
    'M 45,-50 L 45,350 Q 45,560 130,620 L 280,680',
    'M 78,-50 L 78,350 Q 78,530 163,590 L 313,650',
    'M 111,-50 L 111,350 Q 111,500 196,560 L 346,620',
    'M 1395,-50 L 1395,400 Q 1395,600 1300,660 L 1120,720',
    'M 1360,-50 L 1360,400 Q 1360,570 1265,630 L 1085,690',
    'M 1325,-50 L 1325,400 Q 1325,540 1230,600 L 1050,660',
  ],

  // market: left filter + right grid → lines hug left edge, right sweeps wide
  market: [
    'M 35,-50 L 35,500 Q 35,700 100,750 L 220,800',
    'M 65,-50 L 65,500 Q 65,670 130,720 L 250,770',
    'M 95,-50 L 95,500 Q 95,640 160,690 L 280,740',
    'M 1400,-50 L 1400,300 Q 1400,500 1200,580 Q 1000,660 900,800 L 860,900',
    'M 1365,-50 L 1365,300 Q 1365,470 1165,550 Q 965,630 865,770 L 825,870',
    'M 1330,-50 L 1330,300 Q 1330,440 1130,520 Q 930,600 830,740 L 790,840',
  ],

  // community: masonry grid → lines flow down both sides symmetrically
  community: [
    'M 50,-50 L 50,400 Q 50,620 160,700 Q 270,780 200,900',
    'M 83,-50 L 83,400 Q 83,590 193,670 Q 303,750 233,870',
    'M 116,-50 L 116,400 Q 116,560 226,640 Q 336,720 266,840',
    'M 1390,-50 L 1390,400 Q 1390,620 1280,700 Q 1170,780 1240,900',
    'M 1357,-50 L 1357,400 Q 1357,590 1247,670 Q 1137,750 1207,870',
    'M 1324,-50 L 1324,400 Q 1324,560 1214,640 Q 1104,720 1174,840',
  ],
};

const PATH_COLORS = [C3, C2, C1, C3, C2, C1];

const PageTransitionBeam: React.FC<PageTransitionBeamProps> = ({ currentView, previousView }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const lengthsRef = useRef<number[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const [displayView, setDisplayView] = useState<ViewState>(currentView);
  const [transitioning, setTransitioning] = useState(false);
  const scrollRef = useRef(0);

  const paths = PAGE_PATHS[displayView] ?? [];

  // Compute path lengths after render
  useEffect(() => {
    lengthsRef.current = pathRefs.current.map(p => p?.getTotalLength() ?? 0);
    // Initialize: hide all lines
    pathRefs.current.forEach((p, i) => {
      if (!p) return;
      const len = lengthsRef.current[i];
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });
  }, [displayView]);

  // Draw lines based on scroll progress
  const drawLines = useCallback((progress: number) => {
    pathRefs.current.forEach((p, i) => {
      if (!p) return;
      const len = lengthsRef.current[i];
      if (!len) return;
      // Stagger: each line starts drawing slightly after the previous
      const stagger = i * 0.06;
      const localProgress = Math.min(Math.max((progress - stagger) / (1 - stagger * 5), 0), 1);
      const offset = len - len * localProgress * 1.15;
      p.style.strokeDashoffset = `${Math.max(offset, 0)}`;
    });
  }, []);

  // Listen to scroll on the active page's scroll-container
  useEffect(() => {
    const getContainer = () =>
      document.getElementById(`page-${displayView}`)?.querySelector('.scroll-container') as HTMLElement | null;

    let container: HTMLElement | null = null;

    const onScroll = () => {
      if (!container) return;
      const max = container.scrollHeight - container.clientHeight;
      if (max <= 0) return;
      const p = Math.min(1, Math.max(0, container.scrollTop / max));
      scrollRef.current = p;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => drawLines(p));
    };

    // Small delay to let DOM settle after view change
    const timer = setTimeout(() => {
      container = getContainer();
      if (container) {
        container.addEventListener('scroll', onScroll, { passive: true });
        // Draw at current scroll position
        onScroll();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (container) container.removeEventListener('scroll', onScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [displayView, drawLines]);

  // Page transition: fade out old lines, swap, fade in new
  useEffect(() => {
    if (currentView === previousView) return;
    setTransitioning(true);
    const timer = setTimeout(() => {
      setDisplayView(currentView);
      scrollRef.current = 0;
      setTransitioning(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [currentView, previousView]);

  if (paths.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 55,
        opacity: transitioning ? 0 : 1,
        transition: 'opacity 350ms ease',
      }}
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {paths.map((d, i) => (
          <path
            key={`${displayView}-${i}`}
            ref={el => { pathRefs.current[i] = el; }}
            d={d}
            fill="none"
            stroke={PATH_COLORS[i]}
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
};

export default PageTransitionBeam;
