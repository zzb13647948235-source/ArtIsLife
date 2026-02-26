
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GAME_LEVELS } from '../constants';
import { GameLevel, User, ViewState } from '../types';
import { Palette, Play, ArrowRight, X, Star, ChevronLeft, Trophy, Eye, EyeOff, Grid3X3, Lock, CheckCircle, Lightbulb, BrainCircuit, Sparkles, Crown, MousePointer2, Timer, Check, AlertCircle, Brush, HelpCircle, Shuffle, Coins, Calendar, Medal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../services/authService';
import AppleText from './AppleText';

interface ArtGameProps {
  onImmersiveChange?: (isImmersive: boolean) => void;
  user: User | null;
  onAuthRequired: () => void;
  onNavigate: (view: ViewState) => void;
}

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="relative group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900"></div>
    </div>
  </div>
);

const ConfettiCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles: any[] = [];
        const colors = ['#BC4B1A', '#D6A868', '#FFFFFF', '#FFD700', '#4CAF50'];
        
        const createParticles = () => {
            for (let i = 0; i < 150; i++) {
                particles.push({
                    x: width / 2, y: height / 2,
                    vx: (Math.random() - 0.5) * 25, vy: (Math.random() - 0.5) * 25 - 15,
                    size: Math.random() * 8 + 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    gravity: 0.25, drag: 0.96,
                    rotation: Math.random() * 360, rotationSpeed: (Math.random() - 0.5) * 15
                });
            }
        };

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            particles = particles.filter(p => p.size > 0.1 && p.y < height + 100);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.vx *= p.drag; p.vy *= p.drag; p.rotation += p.rotationSpeed;
                ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); ctx.restore();
            });
            if (particles.length > 0) animationId = requestAnimationFrame(animate);
        };
        
        createParticles();
        animate();
        return () => cancelAnimationFrame(animationId);
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[150]" />;
};

