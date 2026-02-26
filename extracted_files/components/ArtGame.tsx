
import React, { useState, useEffect, useRef } from 'react';
import { GAME_LEVELS } from '../constants';
import { GameLevel, User, ViewState } from '../types';
import { Play, ArrowRight, X, Star, ChevronLeft, Trophy, Eye, Grid3X3, Lock, CheckCircle, Lightbulb, BrainCircuit, Sparkles, Crown, Check, AlertCircle, Coins, Palette } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../services/authService';
import AppleText from './AppleText';

interface ArtGameProps {
  onImmersiveChange?: (isImmersive: boolean) => void;
  user: User | null;
  onAuthRequired: () => void;
  onNavigate: (view: ViewState) => void;
}

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
        for (let i = 0; i < 150; i++) {
            particles.push({ x: width/2, y: height/2, vx: (Math.random()-0.5)*25, vy: (Math.random()-0.5)*25-15, size: Math.random()*8+2, color: colors[Math.floor(Math.random()*colors.length)], gravity: 0.25, drag: 0.96, rotation: Math.random()*360, rotationSpeed: (Math.random()-0.5)*15 });
        }
        let animId: number;
        const animate = () => {
            ctx.clearRect(0,0,width,height);
            particles = particles.filter(p => p.size > 0.1 && p.y < height+100);
            particles.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.vy+=p.gravity; p.vx*=p.drag; p.vy*=p.drag; p.rotation+=p.rotationSpeed; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rotation*Math.PI/180); ctx.fillStyle=p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size); ctx.restore(); });
            if (particles.length > 0) animId = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animId);
    }, []);
    return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:150 }} />;
};

