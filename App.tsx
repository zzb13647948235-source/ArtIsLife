import React, { useState, useEffect, ErrorInfo, ReactNode, useRef, useCallback } from 'react';
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
import IntroShowcase from './components/IntroShowcase';
import PageTransitionBeam from './components/PageTransitionBeam';
import { LanguageProvider } from './contexts/LanguageContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { ViewState, GeneratedImage, ChatMessage, UserTier, User } from './types';
import { authService } from './services/authService';
import { MessageSquare, AlertTriangle, RefreshCw, X } from 'lucide-react';

const STORAGE_KEY_ART_HISTORY = 'artislife_history';
const NAV_ORDER: ViewState[] = ['intro', 'home', 'journal', 'styles', 'gallery', 'chat', 'game', 'map', 'market', 'community'];

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

const PageSection: React.FC<{
  viewKey: string;
  children: React.ReactNode;
}> = ({ viewKey, children }) => {
  return (
    <div
      id={`page-${viewKey}`}
      style={{
        height: '100vh',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div
        className="w-full h-full scroll-container overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </div>
  );
};

function AppContent() {
  const [appReady, setAppReady] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false); 
  const [currentView, setCurrentView] = useState<ViewState>('intro');
  const [previousView, setPreviousView] = useState<ViewState>('intro');
  
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
  
  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
        const savedHistory = localStorage.getItem(STORAGE_KEY_ART_HISTORY);
        if (savedHistory) setArtHistory(JSON.parse(savedHistory));
    } catch (e) {}
    const unsubscribe = authService.subscribe(newUser => setUser(newUser));
    return () => { unsubscribe(); };
  }, []);

  // IntersectionObserver: track which page is visible and update nav
  useEffect(() => {
    const mainEl = mainScrollRef.current;
    if (!mainEl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const viewKey = entry.target.id.replace('page-', '') as ViewState;
            setCurrentView(prev => (prev === 'intro' ? prev : viewKey));
          }
        });
      },
      { root: mainEl, threshold: 0.5 }
    );
    NAV_ORDER.filter(v => v !== 'intro').forEach(viewKey => {
      const el = document.getElementById(`page-${viewKey}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loadingComplete]);

  const handleNavigate = useCallback((v: ViewState) => {
      if (v === 'login' && user) { v = 'gallery' as ViewState; }
      if (v === 'intro') return;
      // Overlays: just set state, no scroll
      if (v === 'membership' || v === 'about' || v === 'login') {
          setPreviousView(currentView);
          setCurrentView(v);
          setIsFullScreenModalOpen(false);
          return;
      }
      setPreviousView(currentView);
      setCurrentView(v);
      setIsFullScreenModalOpen(false);
      // Scroll to the target page
      requestAnimationFrame(() => {
          const el = document.getElementById(`page-${v}`);
          if (el) el.scrollIntoView({ behavior: currentView === 'intro' ? 'auto' : 'smooth' });
      });
  }, [currentView, user]);

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
              isHidden={currentView === 'about' || currentView === 'login' || currentView === 'intro' || (isImmersiveMode && currentView !== 'membership') || isFullScreenModalOpen}
              onOpenShop={() => setShowShop(true)}
          />
          
      <main
          id="main-content"
          ref={mainScrollRef}
          role="main"
          className={`flex-1 w-full scroll-container overflow-y-scroll transition-all duration-1000 ${showAuthOverlay ? 'scale-[0.95] blur-sm opacity-50' : 'scale-100 opacity-100'}`}
          style={{ scrollSnapType: 'y mandatory', height: '100%' }}
      >
              {NAV_ORDER.filter(v => v !== 'intro').map((viewKey) => (
                  <PageSection key={viewKey} viewKey={viewKey}>
                      {viewKey === 'home' && <Hero onNavigate={handleNavigate} isActive={currentView === 'home'} />}
                      {viewKey === 'journal' && <ArtJournal onNavigate={handleNavigate} isActive={currentView === 'journal'} onArticleOpen={setIsFullScreenModalOpen} />}
                      {viewKey === 'styles' && <ArtStyles onNavigate={handleNavigate} isActive={currentView === 'styles'} />}
                      {viewKey === 'gallery' && <ArtGenerator history={artHistory} onImageGenerated={(img) => { const next = [...artHistory, img]; setArtHistory(next); try { localStorage.setItem(STORAGE_KEY_ART_HISTORY, JSON.stringify(next)); } catch(e){} }} onClearHistory={() => { setArtHistory([]); try { localStorage.removeItem(STORAGE_KEY_ART_HISTORY); } catch(e){} }} prefilledPrompt={prefilledPrompt} setPrefilledPrompt={setPrefilledPrompt} userTier={user?.tier || 'guest'} onNavigateToMembership={() => handleNavigate('membership')} onAuthRequired={() => setShowAuthOverlay(true)} isLoggedIn={!!user} onImageSelect={(image) => {}} />}
                      {viewKey === 'market' && <ArtMarket onNavigate={handleNavigate} isActive={currentView === 'market'} onFullScreenToggle={setIsFullScreenModalOpen} generatedImages={artHistory} />}
                      {viewKey === 'community' && <UGCGallery user={user} onAuthRequired={() => setShowAuthOverlay(true)} onNavigate={handleNavigate} isActive={currentView === 'community'} />}
                      {viewKey === 'chat' && <ArtChat messages={chatMessages} setMessages={setChatMessages} onAuthRequired={() => setShowAuthOverlay(true)} isLoggedIn={!!user} />}
                      {viewKey === 'game' && <ArtGame onImmersiveChange={setIsImmersiveMode} user={user} onAuthRequired={() => setShowAuthOverlay(true)} onNavigate={handleNavigate} />}
                      {viewKey === 'map' && <MuseumFinder onNavigate={handleNavigate} onOpenLegal={(type) => setLegalModalType(type)} />}
                  </PageSection>
              ))}

              {currentView === 'login' && <div className="absolute inset-0 z-[100] animate-fade-in"><Login onLoginSuccess={(u) => { setUser(u); handleNavigate('gallery'); }} onNavigate={handleNavigate} /></div>}
              {currentView === 'membership' && (
                <div className="absolute inset-0 z-[110] animate-fade-in bg-white overflow-y-auto overscroll-contain">
                  <Membership
                    currentTier={user?.tier || 'guest'}
                    onUpgrade={async (t) => {
                      if (!user) { setShowAuthOverlay(true); throw new Error("AUTH_REQUIRED"); }
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

      {/* Intro overlay — shown until user navigates away */}
      {currentView === 'intro' && (
        <div className="absolute inset-0 z-[80] overflow-y-auto scroll-container" style={{ overscrollBehavior: 'contain' }}>
          <IntroShowcase onNavigate={handleNavigate} isActive={true} />
        </div>
      )}
          
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