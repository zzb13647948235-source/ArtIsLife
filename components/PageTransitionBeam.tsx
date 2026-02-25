import React, { useEffect, useRef, useState } from 'react';
import { ViewState } from '../types';

interface PageTransitionBeamProps {
  currentView: ViewState;
  previousView: ViewState;
}

// Color palette per transition — warm art-site tones with spectrum accent
const BEAM_CONFIGS: Record<string, { beams: string[]; angle: number }> = {
  'intro-home':      { beams: ['#bc4b1a', '#e8a045', '#f5d08a', '#e8a045', '#bc4b1a'], angle: -18 },
  'home-journal':    { beams: ['#7c5cbf', '#bc4b1a', '#e8a045', '#c084fc', '#7c5cbf'], angle: 15 },
  'journal-styles':  { beams: ['#e8a045', '#f472b6', '#bc4b1a', '#f5d08a', '#e8a045'], angle: -12 },
  'styles-gallery':  { beams: ['#34d399', '#e8a045', '#f472b6', '#34d399', '#bc4b1a'], angle: 20 },
  'gallery-chat':    { beams: ['#60a5fa', '#c084fc', '#e8a045', '#60a5fa', '#bc4b1a'], angle: -15 },
  'chat-game':       { beams: ['#f472b6', '#bc4b1a', '#e8a045', '#f472b6', '#7c5cbf'], angle: 12 },
  'game-map':        { beams: ['#34d399', '#60a5fa', '#e8a045', '#34d399', '#bc4b1a'], angle: -20 },
  'map-market':      { beams: ['#e8a045', '#bc4b1a', '#f5d08a', '#e8a045', '#7c5cbf'], angle: 16 },
  'market-community':{ beams: ['#f472b6', '#e8a045', '#c084fc', '#f472b6', '#bc4b1a'], angle: -14 },
};

function getKey(from: ViewState, to: ViewState) {
  return `${from}-${to}`;
}

const PageTransitionBeam: React.FC<PageTransitionBeamProps> = ({ currentView, previousView }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState(BEAM_CONFIGS['intro-home']);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentView === previousView) return;
    const key = getKey(previousView, currentView);
    const reverseKey = getKey(currentView, previousView);
    const cfg = BEAM_CONFIGS[key] || BEAM_CONFIGS[reverseKey];
    if (!cfg) return;

    setConfig(cfg);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 900);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentView, previousView]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 200 }}
      aria-hidden="true"
    >
      {config.beams.map((color, i) => {
        const width = 60 + i * 30;
        const left = -20 + i * 22;
        const delay = i * 60;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '-20%',
              left: `${left}%`,
              width: `${width}px`,
              height: '140%',
              background: `linear-gradient(180deg, transparent 0%, ${color}55 20%, ${color}99 50%, ${color}55 80%, transparent 100%)`,
              transform: `rotate(${config.angle}deg)`,
              filter: 'blur(18px)',
              mixBlendMode: 'screen',
              animation: `beamSweep 0.9s ease-out ${delay}ms both`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes beamSweep {
          0%   { opacity: 0; transform: rotate(${config.angle}deg) translateX(-60px); }
          30%  { opacity: 1; }
          70%  { opacity: 0.8; }
          100% { opacity: 0; transform: rotate(${config.angle}deg) translateX(60px); }
        }
      `}</style>
    </div>
  );
};

export default PageTransitionBeam;
