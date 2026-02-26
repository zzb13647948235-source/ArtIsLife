
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatWithArtExpert } from '../services/geminiService';
import { ChatMessage, GroundingLink, Sticker } from '../types';
import { Send, Bot, User, Quote, ArrowRight, Sparkles, ExternalLink, Search, LogIn, Smile } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AppleText from './AppleText';

// ── Art-themed sticker set ───────────────────────────────────────────────────
const ART_STICKERS: Sticker[] = [
  { id: 's1',  emoji: '🎨', label: '调色盘',   category: 'art' },
  { id: 's2',  emoji: '🖌️', label: '画笔',     category: 'art' },
  { id: 's3',  emoji: '🖼️', label: '名画',     category: 'art' },
  { id: 's4',  emoji: '🎭', label: '戏剧',     category: 'art' },
  { id: 's5',  emoji: '✨', label: '灵感',     category: 'feel' },
  { id: 's6',  emoji: '🌸', label: '花开',     category: 'nature' },
  { id: 's7',  emoji: '🦋', label: '蝴蝶',     category: 'nature' },
  { id: 's8',  emoji: '🌊', label: '波浪',     category: 'nature' },
  { id: 's9',  emoji: '🔥', label: '热情',     category: 'feel' },
  { id: 's10', emoji: '💫', label: '星光',     category: 'feel' },
  { id: 's11', emoji: '🌈', label: '彩虹',     category: 'nature' },
  { id: 's12', emoji: '🦚', label: '孔雀',     category: 'nature' },
  { id: 's13', emoji: '🏛️', label: '博物馆',   category: 'art' },
  { id: 's14', emoji: '🌙', label: '月夜',     category: 'nature' },
  { id: 's15', emoji: '⭐', label: '星辰',     category: 'feel' },
  { id: 's16', emoji: '🎪', label: '艺术节',   category: 'art' },
  { id: 's17', emoji: '🌺', label: '盛开',     category: 'nature' },
  { id: 's18', emoji: '🦁', label: '雄狮',     category: 'nature' },
  { id: 's19', emoji: '🎠', label: '旋转木马', category: 'art' },
  { id: 's20', emoji: '🌿', label: '自然',     category: 'nature' },
];

interface ArtChatProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onAuthRequired: () => void;
  isLoggedIn: boolean;
}

