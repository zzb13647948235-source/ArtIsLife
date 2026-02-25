import React, { useState, useEffect, ErrorInfo, ReactNode, useRef, useLayoutEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import ArtGenerator from './components/ArtGenerator';
import ArtChat from './components/ArtChat';
import ArtGame from './components/ArtGame';
import ArtStyles from './components/ArtStyles';
import FeedbackModal from './components/FeedbackModal';
import Membership from './components/Membership';
import About from './components/About';
import Login from './components/Login';
import MuseumFinder from './components/MuseumFinder';
import LiquidBackground from './components/LiquidBackground';
import ParticleBackground from './components/ParticleBackground';
import CustomCursor from './components/CustomCursor';
import LegalModal from './components/LegalModal';
import Preloader from './components/Preloader';
import ArtJournal from './components/ArtJournal';
import ArtMarket from './components/ArtMarket';
import ArtCoinShop from './components/ArtCoinShop';
import UGCGallery from './components/UGCGallery';
import { LanguageProvider } from './contexts/LanguageContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { ViewState, GeneratedImage, ChatMessage, UserTier, User } from './types';
import { authService } from './services/authService';
import { MessageSquare, AlertTriangle, RefreshCw, X } from 'lucide-react';

const STORAGE_KEY_ART_HISTORY = 'artislife_history';
const NAV_ORDER: ViewState[] = ['home', 'journal', 'styles', 'gallery', 'chat', 'game', 'map', 'market', 'community'];

interface ErrorBoundaryProps { children?: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

// 优化：使用 React.Component 显式继承，确保类型安全
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState { 
    return { hasError: true }; 
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) { 
    console.error("Critical Failure:", error, errorInfo); 
  }

  handleRestart = () => {
      try {
          localStorage.clear();
      } catch (e) {
          console.warn("Could not clear local storage", e);
      }
      window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-art-bg p-12 text-center relative z-[200] font-serif">
            <AlertTriangle size={64} className="text-red-500 mb-8 animate-bounce" />
            <h2 className="text-4xl font-bold mb-4 italic text-stone-800">艺术连接异常中断</h2>
            <p className="text-stone-500 mb-10 max-w-md leading-relaxed">
                我们在渲染数字杰作时遇到了意料之外的数据波动，画室暂时无法访问。
            </p>
            <button 
                onClick={this.handleRestart} 
                className="px-10 py-5 bg-stone-900 text-white rounded-full flex items-center gap-4 font-bold uppercase tracking-[0.3em] text-xs shadow-xl active:scale-95 transition-all hover:bg-art-primary"
            >
                <RefreshCw size={16} /> 重启创作系统
            </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PageTransition: React.FC<{ viewKey: string; children: React.ReactNode; index: number; currentIndex: number; }> = ({ children, viewKey, index, currentIndex }) => {
    const isActive = index === currentIndex;
    const isBehind = index < currentIndex;
    const isUpcoming = index > currentIndex;
    // Only render adjacent pages (current ±1) to save memory & GPU
    const isAdjacent = Math.abs(index - currentIndex) <= 1;
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (isActive && scrollContainerRef.current) {
            const resetScroll = () => {
                if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
            };
            resetScroll();
            const timer = requestAnimationFrame(resetScroll);
            return () => cancelAnimationFrame(timer);
        }
    }, [isActive]);

    let transform = 'translate3d(0, 0, 0) scale(1)';
    let opacity = 1;

    if (isBehind) {
        transform = 'translate3d(0, -3vh, 0) scale(0.98)';
        opacity = 0;
    } else if (isUpcoming) {
        transform = 'translate3d(0, 100vh, 0) scale(1)';
        opacity = 1;
    }

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                zIndex: isActive ? 60 : isUpcoming ? 70 : 40,
                transform,
                opacity,
                visibility: isActive ? 'visible' : isAdjacent ? 'visible' : 'hidden',
                pointerEvents: isActive ? 'auto' : 'none',
                transition: 'transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: isAdjacent ? 'transform, opacity' : 'auto',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
            } as React.CSSProperties}
            id={`page-${viewKey}`}
        >
            <div
                ref={scrollContainerRef}
                className={`w-full h-full scroll-container ${isActive ? 'overflow-y-auto' : 'overflow-hidden'}`}
                style={{
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                    scrollBehavior: 'auto',
                }}
            >
                {isAdjacent || isActive ? children : null}
            </div>
        </div>
    );
};

