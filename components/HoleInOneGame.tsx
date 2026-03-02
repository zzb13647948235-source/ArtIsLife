import React from 'react';
import HoleInOneApp from './holeinone/App';
import './holeinone/index.css';

interface HoleInOneGameProps {
  onBack: () => void;
}

const HoleInOneGame: React.FC<HoleInOneGameProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 z-[120] bg-[#0d1f0d] flex flex-col">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回
        </button>
      </div>

      {/* Game container */}
      <div className="flex-1 relative">
        <HoleInOneApp />
      </div>
    </div>
  );
};

export default HoleInOneGame;
