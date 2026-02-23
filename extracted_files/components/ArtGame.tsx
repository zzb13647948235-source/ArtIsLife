
import React, { useState, useEffect, useRef } from 'react';
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
  const [gameMode, setGameMode] = useState<'restoration' | 'puzzle' | 'quiz' | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'mode-select' | 'level-select' | 'intro' | 'playing' | 'won' | 'level-complete'>('mode-select');
  const [showUpsellModal, setShowUpsellModal] = useState<boolean>(false);
  const [earnedCoins, setEarnedCoins] = useState(0); 
  const { t } = useLanguage();
  
  const userTier = user?.tier || 'guest';

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
  const [showFact, setShowFact] = useState(false);

  // Puzzle State
  const [puzzleGrid, setPuzzleGrid] = useState<number[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [puzzleMoves, setPuzzleMoves] = useState(0);
  const [isPeeking, setIsPeeking] = useState(false); 

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
          setShowUpsellModal(true);
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
              <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md z-20 relative">
                  <div className="flex items-center gap-6">
                      <button onClick={() => setGameState('level-select')} className="text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                      <div className="h-8 w-px bg-white/10"></div>
                      <div className="text-white">
                          <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">Moves</div>
                          <div className="font-mono text-sm">{puzzleMoves}</div>
                      </div>
                  </div>
                  <div className="flex items-center gap-6">
                        <button onClick={handlePuzzleHint} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors relative">
                            <Eye size={18} />
                            {isFeatureLocked('puzzle_hint') && <div className="absolute -top-1 -right-1 bg-art-gold text-black rounded-full p-0.5"><Lock size={10} /></div>}
                        </button>
                        <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <Grid3X3 size={16} className="text-white/60" />
                            <span className="text-xs font-bold text-white/80">{size} x {size} Grid</span>
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
          <div className="fixed inset-0 z-[120] bg-[#1a1a1a] flex flex-col animate-fade-in cursor-none">
              <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md relative z-20">
                  <div className="flex items-center gap-6">
                      <button onClick={() => setGameState('level-select')} className="text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                      <div className="h-8 w-px bg-white/10"></div>
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

                  <div className="flex items-center gap-6">
                      <button onClick={handleRestorationHint} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-art-gold transition-colors"><Lightbulb size={20} /></button>
                      <button onMouseDown={() => setShowReference(true)} onMouseUp={() => setShowReference(false)} onMouseLeave={() => setShowReference(false)} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><Eye size={20} /></button>
                      <div className={`flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full text-red-400 border border-red-500/20 ${isShaking ? 'bg-red-500 text-white animate-shake' : ''}`}>
                          <AlertCircle size={14} /><span className="font-mono text-xs">{mistakes} / {getMaxMistakes() === 999 ? '∞' : getMaxMistakes()}</span>
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
              <div className="h-32 bg-[#121212] border-t border-white/5 flex items-center justify-center gap-8 relative z-20">
                  {currentLevel.palette.map((color, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleColorSelect(color, idx)} 
                        className={`w-16 h-16 rounded-full relative transition-all duration-300 group ${selectedColor === color ? 'scale-110 ring-4 ring-white shadow-lg' : 'hover:scale-105'}`} 
                        style={{ backgroundColor: color }}
                      >
                          {selectedColor === color && (
                              <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
                                  <Check className="text-white drop-shadow-md" size={24} strokeWidth={3} />
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
        <div className="pt-32 pb-20 px-6 max-w-[1600px] mx-auto min-h-screen flex flex-col items-center animate-fade-in scroll-container overflow-y-auto">
             <div className="text-center mb-16 space-y-4">
                  <div className="flex items-center justify-center gap-3 animate-fade-in">
                      <Sparkles className="text-art-primary" size={16} />
                      <span className="text-art-primary font-bold text-[10px] uppercase tracking-[0.4em] block opacity-80">Challenge Your Insight</span>
                  </div>
                  <h2 className="font-serif text-6xl md:text-8xl text-art-accent italic tracking-tighter drop-shadow-sm"><AppleText text={t('game.title')} delay={0.2} /></h2>
                  <p className="max-w-xl mx-auto text-stone-500 text-lg font-light leading-relaxed">{t('game.subtitle')}</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                 {['restoration', 'puzzle', 'quiz'].map((m, i) => {
                    const bgColors = m === 'restoration' ? 'from-amber-100 to-orange-50' : m === 'puzzle' ? 'from-blue-50 to-indigo-50' : 'from-emerald-50 to-teal-50';
                    const iconColor = m === 'restoration' ? 'text-amber-600' : m === 'puzzle' ? 'text-indigo-600' : 'text-emerald-600';
                    const Icon = m === 'restoration' ? Palette : m === 'puzzle' ? Grid3X3 : BrainCircuit;
                    return (
                        <button key={m} onClick={() => handleModeSelect(m)} className="group relative h-[450px] rounded-[40px] overflow-hidden shadow-soft hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/60 text-left bg-white" style={{ animationDelay: `${i * 150}ms` }}>
                             <div className={`absolute inset-0 bg-gradient-to-br ${bgColors} opacity-50 group-hover:opacity-80 transition-opacity`}></div>
                             <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/40 rounded-full blur-3xl"></div>
                             <div className="absolute top-8 right-8 w-32 h-32 rounded-2xl overflow-hidden shadow-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-700 border-2 border-white"><img src={GAME_LEVELS[i % GAME_LEVELS.length].imageUrl} className="w-full h-full object-cover" /></div>
                             <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col h-full justify-end">
                                <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 ${iconColor} group-hover:scale-110 transition-transform duration-500`}><Icon size={28} strokeWidth={1.5} /></div>
                                <h3 className="font-serif text-4xl mb-3 text-stone-800">{t(`game.mode_${m}`)}</h3>
                                <p className="text-stone-500 font-light text-sm mb-8 leading-relaxed pr-8 min-h-[3em]">{t(`game.desc_${m}`)}</p>
                                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-art-primary opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500"><span>{t('game.start')}</span> <ArrowRight size={14} /></div>
                             </div>
                        </button>
                    );
                 })}
             </div>
        </div>
    );
  }

  if (gameState === 'level-select') {
      return (
          <div className="pt-28 pb-20 px-6 max-w-[1600px] mx-auto min-h-screen animate-fade-in scroll-container overflow-y-auto">
              <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                  <div className="flex items-center gap-6">
                    <button onClick={() => setGameState('mode-select')} className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-100 text-stone-600 transition-all cursor-pointer shadow-sm hover:shadow-md"><ChevronLeft size={24} /></button>
                    <div><div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Archive Collection</div><h2 className="font-serif text-4xl md:text-5xl text-art-accent italic tracking-tight">{t('game.level_select')}</h2></div>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {GAME_LEVELS.map((level, i) => {
                      const locked = isContentLocked(level);
                      return (
                        // FIXED: Added click handler here and stopped propagation for the whole card to ensure logic runs
                        <div 
                            key={level.id} 
                            onClick={(e) => { e.stopPropagation(); handleLevelSelect(level.id); }} 
                            className={`group relative bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl border border-stone-100 transition-all duration-500 animate-fade-in-up ${locked ? 'opacity-90 cursor-pointer' : 'cursor-pointer hover:-translate-y-1'}`} 
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <div className="aspect-[4/3] relative overflow-hidden">
                                <img src={level.imageUrl} className={`w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 ${locked ? 'grayscale-[0.8] blur-[1px]' : ''}`} loading="lazy" />
                                {locked ? (
                                    // FIXED: Made the lock overlay clearly interactive
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 text-white p-6 text-center cursor-pointer">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md transition-transform group-hover:scale-110">
                                            <Lock size={20} className="text-white/80" />
                                        </div>
                                        <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-white/80 border border-white/20 px-3 py-1 rounded-full group-hover:bg-white/10 transition-colors">
                                            {t('game.locked_badge')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-10 h-10 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg">
                                            <Play size={16} fill="currentColor" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2"><h3 className="font-serif text-lg text-stone-900 line-clamp-1 group-hover:text-art-primary transition-colors">《{level.title}》</h3><div className="flex gap-0.5 mt-1">{[...Array(level.difficulty)].map((_, di) => <Star key={di} size={8} className="fill-art-gold text-art-gold" />)}</div></div>
                                <div className="flex justify-between items-center text-xs text-stone-500"><span className="uppercase tracking-wider font-bold text-[9px]">{level.artist}</span><span className="font-mono opacity-60">{level.year}</span></div>
                            </div>
                        </div>
                      );
                  })}
              </div>
          </div>
      );
  }

  if (gameState === 'intro') {
      return (
          <div className="fixed inset-0 z-[100] bg-[#F9F8F6] flex items-center justify-center p-6 animate-fade-in">
              <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                  <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden shadow-2xl animate-scale-in group">
                      <img src={currentLevel.imageUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                      <div className="absolute bottom-10 left-10 text-white z-10"><h4 className="font-serif text-5xl italic mb-3">{currentLevel.title}</h4><p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">{currentLevel.artist} • {currentLevel.year}</p></div>
                  </div>
                  <div className="space-y-10 animate-fade-in-up">
                      <div className="flex items-center gap-4 text-art-gold mb-2">
                          <Crown size={20} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.4em]">{t('game.locked_badge') === 'Premium' ? 'Masterpiece Collection' : 'Archive'}</span>
                      </div>
                      <h1 className="font-serif text-6xl md:text-7xl text-stone-900 leading-none">{currentLevel.title}</h1>
                      <p className="text-xl text-stone-500 font-light leading-relaxed max-w-lg">{currentLevel.description}</p>
                      
                      <div className="flex flex-col gap-4 pt-8">
                          <button onClick={() => setGameState('playing')} className="w-full md:w-auto px-12 py-5 bg-stone-900 text-white rounded-full font-bold uppercase tracking-[0.3em] hover:bg-art-primary transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3">
                              <Play size={18} fill="currentColor" /> {t('game.start')}
                          </button>
                          <button onClick={() => setGameState('level-select')} className="w-full md:w-auto px-12 py-5 bg-transparent text-stone-500 rounded-full font-bold uppercase tracking-[0.3em] hover:text-stone-900 transition-all flex items-center justify-center gap-3">
                              {t('game.back')}
                          </button>
                      </div>
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
               <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center">
                   <div className="text-2xl font-serif italic text-stone-900">Question {currentQuizIdx + 1}/{quizQuestions.length}</div>
                   <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2 px-4 py-2 bg-art-gold/10 text-art-gold rounded-full font-bold border border-art-gold/20">
                           <Trophy size={16} /> <span className="font-mono">{quizScore}</span>
                       </div>
                       <button onClick={() => setGameState('mode-select')} className="p-2 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-900 transition-colors"><X size={24} /></button>
                   </div>
               </div>
               <div className="w-full max-w-4xl h-1 bg-stone-200 fixed top-24 rounded-full overflow-hidden">
                   <div className="h-full bg-art-primary transition-all duration-100 ease-linear" style={{ width: `${quizTimer}%` }}></div>
               </div>

               <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-12">
                   <div className="relative aspect-square rounded-[32px] overflow-hidden shadow-2xl bg-stone-200 ring-8 ring-white">
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

                   <div className="space-y-6">
                       <h3 className="font-serif text-3xl text-stone-800 text-center lg:text-left mb-8">Which masterpiece is this detail from?</h3>
                       <div className="grid grid-cols-1 gap-4">
                           {currentQ.options.map((opt: any) => {
                               let btnClass = "p-6 rounded-2xl border border-stone-200 text-left font-serif text-xl transition-all hover:border-art-primary hover:shadow-md bg-white text-stone-600";
                               if (showFact) {
                                   if (opt.id === currentQ.target.id) btnClass = "p-6 rounded-2xl border border-green-500 bg-green-50 text-green-700 font-bold shadow-md";
                                   else if (!lastAnswerCorrect && opt.id === currentQ.options.find((o: any) => o.id !== currentQ.target.id && o.id === /* user selection logic needed but simplifying */ -1)?.id) btnClass = "p-6 rounded-2xl border border-red-200 bg-red-50 text-red-500 opacity-60";
                                   else btnClass = "p-6 rounded-2xl border border-stone-100 bg-stone-50 text-stone-400 opacity-50";
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
                               )
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
              <div className="max-w-md w-full text-center space-y-8 relative z-10">
                  <div className="w-32 h-32 bg-art-gold text-white rounded-full flex items-center justify-center mx-auto shadow-2xl mb-8 animate-bounce">
                      <Trophy size={48} fill="currentColor" />
                  </div>
                  <h2 className="font-serif text-6xl text-art-accent italic">{t('game.won_title')}</h2>
                  <div className="flex flex-col gap-4 items-center">
                      <p className="text-stone-500 font-light text-lg">
                          {gameMode === 'restoration' ? 'Masterpiece Restored' : gameMode === 'puzzle' ? 'Memory Reconstructed' : 'Knowledge Certified'}
                      </p>
                      {earnedCoins > 0 && (
                          <div className="flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-700 rounded-full font-bold border border-yellow-200">
                              <Coins size={18} /> +{earnedCoins} ArtCoins
                          </div>
                      )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-8">
                      <button onClick={() => setGameState('level-select')} className="py-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 font-bold uppercase tracking-widest transition-colors">
                          {t('game.back')}
                      </button>
                      <button onClick={() => { if(gameMode === 'quiz') handleModeSelect('quiz'); else handleLevelSelect(currentLevelId! + 1); }} className="py-4 rounded-xl bg-stone-900 text-white hover:bg-art-primary font-bold uppercase tracking-widest transition-colors shadow-lg">
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
