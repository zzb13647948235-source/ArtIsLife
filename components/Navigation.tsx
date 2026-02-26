
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, User } from '../types';
import { Menu, Crown, Moon, Sun, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import GlobalSearch from './GlobalSearch';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
  isHidden?: boolean;
  onOpenShop?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, user, onLogout, isHidden = false, onOpenShop }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [expression, setExpression] = useState<'neutral' | 'happy' | 'surprised' | 'wink' | 'sad' | 'sleepy' | 'love' | 'angry'>('neutral');
  const [isBlinking, setIsBlinking] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggle: toggleDark } = useDarkMode();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!logoRef.current) return;
      const r = logoRef.current.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy) / 80, 1) * 1.8;
      setPupil({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const updateScrolled = () => {
      const container = document.getElementById(`page-${currentView}`)?.querySelector('.scroll-container');
      setScrolled(container ? container.scrollTop > 20 : false);
    };
    const container = document.getElementById(`page-${currentView}`)?.querySelector('.scroll-container');
    if (container) {
      container.addEventListener('scroll', updateScrolled, { passive: true });
      updateScrolled();
      return () => container.removeEventListener('scroll', updateScrolled);
    }
  }, [currentView]);

  // Close lang menu on outside click
  useEffect(() => {
    if (!langMenuOpen) return;
    const handler = () => setLangMenuOpen(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [langMenuOpen]);

  // Blinking — single or double blink randomly
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const doBlink = (cb: () => void) => {
      setIsBlinking(true);
      const t = setTimeout(() => { setIsBlinking(false); cb(); }, 130);
      timers.push(t);
    };
    const scheduleBlink = () => {
      const t = setTimeout(() => {
        const isDouble = Math.random() < 0.3;
        doBlink(() => {
          if (isDouble) {
            const t2 = setTimeout(() => doBlink(scheduleBlink), 180);
            timers.push(t2);
          } else {
            scheduleBlink();
          }
        });
      }, 2000 + Math.random() * 4000);
      timers.push(t);
    };
    scheduleBlink();
    return () => timers.forEach(clearTimeout);
  }, []);

  // Expression cycling + hover reaction
  useEffect(() => {
    if (logoHovered) {
      setExpression('surprised');
      const t = setTimeout(() => setExpression('happy'), 350);
      return () => { clearTimeout(t); setExpression('neutral'); };
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const exprs = ['neutral', 'neutral', 'neutral', 'happy', 'surprised', 'wink', 'sad', 'sleepy', 'love', 'angry'] as const;
    const scheduleNext = () => {
      const t = setTimeout(() => {
        const next = exprs[Math.floor(Math.random() * exprs.length)];
        setExpression(next);
        const t2 = setTimeout(() => { setExpression('neutral'); scheduleNext(); }, 1500 + Math.random() * 2000);
        timers.push(t2);
      }, 4000 + Math.random() * 6000);
      timers.push(t);
    };
    scheduleNext();
    return () => timers.forEach(clearTimeout);
  }, [logoHovered]);

  const navItems = [
    { id: 'home',       label: t('nav.home') },
    { id: 'journal',    label: t('nav.journal') },
    { id: 'styles',     label: t('nav.styles') },
    { id: 'gallery',    label: t('nav.gallery') },
    { id: 'chat',       label: t('nav.chat') },
    { id: 'map',        label: t('nav.map') },
    { id: 'community',  label: '社区', icon: <Users size={12} className="text-art-primary" /> },
    { id: 'game',       label: t('nav.game') },
    { id: 'market',     label: t('nav.market') },
    { id: 'membership', label: 'VIP', icon: <Crown size={12} className="text-art-gold" /> },
  ];

  const isDarkMode = currentView === 'market' && !scrolled;
  const baseTextColor = isDarkMode ? 'text-white' : 'text-stone-900';
  const inactiveClass = isDarkMode
    ? 'text-white/70 hover:text-white'
    : 'text-stone-500 hover:text-black font-bold';
  const activeClass = isDarkMode ? 'text-white' : 'text-black';

  if (currentView === 'login') return null;

  return (
    <>
      <nav
        aria-label="主导航"
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-[800ms] cubic-bezier(0.34, 1.56, 0.64, 1) will-change-transform
        ${isHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
        ${scrolled
            ? 'py-4 bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200'
            : 'py-8 bg-transparent translate-y-2'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between relative">
          {/* Brand */}
          <div onClick={() => onNavigate('home')} role="link" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onNavigate('home')}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            aria-label="ArtIsLife 首页"
            className="cursor-pointer relative z-[110] group flex items-center gap-3 select-none">
            <div ref={logoRef} className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center">
              {(() => {
                const ec = isDarkMode && !scrolled ? '#000' : '#F9F8F6';
                const lx = 13 + pupil.x, ly = 14 + pupil.y;
                const rx2 = 27 + pupil.x, ry2 = 14 + pupil.y;

                const leftEye = () => {
                  if (isBlinking || expression === 'wink' || expression === 'sleepy')
                    return <ellipse cx={lx} cy={ly} rx="2.8" ry="0.45" fill={ec} />;
                  if (expression === 'happy' || expression === 'love')
                    return <path d={`M${lx-2.8} ${ly+1.2} Q${lx} ${ly-2.2} ${lx+2.8} ${ly+1.2}`} stroke={ec} strokeWidth="1.8" fill="none" strokeLinecap="round" />;
                  if (expression === 'surprised')
                    return <circle cx={lx} cy={ly} r="3.5" fill={ec} />;
                  if (expression === 'sad')
                    return <path d={`M${lx-2.5} ${ly-1} Q${lx} ${ly+1.5} ${lx+2.5} ${ly-1}`} stroke={ec} strokeWidth="1.8" fill="none" strokeLinecap="round" />;
                  if (expression === 'angry')
                    return <><ellipse cx={lx} cy={ly} rx="2.8" ry="2" fill={ec} /><line x1={lx-3} y1={ly-3.5} x2={lx+2} y2={ly-1.5} stroke={ec} strokeWidth="1.5" strokeLinecap="round" /></>;
                  return <circle cx={lx} cy={ly} r="2.8" fill={ec} />;
                };

                const rightEye = () => {
                  if (isBlinking || expression === 'sleepy')
                    return <ellipse cx={rx2} cy={ry2} rx="2.8" ry="0.45" fill={ec} />;
                  if (expression === 'happy' || expression === 'love')
                    return <path d={`M${rx2-2.8} ${ry2+1.2} Q${rx2} ${ry2-2.2} ${rx2+2.8} ${ry2+1.2}`} stroke={ec} strokeWidth="1.8" fill="none" strokeLinecap="round" />;
                  if (expression === 'surprised')
                    return <circle cx={rx2} cy={ry2} r="3.5" fill={ec} />;
                  if (expression === 'sad')
                    return <path d={`M${rx2-2.5} ${ry2-1} Q${rx2} ${ry2+1.5} ${rx2+2.5} ${ry2-1}`} stroke={ec} strokeWidth="1.8" fill="none" strokeLinecap="round" />;
                  if (expression === 'angry')
                    return <><ellipse cx={rx2} cy={ry2} rx="2.8" ry="2" fill={ec} /><line x1={rx2-2} y1={ry2-1.5} x2={rx2+3} y2={ry2-3.5} stroke={ec} strokeWidth="1.5" strokeLinecap="round" /></>;
                  if (expression === 'wink')
                    return <circle cx={rx2} cy={ry2} r="2.8" fill={ec} />;
                  return <circle cx={rx2} cy={ry2} r="2.8" fill={ec} />;
                };

                const mouth = () => {
                  if (expression === 'happy')
                    return <path d="M14 26 Q20 32 26 26" stroke={ec} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
                  if (expression === 'surprised')
                    return <circle cx="20" cy="27" r="6.5" fill="none" stroke={ec} strokeWidth="2.5" />;
                  if (expression === 'wink')
                    return <path d="M15 27.5 Q20 30.5 25 27.5" stroke={ec} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
                  if (expression === 'sad')
                    return <path d="M14 30 Q20 25 26 30" stroke={ec} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
                  if (expression === 'sleepy')
                    return <path d="M16 28 Q20 27 24 28" stroke={ec} strokeWidth="2" fill="none" strokeLinecap="round" />;
                  if (expression === 'love')
                    return <path d="M13 26 Q20 34 27 26" stroke={ec} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
                  if (expression === 'angry')
                    return <path d="M14 30 Q20 26 26 30" stroke={ec} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
                  return <circle cx="20" cy="27" r="5" fill="none" stroke={ec} strokeWidth="2.5" />;
                };

                return (
                  <svg viewBox="0 0 40 40" aria-hidden="true" className={`w-full h-full transition-colors duration-500 ${isDarkMode && !scrolled ? 'text-white' : 'text-black'}`}>
                    <rect x="2" y="2" width="36" height="36" rx="5" fill="currentColor" />
                    {/* love hearts */}
                    {expression === 'love' && (
                      <>
                        <text x="5" y="10" fontSize="5" fill="#f87171" style={{ userSelect: 'none' }}>♥</text>
                        <text x="29" y="10" fontSize="5" fill="#f87171" style={{ userSelect: 'none' }}>♥</text>
                      </>
                    )}
                    {/* sleepy zzz */}
                    {expression === 'sleepy' && (
                      <text x="27" y="9" fontSize="4.5" fill={ec} opacity="0.7" style={{ userSelect: 'none' }}>z</text>
                    )}
                    {leftEye()}
                    {rightEye()}
                    {mouth()}
                  </svg>
                );
              })()}
            </div>
            <span className={`font-serif text-xl font-bold tracking-tight ${isDarkMode && !scrolled ? 'text-white' : 'text-black'}`}>
              ArtIsLife
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6" role="list">
            {navItems.map((item) => (
              <button
                key={item.id}
                role="listitem"
                onClick={() => onNavigate(item.id as ViewState)}
                aria-current={currentView === item.id ? 'page' : undefined}
                className={`relative text-xs font-extrabold uppercase tracking-[0.12em] transition-all duration-300 group flex flex-col items-center gap-1.5
                  ${currentView === item.id ? activeClass : inactiveClass}`}
              >
                <span className="flex items-center gap-2">{item.icon}{item.label}</span>
                <span aria-hidden="true" className={`h-[1.5px] bg-current rounded-full transition-all duration-300 ease-out ${currentView === item.id ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-40'}`} />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button onClick={toggleDark}
              aria-label={isDark ? '切换亮色模式' : '切换暗色模式'}
              className={`p-2 rounded-full transition-all hover:bg-stone-100 dark:hover:bg-white/10 ${baseTextColor}`}>
              {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </button>

            <GlobalSearch onNavigate={onNavigate} />

            {/* Language Switcher */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label={`当前语言：${language.toUpperCase()}，点击切换`}
                aria-haspopup="listbox"
                aria-expanded={langMenuOpen}
                className={`text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity ${baseTextColor}`}>
                {language.toUpperCase()}
              </button>
              <ul role="listbox" aria-label="选择语言"
                className={`absolute top-full right-0 mt-4 w-24 bg-white rounded-2xl shadow-lg border border-stone-100 py-2 transition-all duration-300 origin-top-right z-[110]
                  ${langMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {(['zh', 'en', 'ja', 'fr', 'es'] as const).map((l) => (
                  <li key={l} role="option" aria-selected={language === l}>
                    <button
                      onClick={() => { setLanguage(l); setLangMenuOpen(false); }}
                      className={`w-full text-right px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors
                        ${language === l ? 'text-art-primary' : 'text-stone-900'}`}>
                      {l.toUpperCase()}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* User / Login */}
            {user ? (
              <button onClick={onLogout} aria-label={`${user.name}，点击登出`} className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-stone-300 overflow-hidden ring-2 ring-transparent group-hover:ring-art-primary/50 transition-all">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    : <div aria-hidden="true" className="w-full h-full flex items-center justify-center text-stone-700 font-serif italic text-sm">{user.name[0]}</div>
                  }
                </div>
              </button>
            ) : (
              <button onClick={() => onNavigate('login')}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] border-b border-transparent hover:border-current pb-0.5 transition-all ${baseTextColor}`}>
                {t('nav.login')}
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className={`lg:hidden relative z-[110] p-2 transition-colors ${baseTextColor}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu">
            <Menu size={24} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <div id="mobile-menu"
        className={`lg:hidden fixed inset-0 z-[200] transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        aria-hidden={!mobileMenuOpen}>
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl" onClick={() => setMobileMenuOpen(false)} />
        <div className={`absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col pt-24 pb-12 px-8 transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
          <button className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900"
            onClick={() => setMobileMenuOpen(false)} aria-label="关闭菜单">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <nav aria-label="移动端导航" className="flex flex-col gap-1 flex-1">
            {navItems.map((item, i) => (
              <button key={item.id}
                onClick={() => { onNavigate(item.id as ViewState); setMobileMenuOpen(false); }}
                aria-current={currentView === item.id ? 'page' : undefined}
                className={`flex items-center gap-3 py-4 text-left border-b border-stone-100 transition-all duration-300 ${currentView === item.id ? 'text-black font-extrabold' : 'text-stone-400 font-bold'}`}
                style={{ animationDelay: `${i * 40}ms` }}>
                {item.icon}
                <span className="text-sm uppercase tracking-[0.25em]">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-3" role="group" aria-label="语言选择">
              {(['zh', 'en', 'ja', 'fr', 'es'] as const).map(l => (
                <button key={l} onClick={() => setLanguage(l)} aria-label={`切换到 ${l.toUpperCase()}`}
                  aria-pressed={language === l}
                  className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${language === l ? 'text-art-primary' : 'text-stone-300 hover:text-stone-600'}`}>
                  {l}
                </button>
              ))}
            </div>
            {user ? (
              <button onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-red-500 transition-colors">
                登出
              </button>
            ) : (
              <button onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                className="text-[10px] font-bold uppercase tracking-widest text-art-primary">
                {t('nav.login')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
