
import React from 'react';
import { ViewState } from '../types';
import { ArrowRight, Instagram, Twitter, Facebook, ArrowUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  onNavigate: (viewState: ViewState) => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenLegal }) => {
  const { t } = useLanguage();

  const footerStyle: React.CSSProperties = {
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    paddingTop: '128px',
    paddingBottom: '48px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  };

  const grainStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    opacity: 0.03,
    backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
    pointerEvents: 'none',
  };

  return (
    <footer style={footerStyle}>
      <div style={grainStyle}></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '40px', marginBottom: '96px' }}>

          {/* Brand Column */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '32px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', width: 'fit-content' }} onClick={() => onNavigate('home')}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#ffffff', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                    <span style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '24px', fontWeight: 'bold' }}>A</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: 'serif', fontSize: '30px', fontWeight: 'bold', letterSpacing: '-0.02em', lineHeight: 1 }}>ArtIsLife.</span>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4em', color: '#78716c', marginTop: '4px' }}>Digital Museum</span>
                </div>
             </div>
             <p style={{ color: '#a8a29e', fontSize: '14px', lineHeight: 1.75, maxWidth: '24rem', fontWeight: 300, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
               {t('footer.tagline')}
             </p>
             <div style={{ display: 'flex', gap: '16px', paddingTop: '16px' }}>
                {[
                  { Icon: Instagram, href: 'https://www.instagram.com/artislife.official', label: 'Instagram' },
                  { Icon: Twitter,   href: 'https://x.com/ArtIsLife_AI',                  label: 'Twitter / X' },
                  { Icon: Facebook,  href: 'https://www.facebook.com/artislife.official',  label: 'Facebook' },
                ].map(({ Icon, href, label }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                      style={{ width: '40px', height: '40px', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textDecoration: 'none' }}>
                        <Icon size={16} />
                    </a>
                ))}
             </div>
          </div>

          {/* Links Column 1 */}
          <div style={{ gridColumn: 'span 2' }}>
             <h4 style={{ fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#78716c', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <span style={{ width: '4px', height: '4px', backgroundColor: '#BC4B1A', borderRadius: '9999px' }}></span> {t('footer.explore')}
             </h4>
             <ul style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px', fontWeight: 500, color: '#d6d3d1', listStyle: 'none', padding: 0, margin: 0 }}>
                {['home', 'styles', 'gallery', 'map'].map((key) => (
                    <li key={key}>
                        <button onClick={() => onNavigate(key as ViewState)} style={{ color: '#d6d3d1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px', fontWeight: 500 }}>
                            {t(`nav.${key}`)}
                        </button>
                    </li>
                ))}
             </ul>
          </div>

          {/* Links Column 2 */}
          <div style={{ gridColumn: 'span 2' }}>
             <h4 style={{ fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#78716c', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '4px', height: '4px', backgroundColor: '#BC4B1A', borderRadius: '9999px' }}></span> {t('footer.about')}
             </h4>
             <ul style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px', fontWeight: 500, color: '#d6d3d1', listStyle: 'none', padding: 0, margin: 0 }}>
                <li><button onClick={() => onNavigate('about')} style={{ color: '#d6d3d1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px' }}>{t('footer.about_us')}</button></li>
                <li><button onClick={() => onNavigate('membership')} style={{ color: '#d6d3d1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px' }}>{t('footer.membership')}</button></li>
                <li><button onClick={() => onOpenLegal('privacy')} style={{ color: '#d6d3d1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px' }}>{t('footer.privacy')}</button></li>
                <li><button onClick={() => onOpenLegal('terms')} style={{ color: '#d6d3d1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px' }}>{t('footer.terms')}</button></li>
             </ul>
          </div>

          {/* Newsletter */}
          <div style={{ gridColumn: 'span 4' }}>
             <h4 style={{ fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#78716c', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '4px', height: '4px', backgroundColor: '#BC4B1A', borderRadius: '9999px' }}></span> {t('footer.newsletter')}
             </h4>
             <p style={{ color: '#a8a29e', fontSize: '14px', marginBottom: '32px', lineHeight: 1.625, fontWeight: 300 }}>{t('footer.newsletter_desc')}</p>
             <div style={{ position: 'relative' }}>
                <input
                    type="email"
                    placeholder={t('footer.email_placeholder')}
                    style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px 56px 16px 24px', fontSize: '14px', outline: 'none', color: '#ffffff' }}
                />
                <button style={{ position: 'absolute', right: '8px', top: '8px', bottom: '8px', width: '40px', backgroundColor: '#ffffff', color: '#000000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                    <ArrowRight size={16} />
                </button>
             </div>
             <p style={{ fontSize: '9px', color: '#57534e', marginTop: '16px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>Secure subscription via ArtIsLife Protocol.</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#57534e' }}>
           <p style={{ color: '#78716c', fontSize: '11px', textTransform: 'none', letterSpacing: 'normal' }}>本网站所有权归杨福庭所有</p>
           <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
             <p style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                 © {new Date().getFullYear()} ArtIsLife Inc.
                 <span style={{ width: '4px', height: '4px', backgroundColor: '#44403c', borderRadius: '9999px', margin: '0 8px' }}></span>
                 All rights reserved.
             </p>
             <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <span style={{ color: '#57534e' }}>{t('footer.made_with')}</span>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#78716c', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                    Back to Top <ArrowUp size={12} />
                </button>
             </div>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
