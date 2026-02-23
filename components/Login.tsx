
import React, { useState, useEffect } from 'react';
import { ViewState, User } from '../types';
import { authService } from '../services/authService';
import { ArrowRight, Loader2, Sparkles, Mail, Lock, User as UserIcon, AlertCircle, ChevronLeft, Eye, EyeOff, Palette, Shield } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: '弱', color: 'bg-red-400' };
    if (score <= 3) return { level: 2, label: '中', color: 'bg-yellow-400' };
    return { level: 3, label: '强', color: 'bg-green-400' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const emailRegex = /^[\S]+@[\S]+\.[\S]+$/;
    if (!emailRegex.test(email)) {
      setError(t('login.validation.invalidEmail'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('login.validation.passwordTooShort').replace('{passwordMinLength}', '6'));
      setLoading(false);
      return;
    }

    try {
      let user;
      if (isLogin) {
        user = await authService.login(email, password);
      } else {
        if (!name.trim()) {
          setError(t('login.validation.nameRequired'));
          setLoading(false);
          return;
        }
        user = await authService.register(name, email, password);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || t('login.validation.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const wrapperClass = embedMode
    ? "h-full w-full animate-fade-in"
    : "min-h-screen flex items-center justify-center p-4 md:p-10 animate-fade-in bg-art-bg";

  const cardClass = embedMode
    ? "w-full h-full flex flex-col md:flex-row relative bg-white"
    : "w-full max-w-6xl bg-white rounded-[40px] overflow-hidden shadow-hard flex flex-col md:flex-row h-full md:h-[85vh] relative border border-stone-100";

  return (
    <div className={wrapperClass}>
      <div className={cardClass}>
        
        {/* Left: Art Showcase Panel */}
        <div className="hidden md:flex w-1/2 relative bg-stone-900 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/70 z-10"></div>
            
            <img 
              src={isLogin 
                ? "/artworks/paintings/Blossoming Almond Tree.jpg"
                : "/artworks/paintings/The Accolade.jpg"
              }
              alt="Artistic Context" 
              className="w-full h-full object-cover transition-all duration-[2s] scale-110 group-hover:scale-100 ease-out"
              style={{ objectPosition: isLogin ? 'center 20%' : 'center center' }}
            />
            
            <div className="absolute inset-0 z-30 flex flex-col justify-between p-12 md:p-16">
                {/* Top: Brand */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center shadow-2xl font-serif text-2xl font-bold border border-white/20">A</div>
                    <span className="text-white/90 font-serif text-2xl tracking-tighter">ArtIsLife</span>
                </div>

                {/* Bottom: Tagline */}
                <div className="space-y-6">
                    <div className="w-16 h-1 bg-art-gold rounded-full"></div>
                    <h2 className="font-serif text-5xl xl:text-6xl text-white leading-[1.1] tracking-tighter">
                       {isLogin ? t('login.left_panel.welcome_back') : t('login.left_panel.start_renaissance')}
                    </h2>
                    <p className="text-white/60 text-sm font-light leading-relaxed max-w-sm">
                        {t('login.left_panel.description')}
                    </p>
                    
                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {['AI 创作', '艺术交易', '大师鉴赏'].map((tag, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-white/70 text-[10px] font-bold uppercase tracking-wider">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Right: Form Panel */}
        <div className="w-full md:w-1/2 bg-white flex flex-col h-full overflow-y-auto relative">
            {!embedMode && (
                <button onClick={() => onNavigate('home')} className="absolute top-6 right-6 p-3 rounded-full hover:bg-stone-50 text-stone-300 hover:text-stone-900 transition-all z-50 group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
            )}

            <div className="max-w-md w-full mx-auto my-auto px-8 py-12 md:px-12 md:py-16 space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 text-art-primary mb-2">
                        <Sparkles size={14} className="animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em]">{t('login.form.passage_title')}</span>
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-900 tracking-tight leading-none">
                        {isLogin ? t('login.form.login_title') : t('login.form.register_title')}
                    </h1>
                    <p className="text-stone-400 text-sm italic font-serif">
                        {isLogin ? t('login.form.login_subtitle') : t('login.form.register_subtitle')}
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-medium animate-login-error">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Field (Register only) */}
                    {!isLogin && (
                        <div className={`space-y-1.5 transition-all duration-300 ${focusedField === 'name' ? 'scale-[1.01]' : ''}`}>
                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">{t('login.form.label_name')}</label>
                            <div className="relative">
                                <UserIcon size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'name' ? 'text-art-primary' : 'text-stone-300'}`} />
                                <input 
                                    type="text" required value={name}
                                    onChange={e => setName(e.target.value)}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-12 pr-5 outline-none focus:bg-white focus:ring-2 focus:ring-art-primary/10 focus:border-art-primary/40 transition-all text-stone-800 text-[15px]"
                                    placeholder="Vincent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Field */}
                    <div className={`space-y-1.5 transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">{t('login.form.label_email')}</label>
                        <div className="relative">
                            <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-art-primary' : 'text-stone-300'}`} />
                            <input 
                                type="email" required value={email}
                                onChange={e => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-12 pr-5 outline-none focus:bg-white focus:ring-2 focus:ring-art-primary/10 focus:border-art-primary/40 transition-all text-stone-800 text-[15px]"
                                placeholder="name@atelier.com"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className={`space-y-1.5 transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : ''}`}>
                        <div className="flex justify-between items-center">
                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 ml-1">{t('login.form.label_password')}</label>
                            {isLogin && <button type="button" className="text-[9px] font-bold tracking-widest text-art-primary hover:underline uppercase">{t('login.form.forgot_password')}</button>}
                        </div>
                        <div className="relative">
                            <Lock size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-art-primary' : 'text-stone-300'}`} />
                            <input 
                                type={showPassword ? 'text' : 'password'} required value={password}
                                onChange={e => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3.5 pl-12 pr-12 outline-none focus:bg-white focus:ring-2 focus:ring-art-primary/10 focus:border-art-primary/40 transition-all text-stone-800 text-[15px]"
                                placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        
                        {/* Password Strength Indicator (Register only) */}
                        {!isLogin && password.length > 0 && (
                            <div className="flex items-center gap-2 mt-2 ml-1">
                                <div className="flex gap-1 flex-1">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-stone-200'}`} />
                                    ))}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${strength.level === 3 ? 'text-green-500' : strength.level === 2 ? 'text-yellow-500' : 'text-red-400'}`}>
                                    {strength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" disabled={loading}
                        className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-[0.25em] text-[11px] transition-all duration-500 shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 group/btn relative overflow-hidden hover:shadow-2xl"
                    >
                        <span className="absolute inset-0 bg-art-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></span>
                        <span className="relative z-10 flex items-center gap-3">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <>
                                {isLogin ? t('login.form.button_login') : t('login.form.button_register')} 
                                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </>
                        )}
                        </span>
                    </button>
                </form>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 py-2">
                    <div className="flex items-center gap-1.5 text-stone-300">
                        <Shield size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">SSL 加密</span>
                    </div>
                    <div className="w-px h-3 bg-stone-200"></div>
                    <div className="flex items-center gap-1.5 text-stone-300">
                        <Palette size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">安全登录</span>
                    </div>
                </div>

                {/* Switch Login/Register */}
                <div className="pt-6 border-t border-stone-100 text-center">
                    <p className="text-stone-400 text-sm mb-3">{isLogin ? t('login.form.prompt_register') : t('login.form.prompt_login')}</p>
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(null); setPassword(''); }}
                        className="text-art-accent font-bold text-xs tracking-[0.2em] uppercase hover:text-art-primary transition-colors"
                    >
                        {isLogin ? t('login.form.button_switch_to_register') : t('login.form.button_switch_to_login')}
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
          @keyframes loginError {
            0% { opacity: 0; transform: translateY(-8px); }
            30% { opacity: 1; transform: translateY(0); }
            40%, 60% { transform: translateX(-4px); }
            50%, 70% { transform: translateX(4px); }
            80%, 100% { transform: translateX(0); }
          }
          .animate-shake { animation: shake 0.5s ease-in-out; }
          .animate-login-error { animation: loginError 0.6s ease-out; }
      `}</style>
    </div>
  );
};

export default Login;