const ArtGame: React.FC<ArtGameProps> = ({ onImmersiveChange, user, onAuthRequired, onNavigate }) => {
  const [gameMode, setGameMode] = useState<'restoration' | 'puzzle' | 'quiz' | 'daily' | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'mode-select' | 'level-select' | 'intro' | 'playing' | 'won' | 'level-complete'>('mode-select');

  const [earnedCoins, setEarnedCoins] = useState(0);
  const { t } = useLanguage();

  const userTier = user?.tier || 'guest';

  useEffect(() => {
    const handler = (e: Event) => {
      const { type, id } = (e as CustomEvent).detail;
      if (type !== 'game') return;
      setGameMode('restoration');
      setGameState('level-select');
      setTimeout(() => {
        const el = document.getElementById(`level-${id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    };
    window.addEventListener('search-target', handler);
    return () => window.removeEventListener('search-target', handler);
  }, []);

  // Daily challenge: pick level based on today's date
  const dailyLevelId = useMemo(() => {
    const d = new Date(); const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    return (seed % GAME_LEVELS.length) + 1;
  }, []);
  const dailyLevel = GAME_LEVELS.find(l => l.id === dailyLevelId) || GAME_LEVELS[0];

  // Restoration State
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [restoredRegions, setRestoredRegions] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [showReference, setShowReference] = useState(false);
  const [hoverRegionId, setHoverRegionId] = useState<number | null>(null);
  const [hintActiveRegionId, setHintActiveRegionId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [isShaking, setIsShaking] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Quiz State
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizTimer, setQuizTimer] = useState(100);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [showFact, setShowFact] = useState(false);

  // Puzzle State
  const [puzzleGrid, setPuzzleGrid] = useState<number[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [puzzleMoves, setPuzzleMoves] = useState(0);
  const [isPeeking, setIsPeeking] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  // --- ACCESS CONTROL LOGIC ---
  const isContentLocked = (level: GameLevel) => {
      if (userTier === 'guest' && level.id > 2) return true;
      return false;
  };

  const isFeatureLocked = (feature: 'puzzle_hint' | 'premium_color') => {
      // Feature locks removed based on user request "no color lock"
      // if (userTier === 'guest') return true; 
      return false;
  };

  const getMaxMistakes = () => {
      switch(difficulty) {
          case 'easy': return 999;
          case 'normal': return 5;
          case 'hard': return 3;
          default: return 5;
      }
  }

  useEffect(() => {
    const isImmersive = gameState !== 'mode-select';
    onImmersiveChange?.(isImmersive);
  }, [gameState, onImmersiveChange]);

  // Handle Win State & Rewards
  useEffect(() => {
      if (gameState === 'won' || gameState === 'level-complete') {
          if (user) {
              let reward = 0;
              if (gameMode === 'restoration') {
                  const base = difficulty === 'hard' ? 200 : difficulty === 'normal' ? 100 : 50;
                  const mistakePenalty = Math.max(0, mistakes * 10);
                  reward = Math.max(10, base - mistakePenalty);
              } else if (gameMode === 'puzzle') {
                  const size = Math.sqrt(puzzleGrid.length);
                  reward = size > 3 ? 150 : 80;
              } else if (gameMode === 'quiz') {
                  reward = Math.floor(quizScore / 10);
              }
              
              setEarnedCoins(reward);
              authService.updateBalance(user.id, reward).catch(console.error);
          } else {
              setEarnedCoins(0); 
          }
      }
  }, [gameState]);

  const currentLevel = GAME_LEVELS.find(l => l.id === currentLevelId) || GAME_LEVELS[0];

  const handleModeSelect = (mode: any) => {
      if (!user) {
          onAuthRequired();
          return;
      }
      setGameMode(mode);
      if (mode === 'quiz') {
          initQuiz();
      } else {
          setGameState('level-select');
      }
  };

  const initQuiz = () => {
      const shuffled = [...GAME_LEVELS].sort(() => Math.random() - 0.5).slice(0, 5);
      const questions = shuffled.map(level => {
          const others = GAME_LEVELS.filter(l => l.id !== level.id).sort(() => Math.random() - 0.5).slice(0, 3);
          const options = [level, ...others].sort(() => Math.random() - 0.5);
          return {
              target: level,
              options: options,
              detail: { x: Math.random() * 60 + 20, y: Math.random() * 60 + 20, scale: 2 + Math.random() * 1.5 }
          };
      });
      setQuizQuestions(questions);
      setQuizScore(0);
      setQuizStreak(0);
      setCurrentQuizIdx(0);
      setGameState('playing');
  };

  useEffect(() => {
      let timer: any;
      if (gameMode === 'quiz' && gameState === 'playing' && !showFact) {
          timer = setInterval(() => {
              setQuizTimer(prev => {
                  if (prev <= 0) {
                      handleQuizAnswer(-1); // Time out
                      return 0;
                  }
                  return prev - 0.1; 
              });
          }, 50);
      }
      return () => clearInterval(timer);
  }, [gameMode, gameState, showFact]);

  const handleQuizAnswer = (levelId: number) => {
      if (showFact) return;
      const isCorrect = levelId === quizQuestions[currentQuizIdx].target.id;
      setSelectedAnswerId(levelId);
      setLastAnswerCorrect(isCorrect);
      if (isCorrect) {
          setQuizScore(s => s + Math.round(quizTimer * (1 + quizStreak * 0.1)));
          setQuizStreak(s => s + 1);
      } else {
          setQuizStreak(0);
          setMistakes(m => m + 1);
      }
      setShowFact(true);
  };

  const nextQuizStep = () => {
      setShowFact(false);
      setLastAnswerCorrect(null);
      setSelectedAnswerId(null);
      setQuizTimer(100);
      if (currentQuizIdx + 1 < quizQuestions.length) {
          setCurrentQuizIdx(prev => prev + 1);
      } else {
          setGameState('won');
      }
  };

  const handleLevelSelect = (levelId: number) => {
      const level = GAME_LEVELS.find(l => l.id === levelId);
      if (!level) return;

      if (isContentLocked(level)) {
          onNavigate('membership');
          return;
      }

      setCurrentLevelId(levelId);
      setGameState('intro');
      setRestoredRegions([]);
      setMistakes(0);
      setPuzzleMoves(0);
      setIsPeeking(false);
      setIsShaking(false);
      
      if (gameMode === 'puzzle') initPuzzle(level.difficulty);
  };

  const initPuzzle = (difficulty: number) => {
      const size = difficulty <= 2 ? 3 : 4;
      let grid = Array.from({ length: size * size }, (_, i) => i);
      let isSolved = true;
      do {
          grid = [...grid].sort(() => Math.random() - 0.5);
          isSolved = grid.every((val, i) => val === i);
      } while (isSolved);
      setPuzzleGrid(grid);
  };

  const isAdjacent = (i1: number, i2: number, size: number) => {
      const row1 = Math.floor(i1 / size);
      const col1 = i1 % size;
      const row2 = Math.floor(i2 / size);
      const col2 = i2 % size;
      return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
  };

  const handlePuzzleTileClick = (index: number) => {
      const size = Math.sqrt(puzzleGrid.length);
      
      if (selectedTileIndex === null) {
          setSelectedTileIndex(index);
      } else {
          if (selectedTileIndex === index) {
              setSelectedTileIndex(null);
              return;
          }
          
          if (isAdjacent(selectedTileIndex, index, size)) {
              const newGrid = [...puzzleGrid];
              const temp = newGrid[selectedTileIndex];
              newGrid[selectedTileIndex] = newGrid[index];
              newGrid[index] = temp;
              
              setPuzzleGrid(newGrid);
              setSelectedTileIndex(null);
              setPuzzleMoves(m => m + 1);
              
              if (newGrid.every((val, i) => val === i)) {
                  setTimeout(() => setGameState('won'), 800);
              }
          } else {
              setSelectedTileIndex(index);
          }
      }
  };

  const handlePuzzleHint = () => {
      if (isFeatureLocked('puzzle_hint')) {
          setShowUpsellModal(true);
          return;
      }
      setIsPeeking(true);
      setTimeout(() => setIsPeeking(false), 1500); 
  };

  const handleRegionClick = (region: any) => {
      if (gameState !== 'playing' || restoredRegions.includes(region.id)) return;
      
      if (!selectedColor || selectedColor.toLowerCase() !== region.color.toLowerCase()) {
          setMistakes(m => m + 1);
          setIsShaking(true);
          setFeedbackMessage("Incorrect Color!");
          setTimeout(() => { setIsShaking(false); setFeedbackMessage(null); }, 1000);
          return;
      }
      
      setRestoredRegions(prev => [...prev, region.id]);
      if (restoredRegions.length + 1 === currentLevel.regions.length) {
          setTimeout(() => setGameState('level-complete'), 1000);
      }
  };

  const handleColorSelect = (color: string, index: number) => {
      setSelectedColor(color);
  };

  const handleRestorationHint = () => {
      const nextRegion = currentLevel.regions.find(r => !restoredRegions.includes(r.id));
      if (nextRegion) {
          setHintActiveRegionId(nextRegion.id);
          setSelectedColor(nextRegion.color);
          setTimeout(() => setHintActiveRegionId(null), 2000);
      }
  };

  if (gameState === 'playing' && gameMode === 'puzzle') {
      const size = Math.sqrt(puzzleGrid.length);
      const tileSizePercent = 100 / size;
      return (
          <div className="fixed inset-0 z-[120] bg-[#1a1a1a] flex flex-col animate-fade-in">
              <div className="h-16 md:h-20 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-black/20 backdrop-blur-md z-20 relative">
                  <div className="flex items-center gap-4 md:gap-6">
                      <button onClick={() => setGameState('level-select')} className="text-white/50 hover:text-white transition-colors active:scale-90"><X size={22} /></button>
                      <div className="h-6 md:h-8 w-px bg-white/10"></div>
                      <div className="text-white">
                          <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">Moves</div>
                          <div className="font-mono text-sm">{puzzleMoves}</div>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-6">
                        <button onClick={handlePuzzleHint} className="p-2.5 md:p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors relative active:scale-90">
                            <Eye size={16} />
                            {isFeatureLocked('puzzle_hint') && <div className="absolute -top-1 -right-1 bg-art-gold text-black rounded-full p-0.5"><Lock size={10} /></div>}
                        </button>
                        <div className="flex items-center gap-2 md:gap-4 px-3 md:px-4 py-1.5 md:py-2 bg-white/5 rounded-full border border-white/10">
                            <Grid3X3 size={14} className="text-white/60" />
                            <span className="text-xs font-bold text-white/80">{size}×{size}</span>
                        </div>
                  </div>
              </div>
              <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
                  <div className="relative shadow-2xl rounded-sm overflow-hidden bg-[#0a0a0a]" style={{ width: 'min(80vh, 80vw)', height: 'min(80vh, 80vw)' }}>
                      <div className={`absolute inset-0 z-20 transition-opacity duration-300 pointer-events-none ${isPeeking ? 'opacity-100' : 'opacity-0'}`}><img src={currentLevel.imageUrl} className="w-full h-full object-cover" /></div>
                      {puzzleGrid.map((tileIndex, visualIndex) => {
                          const isSelected = selectedTileIndex === visualIndex;
                          const row = Math.floor(visualIndex / size);
                          const col = visualIndex % size;
                          const originalRow = Math.floor(tileIndex / size);
                          const originalCol = tileIndex % size;
                          return (
                              <button key={visualIndex} onClick={() => handlePuzzleTileClick(visualIndex)}
                                className={`absolute transition-all duration-300 border border-[#1a1a1a] box-border ${isSelected ? 'z-30 brightness-125 shadow-[0_0_30px_rgba(188,75,26,0.6)] scale-[0.98] ring-4 ring-art-primary' : 'z-10 hover:brightness-110'}`}
                                style={{ width: `${tileSizePercent}%`, height: `${tileSizePercent}%`, left: `${col * tileSizePercent}%`, top: `${row * tileSizePercent}%`, backgroundImage: `url(${currentLevel.imageUrl})`, backgroundSize: `${size * 100}% ${size * 100}%`, backgroundPosition: `${originalCol * (100 / (size - 1))}% ${originalRow * (100 / (size - 1))}%` }}
                              ><span className="absolute top-1 left-2 text-[10px] text-white/50 font-mono pointer-events-none select-none drop-shadow-md">{tileIndex + 1}</span></button>
                          );
                      })}
                  </div>
              </div>
          </div>
      );
  }

  if (gameState === 'playing' && gameMode === 'restoration') {
      return (
          <div className="fixed inset-0 z-[120] bg-[#1a1a1a] flex flex-col animate-fade-in">
              <div className="h-16 md:h-20 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-black/20 backdrop-blur-md relative z-20">
                  <div className="flex items-center gap-4 md:gap-6">
                      <button onClick={() => setGameState('level-select')} className="text-white/50 hover:text-white transition-colors active:scale-90"><X size={22} /></button>
                      <div className="h-6 w-px bg-white/10"></div>
                      <div className="text-white">
                          <Tooltip text="Completed Areas">
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t('game.progress')}</div>
                            <div className="font-mono text-sm">{Math.round((restoredRegions.length / currentLevel.regions.length) * 100)}%</div>
                          </Tooltip>
                      </div>
                  </div>
                  
                  {feedbackMessage && (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest animate-bounce shadow-lg border border-red-400">
                          {feedbackMessage}
                      </div>
                  )}

                  <div className="flex items-center gap-3 md:gap-6">
                      <button onClick={handleRestorationHint} className="p-2.5 md:p-3 rounded-full bg-white/5 hover:bg-white/10 text-art-gold transition-colors active:scale-90"><Lightbulb size={18} /></button>
                      <button onMouseDown={() => setShowReference(true)} onMouseUp={() => setShowReference(false)} onMouseLeave={() => setShowReference(false)} onTouchStart={() => setShowReference(true)} onTouchEnd={() => setShowReference(false)} className="p-2.5 md:p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors active:scale-90"><Eye size={18} /></button>
                      <div className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-red-500/10 rounded-full text-red-400 border border-red-500/20 ${isShaking ? 'bg-red-500 text-white animate-shake' : ''}`}>
                          <AlertCircle size={12} /><span className="font-mono text-xs">{mistakes} / {getMaxMistakes() === 999 ? '∞' : getMaxMistakes()}</span>
                      </div>
                  </div>
              </div>
              <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
                  <div className={`relative max-h-full aspect-[3/4] shadow-2xl rounded-sm overflow-hidden select-none cursor-none group ${isShaking ? 'animate-shake border-4 border-red-500' : ''}`}>
                      <img src={currentLevel.imageUrl} className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ${showReference ? 'opacity-0' : 'opacity-100 filter grayscale-[0.8] contrast-125 sepia-[0.2]'}`} />
                      <img src={currentLevel.imageUrl} className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300 ${showReference ? 'opacity-100' : 'opacity-0'}`} />
                      {!showReference && currentLevel.regions.map((region) => {
                          const isRestored = restoredRegions.includes(region.id);
                          const isHovered = hoverRegionId === region.id;
                          if (isRestored) return <div key={region.id} className="absolute rounded-full filter blur-[10px] transition-all duration-1000 animate-fade-in" style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.radius * 2.5}%`, height: `${region.radius * 2.5}%`, backgroundColor: region.color, transform: 'translate(-50%, -50%)', mixBlendMode: 'color' }}></div>;
                          return <div key={region.id} className="absolute cursor-none z-10" style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.radius * 2}%`, height: `${region.radius * 2}%`, transform: 'translate(-50%, -50%)' }} onMouseEnter={() => setHoverRegionId(region.id)} onMouseLeave={() => setHoverRegionId(null)} onClick={() => handleRegionClick(region)}><div className={`w-full h-full rounded-full border-2 border-dashed ${hintActiveRegionId === region.id ? 'border-art-gold animate-ping opacity-100' : 'border-white/30 animate-pulse-slow'} transition-opacity ${isHovered ? 'opacity-100' : 'opacity-30'}`}></div></div>;
                      })}
                      <div className="pointer-events-none fixed z-50 transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference text-white" style={{ left: 'var(--mouse-x)', top: 'var(--mouse-y)' }} ref={(el) => { if (el) { const updatePos = (e: MouseEvent) => { el.style.setProperty('--mouse-x', `${e.clientX}px`); el.style.setProperty('--mouse-y', `${e.clientY}px`); }; window.addEventListener('mousemove', updatePos); return () => window.removeEventListener('mousemove', updatePos); } }}><Brush size={32} className={`transition-transform duration-200 ${hoverRegionId ? 'scale-125 -rotate-12' : 'scale-100'}`} /></div>
                  </div>
              </div>
              <div className="h-24 md:h-32 bg-[#121212] border-t border-white/5 flex items-center justify-center gap-4 md:gap-8 relative z-20 px-4 overflow-x-auto">
                  {currentLevel.palette.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleColorSelect(color, idx)}
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-full relative transition-all duration-300 flex-shrink-0 ${selectedColor === color ? 'scale-110 ring-4 ring-white shadow-lg' : 'hover:scale-105 active:scale-95'}`}
                        style={{ backgroundColor: color }}
                      >
                          {selectedColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                                  <Check className="text-white drop-shadow-md" size={20} strokeWidth={3} />
                              </div>
                          )}
                      </button>
                  ))}
              </div>
          </div>
      );
  }

  if (gameState === 'mode-select') {
    return (
      <div className="min-h-screen bg-[#080808] text-white scroll-container overflow-y-auto relative dot-grid-bg">
        {/* content above dot layer */}
        <div className="relative z-10 pt-24 md:pt-32 pb-10 px-4 md:px-16 max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Sparkles size={11} className="text-white/20" />
                <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-white/20">Challenge Your Insight</span>
              </div>
              <h1 className="font-serif text-[18vw] md:text-[9rem] leading-[0.85] text-white tracking-tighter">{t('game.title')}</h1>
            </div>
            <p className="hidden md:block max-w-[260px] text-white/25 text-sm font-light leading-relaxed pb-2">{t('game.subtitle')}</p>
          </div>
          <div className="w-full h-px bg-white/[0.06] mt-10" />
        </div>
        {/* Daily Challenge */}
        <div className="relative z-10 px-4 md:px-16 max-w-[1800px] mx-auto mb-6">
          <div className="group cursor-pointer relative h-36 rounded-2xl overflow-hidden"
            onClick={() => {
              if (!user) { onAuthRequired(); return; }
              setGameMode('restoration');
              setCurrentLevelId(dailyLevel.id);
              setGameState('intro');
              setRestoredRegions([]); setMistakes(0);
            }}>
            <img src={dailyLevel.imageUrl} className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 to-black/20" />
            <div className="relative z-10 h-full flex items-center justify-between px-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={10} className="text-art-gold" />
                  <span className="text-art-gold text-[8px] font-black uppercase tracking-[0.5em]">今日挑战 · Daily Challenge</span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl text-white">{dailyLevel.title}</h3>
                <p className="text-white/30 text-[10px] mt-1 uppercase tracking-wider">{dailyLevel.artist} · {dailyLevel.year}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-art-gold/10 rounded-full border border-art-gold/20">
                  <Medal size={10} className="text-art-gold" />
                  <span className="text-art-gold text-[9px] font-bold">+200 ArtCoin</span>
                </div>
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center group-hover:bg-art-gold transition-colors duration-300 shadow-2xl">
                  <Play size={14} className="text-black ml-0.5" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Cards */}
        <div className="relative z-10 px-4 md:px-16 max-w-[1800px] mx-auto pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['restoration', 'puzzle', 'quiz'] as const).map((m, i) => {
              const Icon = m === 'restoration' ? Palette : m === 'puzzle' ? Grid3X3 : BrainCircuit;
              const nums = ['01', '02', '03'];
              return (
                <button key={m} onClick={() => handleModeSelect(m)}
                  className="group relative h-[45vw] min-h-[200px] md:h-[55vh] md:min-h-[380px] rounded-2xl overflow-hidden text-left cursor-pointer active:scale-[0.98]">
                  <img src={GAME_LEVELS[i * 8].imageUrl}
                    className="absolute inset-0 w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5 group-hover:via-black/40 transition-all duration-700" />
                  <div className="absolute top-5 left-5 font-mono text-[9px] text-white/20 tracking-[0.3em]">{nums[i]}</div>
                  <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Icon size={12} className="text-white" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-7">
                    <h3 className="font-serif text-2xl md:text-4xl text-white mb-1 md:mb-2">{t(`game.mode_${m}`)}</h3>
                    <p className="text-white/40 text-xs md:text-sm leading-relaxed max-w-[240px] opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 delay-75 hidden md:block">
                      {t(`game.desc_${m}`)}
                    </p>
                    <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/50">{t('game.start')}</span>
                      <ArrowRight size={10} className="text-white/50" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'level-select') {
    return (
      <div className="fixed inset-0 z-[120] bg-[#080808] text-white flex flex-col">
        <div className="shrink-0 bg-[#080808]/90 backdrop-blur-md border-b border-white/[0.05] px-4 md:px-16 py-4 md:py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={() => setGameState('mode-select')}
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white">
              <ChevronLeft size={16} />
            </button>
            <div>
              <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/20 block">Archive Collection</span>
              <h2 className="font-serif text-xl text-white leading-tight">{t('game.level_select')}</h2>
            </div>
          </div>
          <span className="text-white/20 text-xs font-mono">{GAME_LEVELS.length} works</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 md:px-16 py-10 max-w-[1800px] mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
              {GAME_LEVELS.map((level, i) => {
                const locked = isContentLocked(level);
                return (
                  <div key={level.id} id={`level-${level.id}`} onClick={() => handleLevelSelect(level.id)}
                    className="group relative cursor-pointer rounded-xl overflow-hidden aspect-[3/4] bg-stone-900"
                    style={{ animationDelay: `${Math.min(i * 20, 500)}ms` }}>
                    <img src={level.imageUrl}
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${locked ? 'grayscale opacity-30' : ''}`}
                      loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {locked ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                          <Lock size={14} className="text-white/50" />
                        </div>
                      </div>
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="font-serif text-xs text-white line-clamp-1">{level.title}</p>
                      <p className="text-[8px] text-white/40 uppercase tracking-wider mt-0.5">{level.artist}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-0.5">
                      {[...Array(level.difficulty)].map((_, di) => <Star key={di} size={5} className="fill-art-gold text-art-gold" />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'intro') {
    return (
      <div className="fixed inset-0 z-[100] bg-[#080808] flex animate-fade-in">
        {/* Left: full artwork */}
        <div className="hidden lg:block w-1/2 relative overflow-hidden">
          <img src={currentLevel.imageUrl} className="w-full h-full object-cover scale-105" style={{ animation: 'slowZoom 20s ease-out forwards' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080808]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        {/* Right: info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-10 lg:px-16 py-16 md:py-20 relative">
          <button onClick={() => setGameState('level-select')}
            className="absolute top-8 right-8 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white/40 hover:text-white">
            <X size={16} />
          </button>
          <div className="flex items-center gap-3 mb-8">
            <Crown size={12} className="text-art-gold" />
            <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-art-gold">Masterpiece Collection</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl text-white leading-none mb-4">{currentLevel.title}</h1>
          <p className="text-white/30 text-xs uppercase tracking-[0.3em] mb-6 md:mb-8">{currentLevel.artist} · {currentLevel.year}</p>
          <div className="w-12 h-px bg-white/15 mb-6 md:mb-8" />
          <p className="text-white/50 text-sm leading-relaxed max-w-md mb-8 md:mb-12">{currentLevel.description}</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setGameState('playing')}
              className="flex items-center gap-3 px-10 py-4 bg-white text-black rounded-full font-bold uppercase tracking-[0.25em] text-xs hover:bg-art-gold transition-colors shadow-2xl">
              <Play size={14} fill="currentColor" />
              {t('game.start')}
            </button>
            <button onClick={() => setGameState('level-select')}
              className="px-10 py-4 border border-white/10 text-white/40 rounded-full font-bold uppercase tracking-[0.25em] text-xs hover:border-white/30 hover:text-white/70 transition-all">
              {t('game.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && gameMode === 'quiz') {
      const currentQ = quizQuestions[currentQuizIdx];
      return (
          <div className="fixed inset-0 z-[100] bg-[#F9F8F6] flex flex-col items-center justify-center p-6 animate-fade-in">
               {/* Header / Timer */}
               <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-center">
                   <div className="text-lg md:text-2xl font-serif italic text-stone-900">Q {currentQuizIdx + 1}/{quizQuestions.length}</div>
                   <div className="flex items-center gap-2 md:gap-4">
                       <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-art-gold/10 text-art-gold rounded-full font-bold border border-art-gold/20 text-sm">
                           <Trophy size={14} /> <span className="font-mono">{quizScore}</span>
                       </div>
                       <button onClick={() => setGameState('mode-select')} className="p-2 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-900 transition-colors active:scale-90"><X size={22} /></button>
                   </div>
               </div>
               <div className="w-full max-w-4xl h-1 bg-stone-200 fixed top-16 md:top-24 rounded-full overflow-hidden">
                   <div className="h-full bg-art-primary transition-all duration-100 ease-linear" style={{ width: `${quizTimer}%` }}></div>
               </div>

               <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-16 items-center mt-10 md:mt-12">
                   <div className="relative aspect-square rounded-[20px] md:rounded-[32px] overflow-hidden shadow-2xl bg-stone-200 ring-4 md:ring-8 ring-white max-h-[35vh] lg:max-h-none w-full">
                        {/* Zoomed in detail for quiz */}
                        <div className="absolute inset-0 overflow-hidden">
                             <img 
                                src={currentQ.target.imageUrl} 
                                className="w-full h-full object-cover origin-center transition-transform duration-[10s] ease-linear"
                                style={{ transform: showFact ? 'scale(1)' : `scale(${currentQ.detail.scale}) translate(${currentQ.detail.x}px, ${currentQ.detail.y}px)` }}
                             />
                        </div>
                        {showFact && (
                             <div className={`absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm bg-black/40 animate-fade-in`}>
                                 {lastAnswerCorrect ? <CheckCircle size={80} className="text-green-400 drop-shadow-lg" /> : <X size={80} className="text-red-400 drop-shadow-lg" />}
                             </div>
                        )}
                   </div>

                   <div className="space-y-3 md:space-y-6">
                       <h3 className="font-serif text-xl md:text-3xl text-stone-800 text-center lg:text-left mb-4 md:mb-8">Which masterpiece is this detail from?</h3>
                       <div className="grid grid-cols-1 gap-2 md:gap-4">
                           {currentQ.options.map((opt: any) => {
                               let btnClass = "p-3 md:p-5 rounded-xl md:rounded-2xl border-2 border-stone-200 text-left font-serif text-base md:text-lg transition-all hover:border-art-primary hover:shadow-md bg-white text-stone-700 active:scale-[0.98]";
                               if (showFact) {
                                   if (opt.id === currentQ.target.id) btnClass = "p-3 md:p-5 rounded-xl md:rounded-2xl border-2 border-green-500 bg-green-50 text-green-800 font-bold shadow-md";
                                   else if (opt.id === selectedAnswerId && !lastAnswerCorrect) btnClass = "p-3 md:p-5 rounded-xl md:rounded-2xl border-2 border-red-400 bg-red-50 text-red-600 opacity-80";
                                   else btnClass = "p-3 md:p-5 rounded-xl md:rounded-2xl border-2 border-stone-100 bg-stone-50 text-stone-400 opacity-50";
                               }
                               return (
                                   <button
                                      key={opt.id}
                                      onClick={() => handleQuizAnswer(opt.id)}
                                      disabled={showFact}
                                      className={btnClass}
                                   >
                                       {opt.title}
                                       <span className="block text-xs font-sans font-bold uppercase tracking-widest text-stone-400 mt-1">{opt.artist}</span>
                                   </button>
                               );
                           })}
                       </div>
                       
                       {showFact && (
                           <div className="animate-fade-in-up">
                               <div className="p-6 bg-art-primary/5 rounded-2xl border border-art-primary/10 mb-6">
                                   <p className="text-stone-600 text-sm leading-relaxed"><span className="font-bold text-art-primary mr-2">Did you know?</span>{currentQ.target.description}</p>
                               </div>
                               <button onClick={nextQuizStep} className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-art-primary transition-colors">
                                   {currentQuizIdx + 1 < quizQuestions.length ? 'Next Question' : 'Finish Quiz'}
                               </button>
                           </div>
                       )}
                   </div>
               </div>
          </div>
      );
  }

  if (gameState === 'won' || gameState === 'level-complete') {
      return (
          <div className="fixed inset-0 z-[100] bg-[#F9F8F6] flex items-center justify-center p-6 animate-fade-in">
              <ConfettiCanvas />
              <div className="max-w-md w-full text-center space-y-6 md:space-y-8 relative z-10">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-art-gold text-white rounded-full flex items-center justify-center mx-auto shadow-2xl mb-6 md:mb-8 animate-bounce">
                      <Trophy size={40} fill="currentColor" />
                  </div>
                  <h2 className="font-serif text-4xl md:text-6xl text-art-accent italic">{t('game.won_title')}</h2>
                  <div className="flex flex-col gap-3 md:gap-4 items-center">
                      <p className="text-stone-500 font-light text-base md:text-lg">
                          {gameMode === 'restoration' ? 'Masterpiece Restored' : gameMode === 'puzzle' ? 'Memory Reconstructed' : 'Knowledge Certified'}
                      </p>
                      {earnedCoins > 0 && (
                          <div className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-yellow-100 text-yellow-700 rounded-full font-bold border border-yellow-200 text-sm md:text-base">
                              <Coins size={16} /> +{earnedCoins} ArtCoins
                          </div>
                      )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4 pt-6 md:pt-8">
                      <button onClick={() => setGameState('level-select')} className="py-3.5 md:py-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 font-bold uppercase tracking-widest transition-colors text-sm active:scale-95">
                          {t('game.back')}
                      </button>
                      <button onClick={() => { if(gameMode === 'quiz') handleModeSelect('quiz'); else handleLevelSelect(currentLevelId! + 1); }} className="py-3.5 md:py-4 rounded-xl bg-stone-900 text-white hover:bg-art-primary font-bold uppercase tracking-widest transition-colors shadow-lg text-sm active:scale-95">
                          {t('game.next')}
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <>
      {/* Upsell Modal */}
      {showUpsellModal && (
          <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-[40px] max-w-lg w-full p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-art-gold via-yellow-300 to-art-gold"></div>
                  <button onClick={() => setShowUpsellModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-900"><X size={20}/></button>
                  
                  <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-art-gold/10 text-art-gold rounded-full flex items-center justify-center mx-auto mb-4">
                          <Crown size={32} />
                      </div>
                      <h3 className="font-serif text-3xl text-stone-900">{t('game.upsell_title')}</h3>
                      <p className="text-stone-500 leading-relaxed px-4">
                          {t('game.upsell_desc')}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 py-6">
                          <div className="p-4 bg-stone-50 rounded-2xl">
                              <div className="text-2xl font-bold text-stone-800 mb-1">50+</div>
                              <div className="text-[10px] uppercase tracking-widest text-stone-400">Levels</div>
                          </div>
                          <div className="p-4 bg-stone-50 rounded-2xl">
                              <div className="text-2xl font-bold text-stone-800 mb-1">4K</div>
                              <div className="text-[10px] uppercase tracking-widest text-stone-400">Quality</div>
                          </div>
                      </div>

                      <button onClick={() => { setShowUpsellModal(false); onNavigate('membership'); }} className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-art-gold hover:text-black transition-all shadow-xl">
                          {t('game.upsell_btn')}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default ArtGame;
