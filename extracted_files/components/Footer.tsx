
import React from 'react';
import { ViewState } from '../types';
import { ArrowRight, Instagram, Twitter, Facebook, ArrowUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  onNavigate: (view: ViewState) => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal }) => {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-[#0a0a0a] text-white pt-32 pb-12 border-t border-white/5 relative overflow-hidden">
      {/* Subtle Grain Texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24 mb-24">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-8">
             <div className="flex items-center gap-4 group cursor-pointer w-fit" onClick={() => onNavigate('home')}>
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center rounded-lg group-hover:bg-art-primary group-hover:text-white transition-all duration-500 shadow-2xl">
                    <span className="font-serif italic text-2xl font-bold">A</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-serif text-3xl font-bold tracking-tight leading-none group-hover:text-stone-300 transition-colors">ArtIsLife.</span>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-stone-500 group-hover:text-art-primary transition-colors mt-1">Digital Museum</span>
                </div>
             </div>
             <p className="text-stone-400 text-sm leading-loose max-w-sm font-light border-l border-white/10 pl-6">
               {t('footer.tagline')}
             </p>
             <div className="flex gap-4 pt-4">
                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-1 group">
                        <Icon size={16} className="group-hover:scale-110 transition-transform"/>
                    </a>
                ))}
             </div>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-2 md:col-start-6">
             <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-8 flex items-center gap-3">
                 <span className="w-1 h-1 bg-art-primary rounded-full"></span> {t('footer.explore')}
             </h4>
             <ul className="space-y-5 text-sm font-medium text-stone-300">
                {['home', 'styles', 'gallery', 'map'].map((key) => (
                    <li key={key}>
                        <button onClick={() => onNavigate(key as ViewState)} className="hover:text-white hover:translate-x-2 transition-all cursor-pointer text-left w-full flex items-center gap-2 group">
                            <span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300 h-px bg-art-primary"></span>
                            {t(`nav.${key}`)}
                        </button>
                    </li>
                ))}
             </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-2">
             <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-8 flex items-center gap-3">
                <span className="w-1 h-1 bg-art-primary rounded-full"></span> {t('footer.about')}
             </h4>
             <ul className="space-y-5 text-sm font-medium text-stone-300">
                <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors text-left">{t('footer.about_us')}</button></li>
                <li><button onClick={() => onNavigate('membership')} className="hover:text-[#d4af37] transition-colors text-left">{t('footer.membership')}</button></li>
                <li><button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors text-left">{t('footer.privacy')}</button></li>
                <li><button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors text-left">{t('footer.terms')}</button></li>
             </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4">
             <h4 className="font-bold text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-8 flex items-center gap-3">
                <span className="w-1 h-1 bg-art-primary rounded-full"></span> {t('footer.newsletter')}
             </h4>
             <p className="text-stone-400 text-sm mb-8 leading-relaxed font-light">{t('footer.newsletter_desc')}</p>
             <div className="relative group">
                <input 
                    type="email" 
                    placeholder={t('footer.email_placeholder')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-sm outline-none focus:border-art-primary/50 focus:bg-white/10 transition-all text-white placeholder:text-stone-600"
                />
                <button className="absolute right-2 top-2 bottom-2 w-10 bg-white text-black rounded-lg flex items-center justify-center hover:bg-art-primary hover:text-white transition-all shadow-lg cursor-pointer">
                    <ArrowRight size={16} />
                </button>
             </div>
             <p className="text-[9px] text-stone-600 mt-4 font-mono tracking-wide">Secure subscription via ArtIsLife Protocol.</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-stone-600">
           <p className="flex items-center gap-2">
               © {new Date().getFullYear()} ArtIsLife Inc. 
               <span className="w-1 h-1 bg-stone-700 rounded-full mx-2"></span>
               All rights reserved.
           </p>
           <div className="flex items-center gap-8">
              <span className="hover:text-stone-400 transition-colors cursor-default">{t('footer.made_with')}</span>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors group cursor-pointer"
              >
                  Back to Top <ArrowUp size={12} className="group-hover:-translate-y-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
