
import React, { useState, useEffect } from 'react';
import { ViewState, User } from '../types';
import { Menu, Crown, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
  isHidden?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, user, onLogout, isHidden = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'journal', label: t('nav.journal') }, 
    { id: 'styles', label: t('nav.styles') },
    { id: 'gallery', label: t('nav.gallery') },
    { id: 'chat', label: t('nav.chat') },
    { id: 'game', label: t('nav.game') }, 
    { id: 'map', label: t('nav.map') },
    { id: 'market', label: t('nav.market') },
    { id: 'membership', label: 'VIP', icon: <Crown size={12} className="mb-0.5 text-art-gold" /> },
  ];

  // Determine text color based on view/scroll state for maximum contrast
  const isDarkMode = currentView === 'market' && !scrolled;
  
  // FIXED: Significantly darkened the text colors for better visibility
  const baseTextColor = isDarkMode ? 'text-white' : 'text-stone-900'; 
  
  // FIXED: Increased contrast for inactive items. 
  const inactiveClass = isDarkMode 
    ? 'text-white/70 hover:text-white' 
    : 'text-stone-500 hover:text-black font-bold'; 

  const activeClass = isDarkMode 
    ? 'text-white' 
    : 'text-black';

  if (currentView === 'login') return null;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-[800ms] cubic-bezier(0.34, 1.56, 0.64, 1) will-change-transform
        ${isHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'} 
        ${scrolled 
            ? 'py-4 bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200' 
            : 'py-8 bg-transparent translate-y-2' // Slight offset when at top for "settling in" feel
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between relative">
            {/* Brand Logo - Minimalist Type */}
            <div onClick={() => onNavigate('home')} className="cursor-pointer relative z-[110] group flex items-center gap-3 select-none">
                <div className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center">
                    <svg viewBox="0 0 40 40" className={`w-full h-full transition-colors duration-500 ${isDarkMode && !scrolled ? 'text-white' : 'text-black'}`}>
                        <rect x="5" y="5" width="30" height="30" fill="currentColor" />
                        <circle cx="20" cy="20" r="8" fill={isDarkMode && !scrolled ? '#000' : '#F9F8F6'} />
                    </svg>
                </div>
                <span className={`font-serif text-xl font-bold tracking-tight ${isDarkMode && !scrolled ? 'text-white' : 'text-black'}`}>
                    ArtIsLife
                </span>
            </div>

            {/* Desktop Menu - Pure Text, No Pills */}
            <div className="hidden xl:flex items-center gap-10">
                {navItems.map((item) => (
                    <button 
                        key={item.id} 
                        onClick={() => onNavigate(item.id as ViewState)} 
                        className={`
                            relative text-xs font-extrabold uppercase tracking-[0.2em] transition-all duration-300 group flex items-center gap-2
                            ${currentView === item.id ? activeClass : inactiveClass}
                        `}
                    >
                        {item.icon}
                        {item.label}
                        {/* Underline indicator */}
                        <span className={`absolute -bottom-2 left-0 w-full h-[2px] bg-current transform scale-x-0 transition-transform duration-300 ${currentView === item.id ? 'scale-x-100' : 'group-hover:scale-x-50'}`}></span>
                    </button>
                ))}
            </div>

            {/* Actions Area */}
            <div className="hidden md:flex items-center gap-8">
                 
                 {/* Language Switcher - Text Only */}
                 <div className="relative group">
                    <button 
                        onClick={() => setLangMenuOpen(!langMenuOpen)} 
                        className={`text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity ${baseTextColor}`}
                    >
                        {language.toUpperCase()}
                    </button>
                    
                    <div className={`absolute top-full right-0 mt-4 w-24 bg-white rounded-none shadow-lg border border-stone-200 py-2 transition-all duration-300 origin-top-right z-[110]
                        ${langMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                        {['zh', 'en', 'ja', 'fr', 'es'].map((l) => (
                            <button 
                                key={l} 
                                onClick={() => { setLanguage(l as any); setLangMenuOpen(false); }} 
                                className={`w-full text-right px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors
                                    ${language === l ? 'text-art-primary' : 'text-stone-900'}`}
                            >
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>
                 </div>
                 
                 {/* User Login - Clean Text Button */}
                 {user ? (
                    <button onClick={onLogout} className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-stone-300 overflow-hidden ring-2 ring-transparent group-hover:ring-art-primary/50 transition-all">
                             {user.avatar ? (
                                 <img src={user.avatar} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-stone-700 font-serif italic text-sm">{user.name[0]}</div>
                             )}
                        </div>
                    </button>
                 ) : (
                    <button 
                        onClick={() => onNavigate('login')} 
                        className={`text-[10px] font-bold uppercase tracking-[0.2em] border-b border-transparent hover:border-current pb-0.5 transition-all ${baseTextColor}`}
                    >
                        {t('nav.login')}
                    </button>
                 )}
            </div>

            {/* Mobile Toggle */}
            <button 
                className={`xl:hidden relative z-[110] p-2 transition-colors ${baseTextColor}`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <Menu size={24} strokeWidth={1.5} />
            </button>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