function AppContent() {
  const [appReady, setAppReady] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false); 
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [previousView, setPreviousView] = useState<ViewState>('home'); 
  
  // 优化：懒初始化状态，避免因 authService 报错导致白屏
  const [user, setUser] = useState<User | null>(() => {
      try {
          return authService.getCurrentUser();
      } catch (e) {
          console.warn("Failed to load user session", e);
          return null;
      }
  });

  const [isFullScreenModalOpen, setIsFullScreenModalOpen] = useState(false);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [artHistory, setArtHistory] = useState<GeneratedImage[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ id: 'welcome', role: 'model', text: '', timestamp: Date.now() }]);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [prefilledPrompt, setPrefilledPrompt] = useState('');
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  
  const lastScrollTime = useRef(0);

  useEffect(() => {
    try {
        const savedHistory = localStorage.getItem(STORAGE_KEY_ART_HISTORY);
        if (savedHistory) setArtHistory(JSON.parse(savedHistory));
    } catch (e) {
        // Silently fail for storage errors
    }
    
    const unsubscribe = authService.subscribe(newUser => {
        setUser(newUser);
    });
    return () => { unsubscribe(); };
  }, []);

  useEffect(() => {
      const handleWheel = (e: WheelEvent) => {
          if (showAuthOverlay || currentView === 'membership' || currentView === 'login' || currentView === 'about' || isImmersiveMode || isFullScreenModalOpen) return;

          const now = Date.now();
          if (now - lastScrollTime.current < 800) return;

          const currentContainer = document.getElementById(`page-${currentView}`)?.querySelector('.scroll-container');
          if (!currentContainer) return;

          const bottomTolerance = 40;
          const topTolerance = 10;
          const isAtBottom = Math.abs(currentContainer.scrollHeight - currentContainer.scrollTop - currentContainer.clientHeight) < bottomTolerance;
          const isAtTop = currentContainer.scrollTop < topTolerance;

          if (Math.abs(e.deltaY) > 30) {
              const currentIndex = NAV_ORDER.indexOf(currentView);
              if (e.deltaY > 0) {
                  if (isAtBottom && currentIndex < NAV_ORDER.length - 1) {
                      setPreviousView(currentView);
                      setCurrentView(NAV_ORDER[currentIndex + 1]);
                      lastScrollTime.current = now;
                  }
              } else if (e.deltaY < 0) {
                  if (isAtTop && currentIndex > 0) {
                      setPreviousView(currentView);
                      setCurrentView(NAV_ORDER[currentIndex - 1]);
                      lastScrollTime.current = now;
                  }
              }
          }
      };

      window.addEventListener('wheel', handleWheel, { passive: false });
      return () => window.removeEventListener('wheel', handleWheel);
  }, [currentView, showAuthOverlay, isImmersiveMode, isFullScreenModalOpen]);

  useEffect(() => {
      let touchStartY = 0;
      let touchStartX = 0;
      let isSwiping = false;

      const handleTouchStart = (e: TouchEvent) => {
          touchStartY = e.touches[0].clientY;
          touchStartX = e.touches[0].clientX;
          isSwiping = false;
      };

      const handleTouchMove = (e: TouchEvent) => {
          if (showAuthOverlay || isImmersiveMode || isFullScreenModalOpen) return;
          if (isSwiping) return;

          const dy = touchStartY - e.touches[0].clientY;
          const dx = Math.abs(touchStartX - e.touches[0].clientX);

          // Must be more vertical than horizontal, and at least 60px
          if (Math.abs(dy) < 60 || dx > Math.abs(dy) * 0.7) return;

          const now = Date.now();
          if (now - lastScrollTime.current < 600) return;

          const currentContainer = document.getElementById(`page-${currentView}`)?.querySelector('.scroll-container');
          if (!currentContainer) return;

          const isAtBottom = Math.abs(currentContainer.scrollHeight - currentContainer.scrollTop - currentContainer.clientHeight) < 50;
          const isAtTop = currentContainer.scrollTop < 10;
          const currentIndex = NAV_ORDER.indexOf(currentView);

          if (dy > 0 && isAtBottom && currentIndex < NAV_ORDER.length - 1) {
              isSwiping = true;
              setPreviousView(currentView);
              setCurrentView(NAV_ORDER[currentIndex + 1]);
              lastScrollTime.current = now;
          } else if (dy < 0 && isAtTop && currentIndex > 0) {
              isSwiping = true;
              setPreviousView(currentView);
              setCurrentView(NAV_ORDER[currentIndex - 1]);
              lastScrollTime.current = now;
          }
      };

      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      return () => {
          window.removeEventListener('touchstart', handleTouchStart);
          window.removeEventListener('touchmove', handleTouchMove);
      };
  }, [currentView, showAuthOverlay, isImmersiveMode, isFullScreenModalOpen]);

  const handleNavigate = useCallback((v: ViewState) => {
      if (v === 'login' && user) {
          setCurrentView('gallery');
          return;
      }
      if (v !== currentView) {
          setPreviousView(currentView);
          setIsFullScreenModalOpen(false);
      }
      setCurrentView(v);
  }, [currentView, user]);

  const currentIndex = NAV_ORDER.indexOf(currentView);

  return (
    <ErrorBoundary>
      <Preloader onComplete={() => { setLoadingComplete(true); setTimeout(() => setAppReady(true), 600); }} />

      <div className={`h-screen w-screen text-stone-800 dark:text-stone-100 font-sans selection:bg-art-primary/20 flex flex-col overflow-hidden relative z-10 bg-art-bg dark:bg-stone-950 transition-all duration-[2s] ${loadingComplete ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[1.1] blur-2xl'}`}>
          <LiquidBackground currentView={currentView} />
          <ParticleBackground />
          <CustomCursor />

          <Navigation
              currentView={currentView}
              onNavigate={handleNavigate}
              user={user}
              onLogout={() => { authService.logout(); handleNavigate('home'); }}
              isHidden={currentView === 'about' || currentView === 'login' || (isImmersiveMode && currentView !== 'membership') || isFullScreenModalOpen}
              onOpenShop={() => setShowShop(true)}
          />
          
      <main id="main-content" role="main" className={`flex-1 relative w-full h-full transition-all duration-1000 ${showAuthOverlay ? 'scale-[0.95] blur-sm opacity-50' : 'scale-100 opacity-100'}`}>
              {NAV_ORDER.map((viewKey, index) => (
                  <PageTransition key={viewKey} viewKey={viewKey} index={index} currentIndex={currentIndex}>
                      {viewKey === 'home' && <Hero onNavigate={handleNavigate} isActive={currentView === 'home'} />}
                      {viewKey === 'journal' && <ArtJournal onNavigate={handleNavigate} isActive={currentView === 'journal'} onArticleOpen={setIsFullScreenModalOpen} />}
                      {viewKey === 'styles' && <ArtStyles onNavigate={handleNavigate} isActive={currentView === 'styles'} />}
                      {viewKey === 'gallery' && <ArtGenerator history={artHistory} onImageGenerated={(img) => { const next = [...artHistory, img]; setArtHistory(next); try { localStorage.setItem(STORAGE_KEY_ART_HISTORY, JSON.stringify(next)); } catch(e){} }} onClearHistory={() => { setArtHistory([]); try { localStorage.removeItem(STORAGE_KEY_ART_HISTORY); } catch(e){} }} prefilledPrompt={prefilledPrompt} setPrefilledPrompt={setPrefilledPrompt} userTier={user?.tier || 'guest'} onNavigateToMembership={() => handleNavigate('membership')} onAuthRequired={() => setShowAuthOverlay(true)} isLoggedIn={!!user} onImageSelect={(image) => { /* Don't hide nav on image select */ }} />}
                      {viewKey === 'market' && <ArtMarket onNavigate={handleNavigate} isActive={currentView === 'market'} onFullScreenToggle={setIsFullScreenModalOpen} generatedImages={artHistory} />}
                      {viewKey === 'community' && <UGCGallery user={user} onAuthRequired={() => setShowAuthOverlay(true)} onNavigate={handleNavigate} isActive={currentView === 'community'} />}
                      {viewKey === 'chat' && <ArtChat messages={chatMessages} setMessages={setChatMessages} onAuthRequired={() => setShowAuthOverlay(true)} isLoggedIn={!!user} />}
                      {viewKey === 'game' && <ArtGame onImmersiveChange={setIsImmersiveMode} user={user} onAuthRequired={() => setShowAuthOverlay(true)} onNavigate={handleNavigate} />}
                      {viewKey === 'map' && <MuseumFinder onNavigate={handleNavigate} onOpenLegal={(type) => setLegalModalType(type)} />}
                  </PageTransition>
              ))}

              {currentView === 'login' && <div className="absolute inset-0 z-[100] animate-fade-in"><Login onLoginSuccess={(u) => { setUser(u); handleNavigate('gallery'); }} onNavigate={handleNavigate} /></div>}
              {currentView === 'membership' && (
                <div className="absolute inset-0 z-[110] animate-fade-in bg-white overflow-y-auto overscroll-contain">
                  <Membership 
                    currentTier={user?.tier || 'guest'} 
                    onUpgrade={async (t) => { 
                      if (!user) {
                        setShowAuthOverlay(true);
                        throw new Error("AUTH_REQUIRED");
                      }
                      await authService.upgradeTier(user.id, t); 
                    }} 
                    onClose={() => setCurrentView(previousView)} 
                  />
                </div>
              )}
              {currentView === 'about' && (
                <div className="absolute inset-0 z-[110] animate-fade-in bg-art-bg overflow-y-auto overscroll-contain">
                  <About />
                  <div className="fixed top-8 right-8 z-[200]">
                    <button onClick={() => setCurrentView(previousView)} className="p-3 rounded-full bg-white/90 backdrop-blur-md shadow-lg hover:bg-white transition-all text-stone-600 hover:text-stone-900 border border-stone-200">
                      <X size={20} />
                    </button>
                  </div>
                </div>
              )}
          </main>
          
          {showAuthOverlay && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in" onClick={() => setShowAuthOverlay(false)}>
                <div onClick={e => e.stopPropagation()} className="w-full max-w-4xl h-[85vh] bg-white rounded-[48px] overflow-hidden shadow-2xl relative">
                    <button onClick={() => setShowAuthOverlay(false)} className="absolute top-8 right-8 z-[1010] p-2 text-stone-300 hover:text-stone-900 transition-colors"><X size={24}/></button>
                    <Login embedMode onLoginSuccess={(u) => { setUser(u); setShowAuthOverlay(false); }} onNavigate={handleNavigate} />
                </div>
            </div>
          )}
          <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
          {showShop && (
            <ArtCoinShop
              user={user}
              onClose={() => setShowShop(false)}
              onUserUpdate={(u) => setUser(u)}
              onAuthRequired={() => { setShowShop(false); setShowAuthOverlay(true); }}
            />
          )}
      </div>
      <style>{`
        .scroll-container::-webkit-scrollbar { width: 6px; }
        .scroll-container::-webkit-scrollbar-track { background: transparent; }
        .scroll-container::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .scroll-container::-webkit-scrollbar-thumb:hover { background: rgba(188,75,26,0.5); }
      `}</style>
    </ErrorBoundary>
  );
}

function App() { return (<DarkModeProvider><LanguageProvider><AppContent /></LanguageProvider></DarkModeProvider>); }
export default App;