
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ViewState } from '../types';

interface LiquidBackgroundProps {
  currentView: ViewState;
}

// --- COLOR MATH HELPERS ---
const hexToRgba = (hex: string, alpha: number = 1): number[] => {
    let c: any;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return [(c>>16)&255, (c>>8)&255, c&255, alpha];
    }
    return [0,0,0,1];
}

const parseRgba = (rgba: string): number[] => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseFloat(match[4] || '1')];
    }
    return [0, 0, 0, 1];
}

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

// --- CONFIGURATION ---

interface WaveConfig {
    baseFreq: number;      
    detailFreq: number;    
    distortionStrength: number; 
    ribbonWidth: number;   
    speed: number;         
    spawnInterval: number; 
    flowSpeed: number;     
    sharpness: number;     
    opacityFactor: number;
}

interface Ripple {
    id: number;
    x: number;
    y: number;
    radius: number;
    strength: number;
    maxRadius: number;
    angleOffset: number;
    config: WaveConfig;
}

const THEMES: Record<string, { palette: string[], base: string, dotColor: string }> = {
  home: {
    // Richer Terracotta & Gold
    palette: ['#C05621', '#D6A868', '#F4F2ED', '#8B4513'], 
    base: '#F9F8F6', // Slightly brighter base to contrast the blobs
    dotColor: 'rgba(45, 42, 38, 0.35)' // Increased from 0.15
  },
  journal: {
    // Monochromatic / Ink / Paper - Sophisticated
    palette: ['#E0E0E0', '#B0B0B0', '#FFFFFF', '#606060'],
    base: '#F5F5F5',
    dotColor: 'rgba(20, 20, 20, 0.4)'
  },
  styles: {
    // Deep Ocean & Oil
    palette: ['#3B5975', '#588FA6', '#E8DCC4', '#2C3E50'], 
    base: '#F4F2ED',
    dotColor: 'rgba(59, 89, 117, 0.3)'
  },
  gallery: {
    // Charcoal & Burnt Orange Accent
    palette: ['#2D2A26', '#C05621', '#9CA3AF', '#5D4037'], 
    base: '#F4F2ED',
    dotColor: 'rgba(45, 42, 38, 0.3)'
  },
  market: {
    // Luxury Velvet Red & Gold - Dark Mode
    palette: ['#4A0404', '#800020', '#1A1A1A', '#D4AF37'],
    base: '#0F0505',
    dotColor: 'rgba(212, 175, 55, 0.3)'
  },
  chat: {
    // Organic Green & Sage
    palette: ['#6B8E23', '#556B2F', '#E6E3D8', '#95C5C6'], 
    base: '#F4F2ED',
    dotColor: 'rgba(85, 107, 47, 0.3)'
  },
  game: {
    // Vibrant Playful
    palette: ['#D65D39', '#E8B936', '#3E4F63', '#C0392B'], 
    base: '#F4F2ED',
    dotColor: 'rgba(62, 79, 99, 0.35)'
  },
  membership: {
    // Luxury Gold & Black
    palette: ['#d4af37', '#8a6e3e', '#1a1a1a', '#000000'], 
    base: '#0a0a0a',
    dotColor: 'rgba(212, 175, 55, 0.4)' 
  },
  map: {
      // Tech Blue & Grey
      palette: ['#60A5FA', '#3B82F6', '#9CA3AF', '#1F2937'],
      base: '#F4F2ED',
      dotColor: 'rgba(50, 50, 50, 0.3)'
  },
  about: {
      palette: ['#C05621', '#A0522D', '#E8DCC4', '#2D2A26'],
      base: '#F4F2ED',
      dotColor: 'rgba(192, 86, 33, 0.3)'
  },
  login: {
      palette: ['#C05621', '#000000', '#333333', '#552200'],
      base: '#000000',
      dotColor: 'rgba(255, 255, 255, 0.2)' 
  },
  default: {
    palette: ['#C05621', '#E8DCC4', '#F4F2ED', '#9CA3AF'],
    base: '#F4F2ED',
    dotColor: 'rgba(0, 0, 0, 0.2)'
  },
};

