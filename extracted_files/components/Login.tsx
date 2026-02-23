
import React, { useState } from 'react';
import { ViewState, User } from '../types';
import { authService } from '../services/authService';
import { ArrowRight, Loader2, Sparkles, Mail, Lock, User as UserIcon, AlertCircle, ChevronLeft, Github } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (view: ViewState) => void;
  embedMode?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigate, embedMode = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await authService.login(email, password);
      } else {
        if (!name.trim()) throw new Error("请输入您的署名，以便画室记录");
        user = await authService.register(name, email, password);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "连接艺术馆服务器失败");
    } finally {
      setLoading(false);
    }
  };

  // 根据模式动态调整容器样式，修复嵌入时的显示问题
  const wrapperClass = embedMode
    ? "h-full w-full animate-fade-in"
    : "min-h-screen flex items-center justify-center p-4 md:p-10 animate-fade-in bg-art-bg";

  const cardClass = embedMode
    ? "w-full h-full flex flex-col md:flex-row relative bg-white"
    : "w-full max-w-6xl bg-white rounded-[40px] overflow-hidden shadow-hard flex flex-col md:flex-row h-full md:h-[85vh] relative border border-stone-100";

  return (
    <div className={wrapperClass}>
      <div className={cardClass}>
        
        {/* 左侧：艺术灵感橱窗 (仅在大屏显示) */}
        <div className="hidden md:block w-1/2 relative bg-stone-900 overflow-hidden group">
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <div className="absolute inset-0 z-20 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/canvas-orange.png')]"></div>
            
            <img 
              src={isLogin 
                ? "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg"
                : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Madame_X_%28Madame_Pierre_Gautreau%29%2C_John_Singer_Sargent%2C_1884_%28unframed%29.jpg/800px-Madame_X_%28Madame_Pierre_Gautreau%29%2C_John_Singer_Sargent%2C_1884_%28unframed%29.jpg"
              }
              alt="Artistic Context" 
              className="w-full h-full object-cover transition-all duration-[12s] scale-110 group-hover:scale-100 ease-out"
            />
            
            <div className="absolute inset-0 z-30 flex flex-col justify-between p-16">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center shadow-2xl font-serif text-2xl font-bold">A</div>
                    <span className="text-white font-serif text-2xl tracking-tighter">ArtIsLife</span>
                </div>

                <div className="space-y-6">
                    <div className="w-16 h-1.5 bg-art-primary rounded-full"></div>
                    <h2 className="font-serif text-6xl text-white italic leading-none tracking-tighter drop-shadow-lg">
                       {isLogin ? "欢迎回来，艺术家。" : "开启您的数字文艺复兴。"}
                    </h2>
                    <p className="text-white/80 text-sm font-light leading-relaxed max-w-sm drop-shadow-md">
                        连接古典之美与现代智慧，每一笔灵感都值得被永久珍藏。
                    </p>
                </div>
            </div>
        </div>

        {/* 右侧：通行证表单 */}
        <div className="w-full md:w-1/2 bg-white flex flex-col h-full overflow-y-auto relative">
            {!embedMode && (
                <button onClick={() => onNavigate('home')} className="absolute top-8 right-8 p-3 rounded-full hover:bg-stone-50 text-stone-300 hover:text-stone-900 transition-all z-50">
                    <ChevronLeft size={24} />
                </button>
            )}

            <div className="max-w-md w-full mx-auto my-auto p-12 md:p-16 space-y-10">
                <div className="text-center">
                    <div className="inline-flex items-center gap-3 text-art-primary mb-4">
                        <Sparkles size={16} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Passage to Digital Atelier</span>
                    </div>
                    <h1 className="font-serif text-5xl text-stone-900 tracking-tight leading-none mb-2">
                        {isLogin ? "登录画室" : "签署契约"}
                    </h1>
                    <p className="text-stone-400 text-sm italic font-serif">
                        {isLogin ? "回归。鉴赏。再次创作。" : "加入。探索。在画布上留下印记。"}
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-medium animate-shake">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="space-y-2 group">
                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">署名名称</label>
                            <div className="relative">
                                <UserIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-art-primary transition-colors" />
                                <input 
                                    type="text" 
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:ring-4 focus:ring-art-primary/5 focus:border-art-primary/40 transition-all font-serif italic text-lg text-stone-800"
                                    placeholder="Vincent"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 group">
                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">电子印记 (Email)</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-art-primary transition-colors" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:ring-4 focus:ring-art-primary/5 focus:border-art-primary/40 transition-all text-stone-800"
                                placeholder="name@atelier.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <div className="flex justify-between items-center">
                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">通行密匙</label>
                            {isLogin && <button type="button" className="text-[9px] font-bold tracking-widest text-art-primary hover:underline uppercase">遗忘密匙?</button>}
                        </div>
                        <div className="relative">
                            <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-art-primary transition-colors" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:bg-white focus:ring-4 focus:ring-art-primary/5 focus:border-art-primary/40 transition-all text-stone-800"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-5 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-xs hover:bg-art-primary transition-all duration-500 shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                {isLogin ? '开启创作档案' : '正式签署契约'} 
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="pt-8 border-t border-stone-50 text-center">
                    <p className="text-stone-400 text-sm mb-4">{isLogin ? "尚未在画室注册？" : "已有创作档案？"}</p>
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(null); }}
                        className="text-art-accent font-bold text-xs tracking-[0.2em] uppercase hover:text-art-primary transition-colors"
                    >
                        {isLogin ? "开启新契约" : "直接进入"}
                    </button>
                </div>
            </div>
        </div>
      </div>
      <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-5px); }
            40%, 80% { transform: translateX(5px); }
          }
          .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Login;
