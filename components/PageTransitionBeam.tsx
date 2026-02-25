import React, { useEffect, useRef, useState } from 'react';
import { ViewState } from '../types';

interface PageTransitionBeamProps {
  currentView: ViewState;
  previousView: ViewState;
}

// Retro rainbow colors
const C = {
  pink:   '#f472b6',
  coral:  '#e8572a',
  orange: '#f5a623',
  gold:   '#f5c842',
};

// Per-page arc config: each page has 2 arc groups (left + right)
// Each arc group: corner position, rotation, size, color order
// Design logic:
//   intro    — both arcs hidden (dark 3D scene, no decoration)
//   home     — left content heavy → big BL arc; right carousel → TR arc
//   journal  — editorial, centered → symmetric arcs mid-size
//   styles   — alternating L/R layout → arcs swap sides
//   gallery  — left sidebar → small TL arc; right canvas → big BR arc
//   chat     — left sidebar → TL arc; right chat → BR arc
//   game     — full-screen immersive → arcs at top corners, small
//   map      — left sidebar → BL arc; right map → TR arc
//   market   — left filter → TL arc; right grid → BR arc
//   community— masonry grid → both bottom corners

interface ArcConfig {
  corner: 'BL' | 'BR' | 'TL' | 'TR'; // which corner
  size: number;                         // SVG canvas size
  colors: string[];                     // stripe colors outside→in
  opacity: number;
}

const PAGE_ARCS: Record<ViewState, [ArcConfig, ArcConfig] | null> = {
  intro: null,
  home: [
    { corner: 'BL', size: 420, colors: [C.pink, C.coral, C.orange, C.gold, C.orange], opacity: 1 },
    { corner: 'TR', size: 340, colors: [C.gold, C.orange, C.coral, C.pink, C.coral], opacity: 0.85 },
  ],
  journal: [
    { corner: 'TL', size: 360, colors: [C.coral, C.pink, C.gold, C.orange, C.pink], opacity: 0.9 },
    { corner: 'BR', size: 360, colors: [C.orange, C.gold, C.pink, C.coral, C.gold], opacity: 0.9 },
  ],
  styles: [
    { corner: 'TR', size: 400, colors: [C.pink, C.gold, C.coral, C.orange, C.gold], opacity: 1 },
    { corner: 'BL', size: 300, colors: [C.orange, C.coral, C.pink, C.gold, C.coral], opacity: 0.8 },
  ],
  gallery: [
    { corner: 'TL', size: 300, colors: [C.gold, C.orange, C.coral, C.pink, C.orange], opacity: 0.8 },
    { corner: 'BR', size: 440, colors: [C.coral, C.pink, C.gold, C.orange, C.pink], opacity: 1 },
  ],
  chat: [
    { corner: 'TL', size: 320, colors: [C.pink, C.coral, C.orange, C.gold, C.coral], opacity: 0.85 },
    { corner: 'BR', size: 380, colors: [C.orange, C.gold, C.pink, C.coral, C.gold], opacity: 0.9 },
  ],
  game: [
    { corner: 'TL', size: 280, colors: [C.coral, C.orange, C.gold, C.pink, C.orange], opacity: 0.7 },
    { corner: 'TR', size: 280, colors: [C.gold, C.pink, C.coral, C.orange, C.pink], opacity: 0.7 },
  ],
  map: [
    { corner: 'BL', size: 380, colors: [C.orange, C.coral, C.pink, C.gold, C.coral], opacity: 0.9 },
    { corner: 'TR', size: 320, colors: [C.pink, C.gold, C.orange, C.coral, C.gold], opacity: 0.85 },
  ],
  market: [
    { corner: 'TL', size: 340, colors: [C.gold, C.coral, C.pink, C.orange, C.coral], opacity: 0.85 },
    { corner: 'BR', size: 400, colors: [C.coral, C.orange, C.gold, C.pink, C.orange], opacity: 1 },
  ],
  community: [
    { corner: 'BL', size: 360, colors: [C.pink, C.orange, C.coral, C.gold, C.orange], opacity: 0.9 },
    { corner: 'BR', size: 360, colors: [C.gold, C.pink, C.orange, C.coral, C.pink], opacity: 0.9 },
  ],
  // overlay pages — no arcs
  login:      null,
  membership: null,
  about:      null,
};

