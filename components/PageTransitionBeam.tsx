import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ViewState } from '../types';

interface PageTransitionBeamProps {
  currentView: ViewState;
  previousView: ViewState;
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const PINK   = '#FF8BA7';
const YELLOW = '#FFC65C';
const ORANGE = '#FF7F50';
const OUTLINE = '#111111';

// ─── Arc stripe geometry ──────────────────────────────────────────────────────
// Each arc group is a set of concentric quarter-circle stripes at a corner.
// The stripes are FILLED shapes (not strokes), with a black outline between them.
// This exactly matches the flowfest style.
//
// Corner positions:
//   BL = bottom-left  (center at 0, H)
//   BR = bottom-right (center at W, H)
//   TR = top-right    (center at W, 0)
//   TL = top-left     (center at 0, 0)
//
// For BL corner (center cx=0, cy=H):
//   Arc from (r, H) counterclockwise to (0, H-r)
//   Path: M r,H  A r,r 0 0,0 0,H-r  L 0,H-ri  A ri,ri 0 0,1 ri,H  Z
//
// For other corners, we rotate the SVG element.

const STRIPE_W = 72;   // width of each stripe in px
const STRIPES = [
  { color: PINK,   offset: 0 },
  { color: ORANGE, offset: 1 },
  { color: YELLOW, offset: 2 },
  { color: ORANGE, offset: 3 },
  { color: PINK,   offset: 4 },
];
const ARC_SIZE = STRIPE_W * STRIPES.length + 20; // total SVG canvas size

function makeArcPath(outerR: number, innerR: number, S: number): string {
  // Quarter circle centered at bottom-left (0, S)
  if (innerR <= 0) {
    return `M ${outerR},${S} A ${outerR},${outerR} 0 0,0 0,${S - outerR} L 0,${S} Z`;
  }
  return [
    `M ${outerR},${S}`,
    `A ${outerR},${outerR} 0 0,0 0,${S - outerR}`,
    `L 0,${S - innerR}`,
    `A ${innerR},${innerR} 0 0,1 ${innerR},${S}`,
    `Z`,
  ].join(' ');
}

// Rotation per corner so the arc always points inward
const CORNER_ROT: Record<string, number> = { BL: 0, BR: 90, TR: 180, TL: 270 };
const CORNER_POS: Record<string, React.CSSProperties> = {
  BL: { bottom: 0, left: 0 },
  BR: { bottom: 0, right: 0 },
  TR: { top: 0, right: 0 },
  TL: { top: 0, left: 0 },
};

// ─── Per-page arc config ──────────────────────────────────────────────────────
// Each page has 2-4 arc groups. Position and size vary per page layout.
// Sizes are multiples of STRIPE_W to keep stripe widths consistent.

interface ArcGroupConfig {
  corner: 'BL' | 'BR' | 'TR' | 'TL';
  stripeCount: number; // how many stripes (controls size)
}

const PAGE_ARCS: Record<string, ArcGroupConfig[]> = {
  intro: [],
  home:      [{ corner: 'BL', stripeCount: 5 }, { corner: 'TR', stripeCount: 4 }],
  journal:   [{ corner: 'TL', stripeCount: 4 }, { corner: 'BR', stripeCount: 4 }],
  styles:    [{ corner: 'TR', stripeCount: 5 }, { corner: 'BL', stripeCount: 3 }],
  gallery:   [{ corner: 'TL', stripeCount: 3 }, { corner: 'BR', stripeCount: 5 }],
  chat:      [{ corner: 'TL', stripeCount: 4 }, { corner: 'BR', stripeCount: 4 }],
  game:      [{ corner: 'TL', stripeCount: 3 }, { corner: 'TR', stripeCount: 3 }],
  map:       [{ corner: 'BL', stripeCount: 4 }, { corner: 'TR', stripeCount: 4 }],
  market:    [{ corner: 'TL', stripeCount: 3 }, { corner: 'BR', stripeCount: 5 }],
  community: [{ corner: 'BL', stripeCount: 4 }, { corner: 'BR', stripeCount: 4 }],
  login:      [],
  membership: [],
  about:      [],
};

// ─── Single arc group SVG ─────────────────────────────────────────────────────
const ArcGroupSVG: React.FC<{ cfg: ArcGroupConfig; show: boolean }> = ({ cfg, show }) => {
  const { corner, stripeCount } = cfg;
  const S = STRIPE_W * stripeCount + 16;
  const rot = CORNER_ROT[corner];
  const pos = CORNER_POS[corner];

  // Off-screen translate per corner
  const hideTransform: Record<string, string> = {
    BL: 'translate(-110%, 110%)',
    BR: 'translate(110%, 110%)',
    TR: 'translate(110%, -110%)',
    TL: 'translate(-110%, -110%)',
  };

  return (
    <div style={{
      position: 'absolute',
      ...pos,
      transform: show ? 'translate(0,0)' : hideTransform[corner],
      transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
      lineHeight: 0,
    }}>
      <svg
        width={S} height={S}
        viewBox={`0 0 ${S} ${S}`}
        style={{ transform: `rotate(${rot}deg)`, display: 'block' }}
        overflow="visible"
      >
        {/* Draw stripes outside-in */}
        {Array.from({ length: stripeCount }).map((_, i) => {
          const outerR = S - 8 - i * STRIPE_W;
          const innerR = outerR - STRIPE_W + 4; // 4px gap = black outline
          const color = STRIPES[i % STRIPES.length].color;
          if (outerR <= 0) return null;
          return (
            <path
              key={i}
              d={makeArcPath(outerR, Math.max(innerR, 0), S)}
              fill={color}
              stroke={OUTLINE}
              strokeWidth="4"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const PageTransitionBeam: React.FC<PageTransitionBeamProps> = ({ currentView, previousView }) => {
  const [displayView, setDisplayView] = useState<ViewState>(currentView);
  const [show, setShow] = useState(false);

  // Page transition: hide → swap → show
  useEffect(() => {
    if (currentView === previousView) return;
    setShow(false);
    const t = setTimeout(() => { setDisplayView(currentView); setShow(true); }, 320);
    return () => clearTimeout(t);
  }, [currentView, previousView]);

  // Initial show after preloader
  useEffect(() => {
    const t = setTimeout(() => { setDisplayView(currentView); setShow(true); }, 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const arcs = PAGE_ARCS[displayView] ?? [];
  if (arcs.length === 0) return null;

  return (
    // z-index: 5 — below page content (z-index 40/60/70) but above raw background
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    >
      {arcs.map((cfg, i) => (
        <ArcGroupSVG key={`${displayView}-${cfg.corner}-${i}`} cfg={cfg} show={show} />
      ))}
    </div>
  );
};

export default PageTransitionBeam;
