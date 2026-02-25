import React, { useEffect, useRef, useState } from 'react';
import { ViewState } from '../types';

interface PageTransitionBeamProps {
  currentView: ViewState;
  previousView: ViewState;
}

// SVG canvas size
const S = 440;

// Retro rainbow stripes — outside to inside, matching flowfest palette
const STRIPES = [
  { outer: 420, inner: 336, color: '#f472b6' }, // pink
  { outer: 336, inner: 252, color: '#e8572a' }, // coral
  { outer: 252, inner: 168, color: '#f5a623' }, // orange
  { outer: 168, inner: 84,  color: '#f5c842' }, // gold
  { outer: 84,  inner: 0,   color: '#f5a623' }, // orange (solid innermost)
];

// Quarter-circle arc path, center at bottom-left corner (0, S)
function arcPath(outer: number, inner: number): string {
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

const ArcGroup: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <svg
    width={S}
    height={S}
    viewBox={`0 0 ${S} ${S}`}
    style={flip ? { transform: 'rotate(180deg)' } : undefined}
    overflow="visible"
  >
    {STRIPES.map((s, i) => (
      <path
        key={i}
        d={arcPath(s.outer, s.inner)}
        fill={s.color}
        stroke="#111111"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    ))}
  </svg>
);

const PageTransitionBeam: React.FC<PageTransitionBeamProps> = ({ currentView, previousView }) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentView === previousView) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), 550);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentView, previousView]);

  const tr = 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 200 }}
      aria-hidden="true"
    >
      {/* Bottom-left arc */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        transform: visible ? 'translate(0, 0)' : 'translate(-115%, 115%)',
        transition: tr,
      }}>
        <ArcGroup />
      </div>

      {/* Top-right arc (rotated 180°) */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        transform: visible ? 'translate(0, 0)' : 'translate(115%, -115%)',
        transition: tr,
      }}>
        <ArcGroup flip />
      </div>
    </div>
  );
};

export default PageTransitionBeam;