// Build SVG arc path: quarter-circle stripe, center at bottom-left (0, S)
function arcPath(outer: number, inner: number, S: number): string {
  if (inner <= 0) {
    return `M ${outer},${S} A ${outer},${outer} 0 0,0 0,${S - outer} L 0,${S} Z`;
  }
  return [
    `M ${outer},${S}`,
    `A ${outer},${outer} 0 0,0 0,${S - outer}`,
    `L 0,${S - inner}`,
    `A ${inner},${inner} 0 0,1 ${inner},${S}`,
    `Z`,
  ].join(' ');
}

// Rotation per corner (BL=0°, BR=90°, TR=180°, TL=270°)
const CORNER_ROT: Record<string, number> = { BL: 0, BR: 90, TR: 180, TL: 270 };
// CSS position per corner
const CORNER_POS: Record<string, React.CSSProperties> = {
  BL: { bottom: 0, left: 0 },
  BR: { bottom: 0, right: 0 },
  TR: { top: 0, right: 0 },
  TL: { top: 0, left: 0 },
};
// Off-screen translate per corner
const CORNER_HIDE: Record<string, string> = {
  BL: 'translate(-115%, 115%)',
  BR: 'translate(115%, 115%)',
  TR: 'translate(115%, -115%)',
  TL: 'translate(-115%, -115%)',
};

const ArcSVG: React.FC<{ cfg: ArcConfig; show: boolean; transition: string }> = ({ cfg, show, transition }) => {
  const { corner, size: S, colors, opacity } = cfg;
  const stripeW = Math.floor(S * 0.8 / colors.length);
  const radii = colors.map((_, i) => Math.round(S * 0.8 - i * stripeW));
  const rot = CORNER_ROT[corner];

  return (
    <div style={{
      position: 'absolute',
      ...CORNER_POS[corner],
      transform: show ? 'translate(0,0)' : CORNER_HIDE[corner],
      transition,
      opacity,
    }}>
      <svg
        width={S} height={S}
        viewBox={`0 0 ${S} ${S}`}
        style={{ transform: `rotate(${rot}deg)`, display: 'block' }}
        overflow="visible"
      >
        {colors.map((color, i) => {
          const outer = radii[i];
          const inner = i + 1 < radii.length ? radii[i + 1] : 0;
          return (
            <path
              key={i}
              d={arcPath(outer, inner, S)}
              fill={color}
              stroke="#111"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
    </div>
  );
};

const PageTransitionBeam: React.FC<PageTransitionBeamProps> = ({ currentView, previousView }) => {
  const [displayView, setDisplayView] = useState<ViewState>(currentView);
  const [show, setShow] = useState(false);
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentView === previousView) return;
    if (t1.current) clearTimeout(t1.current);
    if (t2.current) clearTimeout(t2.current);

    // Phase 1: hide old arcs
    setShow(false);

    // Phase 2: swap to new page arcs and show them
    t1.current = setTimeout(() => {
      setDisplayView(currentView);
      setShow(true);
    }, 200);

    // Phase 3: hide new arcs (they stay visible, just settle)
    // Arcs remain visible — they are persistent decorations
    return () => {
      if (t1.current) clearTimeout(t1.current);
      if (t2.current) clearTimeout(t2.current);
    };
  }, [currentView, previousView]);

  // On first mount, show arcs for current view
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayView(currentView);
      setShow(true);
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const arcs = PAGE_ARCS[displayView];
  if (!arcs) return null;

  const tr = 'transform 480ms cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 55 }}
      aria-hidden="true"
    >
      {arcs.map((cfg, i) => (
        <ArcSVG key={`${displayView}-${i}`} cfg={cfg} show={show} transition={tr} />
      ))}
    </div>
  );
};

export default PageTransitionBeam;
