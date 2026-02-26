import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { findMuseums } from '../services/geminiService';
import { GroundingLink, GeoLocation, ViewState } from '../types';
import { SUGGESTED_LOCATIONS } from '../constants';
import { MapPin, Navigation, Search, Loader2, ArrowUpRight, Compass, Map, Globe, Building2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Footer from './Footer';

interface MuseumFinderProps {
    onNavigate: (view: ViewState) => void;
    onOpenLegal: (type: 'privacy' | 'terms') => void;
}

const AppleText: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className = "", delay = 0 }) => (
  <span className={`inline-block ${className}`} aria-label={text}>
    {text.split('').map((char, i) => (
      <span
        key={i}
        className="inline-block opacity-0 animate-apple-reveal"
        style={{ animationDelay: `${delay + i * 0.04}s`, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))}
  </span>
);

const MuseumFinder: React.FC<MuseumFinderProps> = ({ onNavigate, onOpenLegal }) => {
  const [query, setQuery] = useState('');
  const [resultText, setResultText] = useState('');
  const [links, setLinks] = useState<GroundingLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<GeoLocation | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        console.warn("Location error", err);
        setLocating(false);
      }
    );
  };

  const handleSearch = async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setHasSearched(true);
    setResultText('');
    setLinks([]);
    try {
      const locParam = location ? { lat: location.latitude, lng: location.longitude } : undefined;
      const response = await findMuseums(text, locParam);
      setResultText(response.text);
      setLinks(response.links);
    } catch (error) {
      setResultText("Could not find location info.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative flex flex-col overflow-x-hidden w-full">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stone-200/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none overflow-hidden"></div>

      <div className="flex-1 w-full pt-20 md:pt-24 min-h-screen">
          <div className={`max-w-[1400px] mx-auto px-4 md:px-12 pb-20 transition-all duration-700 ease-luxury ${hasSearched ? 'translate-y-0' : 'translate-y-[5vh]'}`}>

             {/* Header & Search Section */}
             <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
                <div className="flex items-center justify-center gap-2 mb-4 md:mb-6 animate-fade-in">
                   <Compass className="text-art-primary animate-spin-slow" size={18} />
                   <span className="text-xs font-bold uppercase tracking-[0.3em] text-art-primary">{t('map.header_sub')}</span>
                </div>

                <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl text-art-accent mb-6 md:mb-8 leading-tight">
                   <AppleText text={`${t('map.title_1')} ${t('map.title_2')}`} delay={0.2} /> <br/>
                   <span className="italic text-stone-400 animate-fade-in-up delay-500 block">{t('map.subtitle')}</span>
                </h2>

                <div className="relative group max-w-2xl mx-auto animate-fade-in-up delay-700">
                   <div className="absolute inset-0 bg-art-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   <div className="relative bg-white/90 backdrop-blur-md rounded-full shadow-2xl shadow-stone-200/50 flex items-center p-1.5 md:p-2 border border-stone-100 group-focus-within:border-art-primary/50 transition-colors">
                      <div className="pl-4 md:pl-6 text-stone-400">
                         <Search size={20} />
                      </div>
                      <input
                         type="text"
                         value={query}
                         onChange={(e) => setQuery(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                         placeholder={t('map.placeholder')}
                         className="flex-1 bg-transparent border-none outline-none px-3 md:px-4 py-3 md:py-4 text-base md:text-lg font-serif placeholder:font-sans placeholder:text-stone-300 text-stone-800"
                      />
                      <button
                         onClick={() => handleSearch(query)}
                         disabled={loading}
                         className="p-3 md:p-4 bg-art-accent text-white rounded-full hover:bg-art-primary transition-all disabled:opacity-50 active:scale-95 shadow-lg"
                      >
                         {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowUpRight size={20} />}
                      </button>
                   </div>
                </div>

                {/* Quick Suggestions */}
                {!hasSearched && (
                   <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-2 md:gap-3 opacity-60 animate-fade-in delay-1000">
                      {SUGGESTED_LOCATIONS.slice(0, 3).map((loc, idx) => (
                         <button
                            key={idx}
                            onClick={() => { setQuery(loc); handleSearch(loc); }}
                            className="text-xs px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-stone-300 hover:bg-stone-100 transition-colors active:scale-95"
                         >
                            {loc}
                         </button>
                      ))}
                   </div>
                )}
             </div>

             {/* Results Section */}
             {hasSearched && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 animate-fade-in-up">

                   {/* Sidebar Info */}
                   <div className="lg:col-span-4 space-y-4 md:space-y-6">
                      <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">{t('map.location_label')}</p>
                            <p className="font-mono text-xs md:text-sm text-stone-600">
                               {location ? `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E` : t('map.not_detected')}
                            </p>
                         </div>
                         <button onClick={handleGetLocation} className={`p-2.5 md:p-3 bg-stone-50 rounded-full text-stone-500 hover:text-art-primary hover:bg-stone-100 transition-colors active:scale-90 ${locating ? 'animate-pulse' : ''}`}>
                            <Navigation size={16} />
                         </button>
                      </div>

                      <div className="bg-[#1a1a1a] text-white p-6 md:p-8 rounded-2xl relative overflow-hidden">
                         <Globe className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32" />
                         <h3 className="font-serif text-xl md:text-2xl mb-3 md:mb-4 relative z-10">{t('map.capitals_label')}</h3>
                         <div className="space-y-2 md:space-y-3 relative z-10">
                            {SUGGESTED_LOCATIONS.map((loc, idx) => (
                               <button
                                  key={idx}
                                  onClick={() => { setQuery(loc); handleSearch(loc); }}
                                  className="block w-full text-left text-sm text-stone-400 hover:text-white hover:pl-2 transition-all border-b border-white/10 pb-2 last:border-0 active:scale-[0.98]"
                               >
                                  {loc}
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Main Results */}
                   <div className="lg:col-span-8 min-h-[300px] md:min-h-[400px]">
                      {resultText ? (
                         <div className="space-y-6 md:space-y-8">
                            <div className="bg-white/90 backdrop-blur-md p-6 md:p-12 rounded-2xl md:rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 relative">
                               <div className="prose prose-sm md:prose-lg prose-stone max-w-none font-serif leading-loose">
                                  <ReactMarkdown>{resultText}</ReactMarkdown>
                               </div>
                            </div>

                            {links.length > 0 && (
                               <div>
                                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
                                     <Building2 size={14} /> {t('map.results_label')}
                                  </h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                     {links.map((link, idx) => (
                                        <a
                                           key={idx}
                                           href={link.url}
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           className="group bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-stone-100 hover:border-art-primary/30 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 flex flex-col justify-between min-h-[120px] md:h-40"
                                        >
                                           <div className="flex justify-between items-start">
                                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-50 group-hover:bg-art-primary group-hover:text-white flex items-center justify-center transition-colors">
                                                 <MapPin size={15} />
                                              </div>
                                              <ArrowUpRight size={16} className="text-stone-300 group-hover:text-art-primary transition-all" />
                                           </div>
                                           <div>
                                              <h4 className="font-bold text-stone-800 group-hover:text-art-primary transition-colors line-clamp-1 text-sm md:text-base">{link.title}</h4>
                                              <p className="text-xs text-stone-400 mt-1 truncate font-mono">{new URL(link.url).hostname}</p>
                                           </div>
                                        </a>
                                     ))}
                                  </div>
                               </div>
                            )}
                         </div>
                      ) : (
                         <div className="h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-3xl bg-white/30 backdrop-blur-sm">
                            <Map size={40} className="text-stone-300 mb-4 opacity-50" />
                            <p className="text-stone-400 font-serif text-sm">{t('map.no_results')}</p>
                         </div>
                      )}
                   </div>
                </div>
             )}
          </div>
      </div>
      
      {/* Footer naturally at the end of the scroll container */}
      <Footer onNavigate={onNavigate} onOpenLegal={onOpenLegal} />
    </div>
  );
};

export default MuseumFinder;