const WAVE_PRESETS: Record<string, WaveConfig> = {
    home: { 
        baseFreq: 3, detailFreq: 2, distortionStrength: 40, ribbonWidth: 280, 
        speed: 0.8, spawnInterval: 5000, flowSpeed: 0.001, sharpness: 0.7, opacityFactor: 1.2 
    },
    journal: {
        baseFreq: 1, detailFreq: 10, distortionStrength: 20, ribbonWidth: 300,
        speed: 0.5, spawnInterval: 6000, flowSpeed: 0.0005, sharpness: 0.5, opacityFactor: 0.8
    },
    styles: { 
        baseFreq: 4, detailFreq: 3, distortionStrength: 60, ribbonWidth: 220, 
        speed: 0.7, spawnInterval: 4500, flowSpeed: 0.0008, sharpness: 0.6, opacityFactor: 1.3
    },
    gallery: { 
        baseFreq: 2, detailFreq: 5, distortionStrength: 90, ribbonWidth: 240, 
        speed: 1.2, spawnInterval: 4000, flowSpeed: 0.003, sharpness: 0.9, opacityFactor: 1.1 
    },
    market: {
        baseFreq: 5, detailFreq: 2, distortionStrength: 80, ribbonWidth: 200,
        speed: 0.9, spawnInterval: 4000, flowSpeed: 0.002, sharpness: 1.2, opacityFactor: 1.5
    },
    chat: { 
        baseFreq: 6, detailFreq: 3, distortionStrength: 25, ribbonWidth: 180, 
        speed: 1.0, spawnInterval: 3500, flowSpeed: 0.002, sharpness: 0.8, opacityFactor: 1.0
    },
    game: { 
        baseFreq: 5, detailFreq: 8, distortionStrength: 45, ribbonWidth: 160, 
        speed: 1.8, spawnInterval: 3000, flowSpeed: 0.005, sharpness: 1.8, opacityFactor: 1.4
    },
    map: { 
        baseFreq: 20, detailFreq: 1, distortionStrength: 5, ribbonWidth: 130, 
        speed: 1.4, spawnInterval: 5000, flowSpeed: 0.0001, sharpness: 1.1, opacityFactor: 1.1
    },
    membership: { 
        baseFreq: 3, detailFreq: 2, distortionStrength: 50, ribbonWidth: 350, 
        speed: 0.6, spawnInterval: 6000, flowSpeed: 0.001, sharpness: 0.6, opacityFactor: 1.6
    },
    default: { 
        baseFreq: 3, detailFreq: 2, distortionStrength: 50, ribbonWidth: 220, 
        speed: 1.0, spawnInterval: 4500, flowSpeed: 0.002, sharpness: 1.0, opacityFactor: 1.0 
    }
};

