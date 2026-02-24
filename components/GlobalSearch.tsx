import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { MASTERPIECE_COLLECTION, ART_STYLES, GAME_LEVELS } from '../constants';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchResult {
  type: 'artwork' | 'style' | 'game';
  title: string;
  subtitle: string;
  imageUrl?: string;
  view: ViewState;
}

interface GlobalSearchProps {
  onNavigate: (view: ViewState) => void;
}

const buildIndex = (): SearchResult[] => {
  const results: SearchResult[] = [];

  MASTERPIECE_COLLECTION.forEach(art => {
    results.push({
      type: 'artwork',
      title: art.title,
      subtitle: art.artist + (art.year !== 'unknown' ? ` · ${art.year}` : ''),
      imageUrl: art.url,
      view: 'styles',
    });
  });

  ART_STYLES.forEach(style => {
    results.push({
      type: 'style',
      title: style.name,
      subtitle: style.enName + ' · ' + style.period,
      view: 'styles',
    });
  });

  GAME_LEVELS.slice(0, 20).forEach(level => {
    results.push({
      type: 'game',
      title: level.title,
      subtitle: level.artist + ' · 修复挑战',
      imageUrl: level.imageUrl,
      view: 'game',
    });
  });

  return results;
};

const INDEX = buildIndex();

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    const lower = q.toLowerCase();
    const matched = INDEX.filter(r =>
      r.title.toLowerCase().includes(lower) ||
      r.subtitle.toLowerCase().includes(lower)
    ).slice(0, 8);
    setResults(matched);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(''); setResults([]); }
  }, [open]);

  const handleSelect = (r: SearchResult) => {
    onNavigate(r.view);
    setOpen(false);
  };

  const typeLabel = { artwork: t('search.type_artwork'), style: t('search.type_style'), game: t('search.type_game') };
  const typeColor = { artwork: 'text-art-primary', style: 'text-indigo-500', game: 'text-emerald-500' };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200 dark:border-white/10 text-stone-400 hover:text-stone-700 dark:hover:text-white hover:border-stone-300 transition-all text-xs bg-white/50 dark:bg-white/5 backdrop-blur-sm"
      >
        <Search size={12} />
        <span className="hidden sm:inline">{t('search.trigger')}</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[500] flex items-start justify-center pt-[15vh] px-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-[24px] shadow-2xl border border-stone-200 dark:border-white/10 overflow-hidden animate-scale-in"
            onClick={e => e.stopPropagation()}>

            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100 dark:border-white/10">
              <Search size={18} className="text-stone-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="flex-1 bg-transparent text-stone-900 dark:text-white placeholder-stone-400 outline-none text-base"
              />
              {query && <button onClick={() => setQuery('')}><X size={16} className="text-stone-400 hover:text-stone-700" /></button>}
            </div>

            {/* Results */}
            {results.length > 0 ? (
              <ul className="max-h-80 overflow-y-auto py-2">
                {results.map((r, i) => (
                  <li key={i}>
                    <button onClick={() => handleSelect(r)}
                      className="w-full flex items-center gap-4 px-5 py-3 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors text-left group">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt={r.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-white/10 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 dark:text-white truncate">{r.title}</p>
                        <p className="text-xs text-stone-400 truncate">{r.subtitle}</p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest shrink-0 ${typeColor[r.type]}`}>{typeLabel[r.type]}</span>
                      <ArrowRight size={14} className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : query ? (
              <div className="py-12 text-center text-stone-400 text-sm">{t('search.no_results')}</div>
            ) : (
              <div className="py-8 text-center text-stone-400 text-xs">{t('search.empty_hint')}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