const ArtGame: React.FC<ArtGameProps> = ({ onImmersiveChange, user, onAuthRequired, onNavigate }) => {
  const [gameMode, setGameMode] = useState<'restoration'|'puzzle'|'quiz'|null>(null);
  const [currentLevelId, setCurrentLevelId] = useState<number|null>(null);
  const [gameState, setGameState] = useState<'mode-select'|'level-select'|'intro'|'playing'|'won'|'level-complete'>('mode-select');
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const { t } = useLanguage();
  const userTier = user?.tier || 'guest';

  // Restoration state
  const [selectedColor, setSelectedColor] = useState<string|null>(null);
  const [restoredRegions, setRestoredRegions] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [showReference, setShowReference] = useState(false);
  const [hoverRegionId, setHoverRegionId] = useState<number|null>(null);
  const [hintActiveRegionId, setHintActiveRegionId] = useState<number|null>(null);
  const [difficulty, setDifficulty] = useState<'easy'|'normal'|'hard'>('normal');
  const [isShaking, setIsShaking] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string|null>(null);

  // Quiz state
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizTimer, setQuizTimer] = useState(100);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean|null>(null);
  const [showFact, setShowFact] = useState(false);

  // Puzzle state
  const [puzzleGrid, setPuzzleGrid] = useState<number[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number|null>(null);
  const [puzzleMoves, setPuzzleMoves] = useState(0);
  const [isPeeking, setIsPeeking] = useState(false);

  const isContentLocked = (level: GameLevel) => userTier === 'guest' && level.id > 2;
  const getMaxMistakes = () => difficulty === 'easy' ? 999 : difficulty === 'hard' ? 3 : 5;

  useEffect(() => {
    onImmersiveChange?.(gameState === 'playing' || gameState === 'intro');
  }, [gameState, onImmersiveChange]);

  useEffect(() => {
    if (gameState === 'won' || gameState === 'level-complete') {
      if (user) {
        let reward = 0;
        if (gameMode === 'restoration') { const base = difficulty==='hard'?200:difficulty==='normal'?100:50; reward = Math.max(10, base - mistakes*10); }
        else if (gameMode === 'puzzle') { reward = Math.sqrt(puzzleGrid.length) > 3 ? 150 : 80; }
        else if (gameMode === 'quiz') { reward = Math.floor(quizScore/10); }
        setEarnedCoins(reward);
        authService.updateBalance(user.id, reward).catch(console.error);
      }
    }
  }, [gameState]);

  const currentLevel = GAME_LEVELS.find(l => l.id === currentLevelId) || GAME_LEVELS[0];

  const handleModeSelect = (mode: any) => {
    if (!user) { onAuthRequired(); return; }
    setGameMode(mode);
    if (mode === 'quiz') { initQuiz(); } else { setGameState('level-select'); }
  };

  const initQuiz = () => {
    const shuffled = [...GAME_LEVELS].sort(() => Math.random()-0.5).slice(0,5);
    const questions = shuffled.map(level => {
      const others = GAME_LEVELS.filter(l => l.id !== level.id).sort(() => Math.random()-0.5).slice(0,3);
      return { target: level, options: [level,...others].sort(() => Math.random()-0.5), detail: { x: Math.random()*60+20, y: Math.random()*60+20, scale: 2+Math.random()*1.5 } };
    });
    setQuizQuestions(questions); setQuizScore(0); setQuizStreak(0); setCurrentQuizIdx(0); setGameState('playing');
  };

  useEffect(() => {
    let timer: any;
    if (gameMode === 'quiz' && gameState === 'playing' && !showFact) {
      timer = setInterval(() => { setQuizTimer(prev => { if (prev <= 0) { handleQuizAnswer(-1); return 0; } return prev-0.1; }); }, 50);
    }
    return () => clearInterval(timer);
  }, [gameMode, gameState, showFact]);

  const handleQuizAnswer = (levelId: number) => {
    if (showFact) return;
    const isCorrect = levelId === quizQuestions[currentQuizIdx].target.id;
    setLastAnswerCorrect(isCorrect);
    if (isCorrect) { setQuizScore(s => s + Math.round(quizTimer*(1+quizStreak*0.1))); setQuizStreak(s => s+1); }
    else { setQuizStreak(0); setMistakes(m => m+1); }
    setShowFact(true);
  };

  const nextQuizStep = () => {
    setShowFact(false); setLastAnswerCorrect(null); setQuizTimer(100);
    if (currentQuizIdx+1 < quizQuestions.length) { setCurrentQuizIdx(prev => prev+1); } else { setGameState('won'); }
  };

  const handleLevelSelect = (levelId: number) => {
    const level = GAME_LEVELS.find(l => l.id === levelId);
    if (!level) return;
    if (isContentLocked(level)) { setShowUpsellModal(true); return; }
    setCurrentLevelId(levelId); setGameState('intro');
    setRestoredRegions([]); setMistakes(0); setPuzzleMoves(0); setIsPeeking(false); setIsShaking(false);
    if (gameMode === 'puzzle') initPuzzle(level.difficulty);
  };

  const initPuzzle = (diff: number) => {
    const size = diff <= 2 ? 3 : 4;
    let grid = Array.from({ length: size*size }, (_,i) => i);
    let solved = true;
    do { grid = [...grid].sort(() => Math.random()-0.5); solved = grid.every((v,i) => v===i); } while (solved);
    setPuzzleGrid(grid);
  };

  const isAdjacent = (i1: number, i2: number, size: number) => {
    return Math.abs(Math.floor(i1/size)-Math.floor(i2/size)) + Math.abs(i1%size-i2%size) === 1;
  };

  const handlePuzzleTileClick = (index: number) => {
    const size = Math.sqrt(puzzleGrid.length);
    if (selectedTileIndex === null) { setSelectedTileIndex(index); return; }
    if (selectedTileIndex === index) { setSelectedTileIndex(null); return; }
    if (isAdjacent(selectedTileIndex, index, size)) {
      const newGrid = [...puzzleGrid];
      [newGrid[selectedTileIndex], newGrid[index]] = [newGrid[index], newGrid[selectedTileIndex]];
      setPuzzleGrid(newGrid); setSelectedTileIndex(null); setPuzzleMoves(m => m+1);
      if (newGrid.every((v,i) => v===i)) setTimeout(() => setGameState('won'), 800);
    } else { setSelectedTileIndex(index); }
  };

  const handleRegionClick = (region: any) => {
    if (gameState !== 'playing' || restoredRegions.includes(region.id)) return;
    if (!selectedColor || selectedColor.toLowerCase() !== region.color.toLowerCase()) {
      setMistakes(m => m+1); setIsShaking(true); setFeedbackMessage('颜色不对！');
      setTimeout(() => { setIsShaking(false); setFeedbackMessage(null); }, 1000);
      return;
    }
    setRestoredRegions(prev => [...prev, region.id]);
    if (restoredRegions.length+1 === currentLevel.regions.length) setTimeout(() => setGameState('level-complete'), 1000);
  };

  const handleRestorationHint = () => {
    const nextRegion = currentLevel.regions.find(r => !restoredRegions.includes(r.id));
    if (nextRegion) { setHintActiveRegionId(nextRegion.id); setSelectedColor(nextRegion.color); setTimeout(() => setHintActiveRegionId(null), 2000); }
  };

  // ── RESTORATION PLAYING ──────────────────────────────────────────
  if (gameState === 'playing' && gameMode === 'restoration') {
    return (
      <div onClick={e => e.stopPropagation()} style={{ position:'fixed', inset:0, zIndex:9999, background:'#1a1a1a', display:'flex', flexDirection:'column', pointerEvents:'auto' }}>
        {/* Canvas */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 32px 8px', overflow:'hidden' }}>
          {feedbackMessage && (
            <div style={{ position:'absolute', top:20, left:'50%', transform:'translateX(-50%)', background:'rgba(239,68,68,0.9)', color:'white', padding:'6px 20px', borderRadius:999, fontWeight:700, fontSize:12, zIndex:20 }}>{feedbackMessage}</div>
          )}
          <div style={{ position:'relative', maxHeight:'100%', aspectRatio:'3/4', boxShadow:'0 25px 60px rgba(0,0,0,0.5)', borderRadius:4, overflow:'hidden', userSelect:'none' }}>
            <img src={currentLevel.imageUrl} style={{ width:'100%', height:'100%', objectFit:'contain', pointerEvents:'none', filter:showReference?'none':'grayscale(0.8) contrast(1.25) sepia(0.2)', opacity:showReference?0:1, transition:'all 0.3s' }} />
            <img src={currentLevel.imageUrl} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', pointerEvents:'none', opacity:showReference?1:0, transition:'opacity 0.3s' }} />
            {!showReference && currentLevel.regions.map(region => {
              const isRestored = restoredRegions.includes(region.id);
              if (isRestored) return <div key={region.id} style={{ position:'absolute', left:`${region.x}%`, top:`${region.y}%`, width:`${region.radius*2.5}%`, height:`${region.radius*2.5}%`, backgroundColor:region.color, transform:'translate(-50%,-50%)', borderRadius:'50%', filter:'blur(10px)', mixBlendMode:'color' as any }} />;
              return (
                <div key={region.id} onClick={() => handleRegionClick(region)} onMouseEnter={() => setHoverRegionId(region.id)} onMouseLeave={() => setHoverRegionId(null)}
                  style={{ position:'absolute', left:`${region.x}%`, top:`${region.y}%`, width:`${region.radius*2}%`, height:`${region.radius*2}%`, transform:'translate(-50%,-50%)', cursor:'crosshair', zIndex:10 }}>
                  <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:`2px dashed ${hintActiveRegionId===region.id?'#C5A059':'rgba(255,255,255,0.3)'}`, opacity:hoverRegionId===region.id?1:0.3, transition:'opacity 0.2s' }} />
                </div>
              );
            })}
          </div>
        </div>
        {/* Bottom Bar: palette + controls */}
        <div style={{ background:'#121212', borderTop:'1px solid rgba(255,255,255,0.05)', flexShrink:0, padding:'12px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          {/* Left: close + progress */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setGameState('level-select')} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white', flexShrink:0 }}>
              <X size={20} />
            </button>
            <div style={{ color:'white' }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', opacity:0.5 }}>进度</div>
              <div style={{ fontFamily:'monospace', fontSize:14 }}>{Math.round((restoredRegions.length/currentLevel.regions.length)*100)}%</div>
            </div>
          </div>
          {/* Center: palette */}
          <div style={{ display:'flex', alignItems:'center', gap:16, flex:1, justifyContent:'center' }}>
            {currentLevel.palette.map((color, idx) => (
              <button key={idx} onClick={() => setSelectedColor(color)} style={{ width:48, height:48, borderRadius:'50%', backgroundColor:color, border:selectedColor===color?'3px solid white':'3px solid transparent', cursor:'pointer', transform:selectedColor===color?'scale(1.15)':'scale(1)', transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {selectedColor===color && <Check size={18} color="white" strokeWidth={3} />}
              </button>
            ))}
          </div>
          {/* Right: hint + reference + mistakes */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={handleRestorationHint} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#C5A059', flexShrink:0 }}>
              <Lightbulb size={18} />
            </button>
            <button onMouseDown={() => setShowReference(true)} onMouseUp={() => setShowReference(false)} onMouseLeave={() => setShowReference(false)} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white', flexShrink:0 }}>
              <Eye size={18} />
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'rgba(239,68,68,0.1)', borderRadius:999, border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', fontSize:12 }}>
              <AlertCircle size={13} /><span style={{ fontFamily:'monospace' }}>{mistakes}/{getMaxMistakes()===999?'∞':getMaxMistakes()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PUZZLE PLAYING ────────────────────────────────────────────────
  if (gameState === 'playing' && gameMode === 'puzzle') {
    const size = Math.sqrt(puzzleGrid.length);
    const tileSizePercent = 100/size;
    return (
      <div onClick={e => e.stopPropagation()} style={{ position:'fixed', inset:0, zIndex:9999, background:'#1a1a1a', display:'flex', flexDirection:'column', pointerEvents:'auto' }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 32px 8px', overflow:'hidden' }}>
          <div style={{ position:'relative', width:'min(75vh,75vw)', height:'min(75vh,75vw)', boxShadow:'0 25px 60px rgba(0,0,0,0.5)', borderRadius:4, background:'#0a0a0a' }}>
            <div style={{ position:'absolute', inset:0, zIndex:20, opacity:isPeeking?1:0, transition:'opacity 0.3s', pointerEvents:'none' }}><img src={currentLevel.imageUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} /></div>
            {puzzleGrid.map((tileIndex, visualIndex) => {
              const row = Math.floor(visualIndex/size), col = visualIndex%size;
              const origRow = Math.floor(tileIndex/size), origCol = tileIndex%size;
              const isSelected = selectedTileIndex === visualIndex;
              return (
                <button key={visualIndex} onClick={() => handlePuzzleTileClick(visualIndex)}
                  style={{ position:'absolute', width:`${tileSizePercent}%`, height:`${tileSizePercent}%`, left:`${col*tileSizePercent}%`, top:`${row*tileSizePercent}%`, backgroundImage:`url(${currentLevel.imageUrl})`, backgroundSize:`${size*100}% ${size*100}%`, backgroundPosition:`${origCol*(100/(size-1))}% ${origRow*(100/(size-1))}%`, border:`2px solid #1a1a1a`, cursor:'pointer', zIndex:isSelected?30:10, outline:isSelected?'3px solid #BC4B1A':'none', filter:isSelected?'brightness(1.2)':'none', transition:'all 0.2s' }}
                />
              );
            })}
          </div>
        </div>
        {/* Bottom Bar */}
        <div style={{ background:'#121212', borderTop:'1px solid rgba(255,255,255,0.05)', flexShrink:0, padding:'12px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setGameState('level-select')} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white' }}><X size={20} /></button>
            <div style={{ color:'white' }}><div style={{ fontSize:10, opacity:0.5, textTransform:'uppercase', letterSpacing:'0.2em' }}>步数</div><div style={{ fontFamily:'monospace', fontSize:14 }}>{puzzleMoves}</div></div>
          </div>
          <button onClick={() => { setIsPeeking(true); setTimeout(() => setIsPeeking(false), 1500); }} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white' }}><Eye size={18} /></button>
        </div>
      </div>
    );
  }

  // ── QUIZ PLAYING ─────────────────────────────────────────────────
  if (gameState === 'playing' && gameMode === 'quiz') {
    const currentQ = quizQuestions[currentQuizIdx];
    if (!currentQ) return null;
    return (
      <div onClick={e => e.stopPropagation()} style={{ position:'fixed', inset:0, zIndex:9999, background:'#F9F8F6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, pointerEvents:'auto' }}>
        <div style={{ position:'absolute', top:0, left:0, width:'100%', padding:'24px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontFamily:'serif', fontSize:22, fontStyle:'italic', color:'#1c1917' }}>问题 {currentQuizIdx+1}/{quizQuestions.length}</div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 16px', background:'rgba(197,160,89,0.1)', borderRadius:999, border:'1px solid rgba(197,160,89,0.3)', color:'#C5A059', fontWeight:700 }}>
              <Trophy size={16} /><span style={{ fontFamily:'monospace' }}>{quizScore}</span>
            </div>
            <button onClick={() => setGameState('mode-select')} style={{ background:'rgba(0,0,0,0.05)', border:'none', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#78716c' }}><X size={20} /></button>
          </div>
        </div>
        <div style={{ width:'100%', height:4, background:'#e7e5e4', position:'absolute', top:80, borderRadius:999, overflow:'hidden' }}>
          <div style={{ height:'100%', background:'#BC4B1A', width:`${quizTimer}%`, transition:'width 0.05s linear' }} />
        </div>
        <div style={{ maxWidth:900, width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center', marginTop:48 }}>
          <div style={{ position:'relative', aspectRatio:'1', borderRadius:24, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.15)', background:'#e7e5e4' }}>
            <img src={currentQ.target.imageUrl} style={{ width:'100%', height:'100%', objectFit:'cover', transformOrigin:'center', transform:showFact?'scale(1)':`scale(${currentQ.detail.scale}) translate(${currentQ.detail.x}px,${currentQ.detail.y}px)`, transition:'transform 10s linear' }} />
            {showFact && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)' }}>{lastAnswerCorrect?<CheckCircle size={80} color="#4ade80" />:<X size={80} color="#f87171" />}</div>}
          </div>
          <div>
            <h3 style={{ fontFamily:'serif', fontSize:24, color:'#1c1917', marginBottom:24 }}>这幅细节来自哪幅名作？</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {currentQ.options.map((opt: any) => {
                let bg = 'white', border = '1px solid #e7e5e4', color = '#57534e';
                if (showFact && opt.id === currentQ.target.id) { bg='#f0fdf4'; border='1px solid #22c55e'; color='#15803d'; }
                else if (showFact) { bg='#fafaf9'; color='#a8a29e'; }
                return (
                  <button key={opt.id} onClick={() => handleQuizAnswer(opt.id)} disabled={showFact}
                    style={{ padding:'16px 20px', borderRadius:16, border, background:bg, color, cursor:showFact?'default':'pointer', textAlign:'left', fontFamily:'serif', fontSize:18, transition:'all 0.2s' }}>
                    {opt.title}<span style={{ display:'block', fontSize:11, fontFamily:'sans-serif', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', opacity:0.5, marginTop:4 }}>{opt.artist}</span>
                  </button>
                );
              })}
            </div>
            {showFact && <button onClick={nextQuizStep} style={{ marginTop:16, width:'100%', padding:'14px', background:'#1c1917', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'0.15em', cursor:'pointer' }}>{currentQuizIdx+1<quizQuestions.length?'下一题':'完成测验'}</button>}
          </div>
        </div>
      </div>
    );
  }

  // ── INTRO ─────────────────────────────────────────────────────────
  if (gameState === 'intro') {
    return (
      <div onClick={e => e.stopPropagation()} style={{ position:'fixed', inset:0, zIndex:9999, background:'#F9F8F6', display:'flex', alignItems:'center', justifyContent:'center', padding:24, pointerEvents:'auto' }}>
        <div style={{ maxWidth:1000, width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
          <div style={{ position:'relative', aspectRatio:'3/4', borderRadius:24, overflow:'hidden', boxShadow:'0 25px 60px rgba(0,0,0,0.2)' }}>
            <img src={currentLevel.imageUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
            <div style={{ position:'absolute', bottom:40, left:40, color:'white' }}>
              <h4 style={{ fontFamily:'serif', fontSize:40, fontStyle:'italic', margin:0 }}>{currentLevel.title}</h4>
              <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.3em', opacity:0.7, margin:'8px 0 0' }}>{currentLevel.artist} · {currentLevel.year}</p>
            </div>
          </div>
          <div>
            <h1 style={{ fontFamily:'serif', fontSize:56, color:'#1c1917', lineHeight:1, margin:'0 0 24px' }}>{currentLevel.title}</h1>
            <p style={{ color:'#78716c', fontSize:18, lineHeight:1.7, margin:'0 0 40px' }}>{currentLevel.description}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <button onClick={() => setGameState('playing')} style={{ padding:'18px 40px', background:'#1c1917', color:'white', border:'none', borderRadius:999, fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'0.2em', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                开始挑战
              </button>
              <button onClick={() => setGameState('level-select')} style={{ padding:'18px 40px', background:'transparent', color:'#78716c', border:'none', borderRadius:999, fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'0.2em', cursor:'pointer' }}>
                返回
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── WON / LEVEL-COMPLETE ──────────────────────────────────────────
  if (gameState === 'won' || gameState === 'level-complete') {
    return (
      <div onClick={e => e.stopPropagation()} style={{ position:'fixed', inset:0, zIndex:9999, background:'#F9F8F6', display:'flex', alignItems:'center', justifyContent:'center', padding:24, pointerEvents:'auto' }}>
        <ConfettiCanvas />
        <div style={{ maxWidth:400, width:'100%', textAlign:'center', position:'relative', zIndex:10 }}>
          <div style={{ width:120, height:120, background:'#C5A059', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 32px', boxShadow:'0 20px 60px rgba(197,160,89,0.4)' }}>
            <Trophy size={48} color="white" fill="white" />
          </div>
          <h2 style={{ fontFamily:'serif', fontSize:56, fontStyle:'italic', color:'#BC4B1A', margin:'0 0 16px' }}>完成！</h2>
          <p style={{ color:'#78716c', fontSize:18, margin:'0 0 16px' }}>{gameMode==='restoration'?'杰作已修复':gameMode==='puzzle'?'拼图完成':'知识认证'}</p>
          {earnedCoins > 0 && <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 24px', background:'#fef9c3', borderRadius:999, border:'1px solid #fde047', color:'#854d0e', fontWeight:700, marginBottom:32 }}><Coins size={18} />+{earnedCoins} ArtCoins</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:32 }}>
            <button onClick={() => setGameState('level-select')} style={{ padding:'16px', borderRadius:12, border:'1px solid #e7e5e4', background:'white', color:'#57534e', fontWeight:700, fontSize:12, textTransform:'uppercase', letterSpacing:'0.15em', cursor:'pointer' }}>返回</button>
            <button onClick={() => { if(gameMode==='quiz') handleModeSelect('quiz'); else handleLevelSelect((currentLevelId||1)+1); }} style={{ padding:'16px', borderRadius:12, border:'none', background:'#1c1917', color:'white', fontWeight:700, fontSize:12, textTransform:'uppercase', letterSpacing:'0.15em', cursor:'pointer' }}>下一关</button>
          </div>
        </div>
      </div>
    );
  }

  // ── LEVEL SELECT ─────────────────────────────────────────────────
  if (gameState === 'level-select') {
    return (
      <div onClick={e => e.stopPropagation()} style={{ position:'fixed', inset:0, zIndex:9999, background:'#F9F8F6', display:'flex', flexDirection:'column', pointerEvents:'auto' }}>
        <div style={{ padding:'32px 48px', display:'flex', alignItems:'center', gap:16, borderBottom:'1px solid #e7e5e4' }}>
          <button onClick={() => setGameState('mode-select')} style={{ background:'rgba(0,0,0,0.05)', border:'none', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#57534e' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.2em', color:'#a8a29e' }}>
              {gameMode === 'restoration' ? '修复模式' : '拼图模式'}
            </div>
            <h2 style={{ fontFamily:'serif', fontSize:28, color:'#1c1917', margin:0 }}>选择关卡</h2>
          </div>
        </div>
        {gameMode === 'restoration' && (
          <div style={{ padding:'16px 48px', borderBottom:'1px solid #e7e5e4', display:'flex', gap:8 }}>
            {(['easy','normal','hard'] as const).map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{ padding:'6px 16px', borderRadius:999, border:'none', cursor:'pointer', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', background:difficulty===d?'#1c1917':'rgba(0,0,0,0.05)', color:difficulty===d?'white':'#78716c' }}>
                {d==='easy'?'简单':d==='normal'?'普通':'困难'}
              </button>
            ))}
          </div>
        )}
        <div style={{ flex:1, overflowY:'auto', padding:'32px 48px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:20 }}>
            {GAME_LEVELS.map(level => {
              const locked = isContentLocked(level);
              return (
                <button key={level.id} onClick={() => handleLevelSelect(level.id)} style={{ position:'relative', aspectRatio:'3/4', borderRadius:16, overflow:'hidden', border:'none', cursor:locked?'not-allowed':'pointer', padding:0, background:'#e7e5e4' }}>
                  <img src={level.imageUrl} style={{ width:'100%', height:'100%', objectFit:'cover', filter:locked?'grayscale(1) brightness(0.5)':'none' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
                  <div style={{ position:'absolute', bottom:12, left:12, right:12, textAlign:'left' }}>
                    <div style={{ color:'white', fontFamily:'serif', fontSize:13, fontWeight:700, lineHeight:1.3 }}>{level.title}</div>
                    <div style={{ color:'rgba(255,255,255,0.6)', fontSize:10, marginTop:2 }}>{level.artist}</div>
                  </div>
                  {locked && (
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Lock size={28} color="white" />
                    </div>
                  )}
                  {!locked && (
                    <div style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.4)', borderRadius:999, padding:'2px 8px', color:'white', fontSize:10, fontWeight:700 }}>
                      Lv.{level.difficulty}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {showUpsellModal && (
          <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }} onClick={() => setShowUpsellModal(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background:'white', borderRadius:24, padding:40, maxWidth:400, width:'100%', textAlign:'center' }}>
              <div style={{ width:80, height:80, background:'linear-gradient(135deg,#C5A059,#d4af37)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
                <Crown size={36} color="white" />
              </div>
              <h3 style={{ fontFamily:'serif', fontSize:28, color:'#1c1917', margin:'0 0 12px' }}>解锁全部关卡</h3>
              <p style={{ color:'#78716c', fontSize:15, lineHeight:1.6, margin:'0 0 28px' }}>升级为创作者会员，解锁 50+ 大师修复关卡，体验完整的艺术修复之旅。</p>
              <button onClick={() => { setShowUpsellModal(false); onNavigate('membership'); }} style={{ width:'100%', padding:'16px', background:'#1c1917', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'0.15em', cursor:'pointer', marginBottom:12 }}>
                升级会员
              </button>
              <button onClick={() => setShowUpsellModal(false)} style={{ width:'100%', padding:'12px', background:'transparent', color:'#a8a29e', border:'none', borderRadius:12, fontWeight:700, fontSize:12, cursor:'pointer' }}>
                稍后再说
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── MODE SELECT (default) ─────────────────────────────────────────
  const modes = [
    { id: 'restoration', icon: <Palette size={32} />, title: '色彩修复', desc: '为褪色的名画重新上色，还原大师的色彩哲学', color: '#BC4B1A' },
    { id: 'puzzle', icon: <Grid3X3 size={32} />, title: '拼图复原', desc: '将打乱的名画碎片重新拼合，考验你的空间记忆', color: '#3B5975' },
    { id: 'quiz', icon: <BrainCircuit size={32} />, title: '艺术问答', desc: '从细节识别名作，测试你的艺术鉴赏力', color: '#C5A059' },
  ];

  return (
    <div onClick={e => e.stopPropagation()} style={{ position:'fixed', inset:0, zIndex:9999, background:'#F9F8F6', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, pointerEvents:'auto' }}>
      <div style={{ maxWidth:800, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', background:'rgba(197,160,89,0.1)', borderRadius:999, border:'1px solid rgba(197,160,89,0.3)', color:'#C5A059', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:20 }}>
            <Sparkles size={13} /> 艺术挑战
          </div>
          <h1 style={{ fontFamily:'serif', fontSize:52, color:'#1c1917', margin:'0 0 16px', lineHeight:1.1 }}>选择你的挑战</h1>
          <p style={{ color:'#78716c', fontSize:17, margin:0 }}>三种模式，探索名画的不同维度</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
          {modes.map(mode => (
            <button key={mode.id} onClick={() => handleModeSelect(mode.id as any)}
              style={{ padding:'36px 28px', borderRadius:24, border:'1px solid #e7e5e4', background:'white', cursor:'pointer', textAlign:'left', transition:'all 0.2s', display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ width:64, height:64, borderRadius:16, background:`${mode.color}15`, display:'flex', alignItems:'center', justifyContent:'center', color:mode.color }}>
                {mode.icon}
              </div>
              <div>
                <div style={{ fontFamily:'serif', fontSize:22, color:'#1c1917', marginBottom:8 }}>{mode.title}</div>
                <div style={{ color:'#78716c', fontSize:13, lineHeight:1.6 }}>{mode.desc}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, color:mode.color, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'auto' }}>
                开始 <ArrowRight size={14} />
              </div>
            </button>
          ))}
        </div>
        {user && (
          <div style={{ textAlign:'center', marginTop:32, display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'#a8a29e', fontSize:13 }}>
            <Coins size={14} /> 余额：{user.balance ?? 0} ArtCoins
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtGame;