const LiquidBackground: React.FC<LiquidBackgroundProps> = ({ currentView }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const rippleIdCounter = useRef(0);
  const currentViewRef = useRef(currentView);
  
  // State for color interpolation
  const currentColorState = useRef<{ dot: number[], base: number[] }>({
      dot: [0,0,0,0],
      base: [244, 242, 237, 1]
  });

  const targetColorState = useRef<{ dot: number[], base: number[] }>({
      dot: [0,0,0,0],
      base: [244, 242, 237, 1]
  });

  useEffect(() => {
    currentViewRef.current = currentView;
    const theme = THEMES[currentView] || THEMES['default'];
    
    targetColorState.current = {
        dot: parseRgba(theme.dotColor),
        base: hexToRgba(theme.base)
    };
  }, [currentView]);

  useEffect(() => {
      let timeoutId: ReturnType<typeof setTimeout>;
      const spawnRipple = () => {
          const view = currentViewRef.current;
          const presetKey = (view in WAVE_PRESETS) ? view : 'default';
          const config = WAVE_PRESETS[presetKey];
          const maxDim = Math.max(window.innerWidth, window.innerHeight);
          
          ripplesRef.current.push({
              id: rippleIdCounter.current++,
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
              radius: 0,
              strength: 1.0,
              maxRadius: maxDim * 1.5,
              angleOffset: Math.random() * Math.PI * 2,
              config: config
          });
          
          if (ripplesRef.current.length > 3) ripplesRef.current.shift();
          timeoutId = setTimeout(spawnRipple, config.spawnInterval);
      };
      spawnRipple(); 
      return () => clearTimeout(timeoutId);
  }, []);

  // RENDER LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const handleResize = () => {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const render = () => {
        const lerpSpeed = 0.05; 
        
        ['dot', 'base'].forEach((key) => {
            const k = key as keyof typeof currentColorState.current;
            const current = currentColorState.current[k];
            const target = targetColorState.current[k];
            
            for(let i=0; i<4; i++) {
                current[i] = lerp(current[i], target[i], lerpSpeed);
            }
        });

        const dotRGB = currentColorState.current.dot;
        const dotBaseColor = `rgb(${Math.round(dotRGB[0])}, ${Math.round(dotRGB[1])}, ${Math.round(dotRGB[2])})`;
        const dotBaseAlpha = dotRGB[3];

        const width = window.innerWidth;
        const height = window.innerHeight;
        ctx.clearRect(0, 0, width, height);
        
        ripplesRef.current.forEach(r => {
            r.radius += r.config.speed;
            r.strength *= 0.998; 
        });
        ripplesRef.current = ripplesRef.current.filter(r => r.strength > 0.01 && r.radius < r.maxRadius);

        const isMobile = width < 768;
        const gap = isMobile ? 18 : 12; 
        const rows = Math.ceil(height / gap);
        const cols = Math.ceil(width / gap);
        
        ctx.fillStyle = dotBaseColor;

        for (let ix = 0; ix < cols; ix++) {
            for (let iy = 0; iy < rows; iy++) {
                const xOrigin = ix * gap;
                const yOrigin = iy * gap;

                const nx = ix / 60; 
                const ny = iy / 60;
                const noise = Math.sin(nx + time * 0.0005) * Math.cos(ny + time * 0.001);
                
                // Increased base visibility for clearer texture
                const ambientVisibility = dotBaseAlpha * (0.3 + (noise * 0.15));

                let rippleBoost = 0;
                
                for (const r of ripplesRef.current) {
                    const dx = xOrigin - r.x;
                    const dy = yOrigin - r.y;
                    if (Math.abs(dx) > r.radius + 300 || Math.abs(dy) > r.radius + 300) continue;

                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    
                    const flow = time * r.config.flowSpeed;
                    const shape = Math.sin(angle * r.config.baseFreq + r.angleOffset + flow);
                    const detail = Math.cos(angle * r.config.detailFreq - flow * 1.5);
                    const distortion = (shape * r.config.distortionStrength) + (detail * (r.config.distortionStrength * 0.3));

                    const targetRadius = r.radius + distortion;
                    const distFromWave = Math.abs(dist - targetRadius);
                    const ribbonW = r.config.ribbonWidth;
                    
                    if (distFromWave < ribbonW) {
                        const sigma = (ribbonW * 0.3) / r.config.sharpness; 
                        const intensity = Math.exp( - (distFromWave * distFromWave) / (2 * sigma * sigma) );
                        rippleBoost += intensity * r.strength * 3.5 * r.config.opacityFactor;
                    }
                }

                let totalVisibility = ambientVisibility + (rippleBoost * dotBaseAlpha);
                if (totalVisibility > 1) totalVisibility = 1;

                // Threshold lowered slightly to allow more faint dots (dust effect)
                if (totalVisibility > 0.03) {
                    // Radius logic tweaked for crisper dots
                    const radius = (0.7 * ambientVisibility) + (2.5 * Math.min(1, rippleBoost));
                    if (radius > 0.2) {
                        ctx.globalAlpha = totalVisibility; 
                        ctx.beginPath();
                        ctx.arc(xOrigin, yOrigin, radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
        
        ctx.globalAlpha = 1.0;
        time += 16;
        animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const activeTheme = THEMES[currentView] || THEMES['default'];

  return (
    <div 
        className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 transition-colors duration-[1500ms] ease-in-out"
        style={{ backgroundColor: activeTheme.base }}
    >
      {/* 1. Underlying Liquid Blobs - INCREASED OPACITY & RICHER COLORS */}
      <div className="absolute inset-0 w-full h-full liquid-bg opacity-100 z-0">
        <div 
            className="absolute top-[-20%] right-[-10%] w-[100vw] h-[100vw] rounded-full mix-blend-multiply filter blur-[100px] animate-blob transition-colors duration-[3000ms]"
            style={{ backgroundColor: activeTheme.palette[1], opacity: 0.5, animationDuration: '60s' }} 
        ></div>
        <div 
            className="absolute bottom-[-30%] left-[-10%] w-[90vw] h-[90vw] rounded-full mix-blend-multiply filter blur-[80px] animate-blob transition-colors duration-[3000ms]"
            style={{ backgroundColor: activeTheme.palette[0], opacity: 0.45, animationDelay: '-15s', animationDuration: '50s' }}
        ></div>
        {/* Added a third accent blob for more color complexity */}
        <div 
            className="absolute top-[40%] left-[40%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[90px] animate-blob transition-colors duration-[3000ms]"
            style={{ backgroundColor: activeTheme.palette[3] || activeTheme.palette[2], opacity: 0.35, animationDelay: '-8s', animationDuration: '45s' }}
        ></div>
      </div>

      {/* 2. Frosted Texture - REDUCED OPACITY to let colors shine through */}
      <div 
        className="absolute inset-0 backdrop-blur-[80px] z-10 transition-all duration-1000"
        style={{ 
            backgroundColor: activeTheme.base === '#111111' || activeTheme.base === '#000000' || activeTheme.base === '#0F0505'
                ? 'rgba(0,0,0,0.5)' 
                : 'rgba(255,255,255,0.02)' // Significantly reduced from 0.4 to 0.02
        }}
      ></div>

      {/* 3. Canvas for Grid */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full mix-blend-multiply z-20 pointer-events-none"
        style={{ opacity: 1 }} 
      />
    </div>
  );
};

export default LiquidBackground;