const ArtChat: React.FC<ArtChatProps> = ({ messages, setMessages, onAuthRequired, isLoggedIn }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickerRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([{ id: 'welcome', role: 'model', text: t('chat.welcome_message'), timestamp: Date.now() }]);
    }
  }, [language, t]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // Close sticker panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (stickerRef.current && !stickerRef.current.contains(e.target as Node)) setShowStickers(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSend = async (text: string) => {
    if (!isLoggedIn) { onAuthRequired(); return; }
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await chatWithArtExpert(text, history, t('chat.system_instruction'));
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: response.text, timestamp: Date.now(), groundingLinks: response.links }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: t('common.error'), timestamp: Date.now() }]);
    } finally { setLoading(false); }
  };

  const handleSendSticker = (sticker: Sticker) => {
    if (!isLoggedIn) { onAuthRequired(); return; }
    setShowStickers(false);
    const msg: ChatMessage = { id: Date.now().toString(), role: 'user', text: sticker.emoji, timestamp: Date.now(), sticker };
    setMessages(prev => [...prev, msg]);
  };

  return (
    <div className="pt-20 md:pt-28 pb-12 px-4 md:px-6 h-screen max-w-[1800px] mx-auto flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-24 animate-fade-in">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-80 pt-12 sticky top-28 h-fit space-y-10">
        <div className="space-y-2">
          <h2 className="font-serif text-6xl text-art-accent leading-tight italic">
            <AppleText text="Art" delay={0.1} /> <br/><AppleText text="Curator" delay={0.3} />
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isLoggedIn ? 'bg-green-500' : 'bg-orange-400'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
              {isLoggedIn ? 'Digital Salon Active' : 'Observation Mode'}
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-10 rounded-[32px] shadow-hard border border-stone-50 dark:border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-art-primary transform scale-y-0 group-hover:scale-y-100 transition-transform duration-700 ease-luxury"></div>
          <Quote size={28} className="text-art-primary/10 mb-6" />
          <p className="text-stone-700 dark:text-stone-300 text-base leading-relaxed font-serif italic relative z-10">"{t('chat.quote')}"</p>
        </div>
        {/* Sticker preview */}
        <div className="bg-white dark:bg-stone-900 p-6 rounded-[24px] shadow-hard border border-stone-50 dark:border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-2"><Smile size={12} /> 专属表情</p>
          <div className="grid grid-cols-5 gap-2">
            {ART_STICKERS.slice(0, 10).map(s => (
              <button key={s.id} onClick={() => handleSendSticker(s)} title={s.label}
                className="text-xl hover:scale-125 transition-transform active:scale-95">
                {s.emoji}
              </button>
            ))}
          </div>
        </div>
        {!isLoggedIn && (
          <div className="p-8 bg-art-accent text-white rounded-[32px] shadow-xl relative overflow-hidden">
            <Sparkles className="absolute -bottom-4 -right-4 text-white/10 w-24 h-24 rotate-12" />
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><LogIn size={14} className="text-art-primary" /> 加入深度对话</h4>
            <p className="text-xs text-white/60 leading-relaxed mb-6">只有注册会员才能直接向策展人提问，获取大师级艺术见解。</p>
            <button onClick={onAuthRequired} className="w-full py-3 bg-art-primary rounded-full text-[9px] font-bold uppercase tracking-widest hover:brightness-110 transition-all">立即登录</button>
          </div>
        )}
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white dark:bg-stone-900 shadow-hard rounded-[32px] md:rounded-[48px] flex flex-col overflow-hidden relative border border-stone-50 dark:border-white/10 transition-all duration-700 hover:shadow-2xl">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-16 space-y-8 md:space-y-12 bg-[#FBFAF9] dark:bg-stone-950 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-700">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-6 animate-fade-in-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 hover:rotate-12 ${msg.role === 'model' ? 'bg-art-accent text-white' : 'bg-white text-art-primary border border-stone-100'}`}>
                {msg.role === 'model' ? <Bot size={22} /> : <User size={22} />}
              </div>
              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.sticker
                  ? <div className="text-5xl leading-none py-2 px-1 select-none" title={msg.sticker.label}>{msg.sticker.emoji}</div>
                  : <div className={`relative rounded-[24px] md:rounded-[32px] p-5 md:p-8 shadow-medium text-base md:text-lg font-serif leading-[1.8] tracking-tight
                      ${msg.role === 'user' ? 'bg-stone-800 text-stone-100 rounded-tr-none' : 'bg-white dark:bg-stone-800 border border-stone-50 dark:border-white/10 text-stone-800 dark:text-stone-200 rounded-tl-none'}`}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                }
                {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                  <div className="mt-8 w-full space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 px-4 flex items-center gap-3">
                      <Search size={12} className="text-art-primary" /> {t('chat.sources')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {msg.groundingLinks.map((link, lIdx) => (
                        <a key={lIdx} href={link.url} target="_blank" rel="noopener noreferrer"
                          className="group flex flex-col justify-between p-6 bg-white border border-stone-100 rounded-[24px] hover:border-art-primary/30 hover:shadow-hard hover:-translate-y-2 transition-all duration-500 h-32">
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-stone-50 rounded-xl group-hover:bg-art-primary/5 transition-colors">
                              <ExternalLink size={16} className="text-stone-400 group-hover:text-art-primary" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300 group-hover:text-art-primary/40">{link.source || 'Web'}</span>
                          </div>
                          <h5 className="font-serif text-sm text-stone-800 line-clamp-1 leading-snug group-hover:text-art-primary transition-colors">{link.title}</h5>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-6 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-art-accent text-white flex items-center justify-center shadow-lg"><Bot size={22} /></div>
              <div className="bg-white border border-stone-50 shadow-medium rounded-[32px] rounded-tl-none p-6 flex items-center gap-3">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Typing</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-art-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-art-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-art-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-10 lg:p-14 bg-white dark:bg-stone-900 border-t border-stone-50 dark:border-white/10 relative group">
          <div className="relative group/input">
            {!isLoggedIn && <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] z-20 cursor-pointer rounded-full" onClick={onAuthRequired}></div>}
            <div className="absolute -inset-1 bg-gradient-to-r from-art-primary/10 to-transparent rounded-full blur-xl transition-opacity opacity-0 group-focus-within:opacity-100"></div>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder={isLoggedIn ? t('chat.placeholder') : t('nav.login')}
              className="w-full pl-10 pr-28 py-4 md:py-8 bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-white/10 rounded-full focus:bg-white dark:focus:bg-stone-700 focus:ring-1 focus:ring-art-primary/20 focus:border-art-primary/30 outline-none font-serif text-base md:text-xl shadow-inner transition-all italic relative z-10 text-stone-900 dark:text-white placeholder:text-stone-400"
              disabled={loading} />
            {/* Sticker button */}
            <div ref={stickerRef} className="absolute right-14 top-2 md:right-16 md:top-3 z-30">
              <button onClick={() => { if (!isLoggedIn) { onAuthRequired(); return; } setShowStickers(v => !v); }}
                className={`p-4 md:p-6 rounded-full transition-all ${showStickers ? 'bg-art-primary/10 text-art-primary' : 'text-stone-400 hover:text-art-primary'}`}>
                <Smile size={20} className="md:hidden" />
                <Smile size={24} className="hidden md:block" />
              </button>
              {showStickers && (
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-stone-100 p-3 w-56 animate-fade-in">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2 px-1">专属艺术表情</p>
                  <div className="grid grid-cols-5 gap-1">
                    {ART_STICKERS.map(s => (
                      <button key={s.id} onClick={() => handleSendSticker(s)} title={s.label}
                        className="text-2xl p-1.5 rounded-xl hover:bg-stone-100 transition-colors hover:scale-110 active:scale-95">
                        {s.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => handleSend(input)} disabled={loading || (isLoggedIn && !input.trim())}
              className={`absolute right-2 top-2 md:right-3 md:top-3 p-4 md:p-6 rounded-full transition-all active:scale-90 shadow-2xl z-30
                ${loading || (isLoggedIn && !input.trim()) ? 'bg-stone-200 text-stone-400' : 'bg-art-accent text-white hover:bg-art-primary hover:scale-105'}`}>
              {isLoggedIn ? <ArrowRight size={22} className="md:hidden" /> : <LogIn size={22} className="md:hidden" />}
              {isLoggedIn ? <ArrowRight size={28} className="hidden md:block" /> : <LogIn size={28} className="hidden md:block" />}
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 md:gap-6 mt-4 md:mt-8 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-300">Gemini 3.0 Pro</span>
            <div className="w-1.5 h-1.5 bg-stone-100 rounded-full"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-300">Real-time Grounding</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtChat;
