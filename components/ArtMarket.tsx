
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ViewState, User, GeneratedImage, MarketItem } from '../types';
import { Search, Heart, Crown, SlidersHorizontal, TrendingUp, TrendingDown, Filter, ChevronDown, Plus, ArrowUpRight, X, ShieldCheck, Timer, Briefcase, Gavel, BarChart3, Info, Lock, Wallet, Image as ImageIcon, Star, AlertCircle, History, Upload, Tag, DollarSign, Package, ShoppingCart, Eye, Palette, Sparkles, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../services/authService';
import { MASTERPIECE_COLLECTION } from '../constants';
import AppleText from './AppleText';

interface ArtMarketProps {
  onNavigate: (view: ViewState) => void;
  isActive?: boolean;
  onFullScreenToggle: (isFullScreen: boolean) => void;
  generatedImages?: GeneratedImage[];
}

const generateMockPriceHistory = (basePrice: number) => {
    const points = 10;
    const history = [];
    let current = basePrice * 0.8;
    for (let i = 0; i < points; i++) {
        current = current * (1 + (Math.random() - 0.4) * 0.2); 
        history.push(current);
    }
    history.push(basePrice); 
    return history;
}

const generateMockItems = () => {
    return MASTERPIECE_COLLECTION.map((art, i) => {
        const basePrice = Math.floor(Math.random() * 800) + 100; 
        return {
            id: i,
            title: art.title,
            artist: art.artist,
            year: art.year,
            basePrice: basePrice, 
            priceHistory: generateMockPriceHistory(basePrice),
            image: art.url,
            type: art.type || (i % 2 === 0 ? 'portrait' : 'landscape'),
            rarity: i % 10 === 0 ? 'Legendary' : i % 5 === 0 ? 'Rare' : 'Common'
        }
    });
};

const MarketCard: React.FC<{ children: React.ReactNode; onClick: () => void; className?: string }> = ({ children, onClick, className = '' }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('');
    const [shine, setShine] = useState('');

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateX = (y - cy) / 25;
        const rotateY = -(x - cx) / 25;
        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
        setShine(`radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.1), transparent 80%)`);
    };

    const handleMouseLeave = () => {
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
        setShine('');
    };

    return (
        <div ref={ref} onClick={onClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
            className={`relative transition-transform duration-200 ease-out cursor-pointer ${className}`}
            style={{ transform, transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0 z-20 pointer-events-none rounded-[32px]" style={{ background: shine }}></div>
            {children}
        </div>
    );
};

const PriceGraph: React.FC<{ data: number[], color?: string }> = ({ data, color = "#d4af37" }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 80 - 10; 
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-16 relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M0,100 ${points} L100,100 Z`} fill="url(#fillGradient)" />
                <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="100" cy={100 - ((data[data.length-1] - min) / range) * 80 - 10} r="3" fill={color} />
            </svg>
        </div>
    );
};

const LivePrice: React.FC<{ basePrice: number }> = ({ basePrice }) => {
    const [price, setPrice] = useState(basePrice);
    const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) { 
                const change = (Math.random() - 0.5) * 5; 
                setPrice(p => Math.max(0.1, p + change));
                setTrend(change > 0 ? 'up' : 'down');
                setTimeout(() => setTrend('stable'), 2000);
            }
        }, 3000 + Math.random() * 5000);
        return () => clearInterval(interval);
    }, []);

    const isUp = trend === 'up';
    const isDown = trend === 'down';
    const colorClass = isUp ? 'text-green-400' : isDown ? 'text-red-400' : 'text-white';

    return (
        <div className="flex justify-between items-end">
            <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-art-gold/70 mb-1">实时估值</p>
                <div className={`font-mono text-2xl tracking-tighter transition-colors duration-500 ${colorClass}`}>
                    Ξ {price.toFixed(2)}
                </div>
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold transition-all duration-500 ${isUp ? 'text-green-400 opacity-100' : isDown ? 'text-red-400 opacity-100' : 'text-stone-600 opacity-50'}`}>
                {isUp ? <TrendingUp size={14} /> : isDown ? <TrendingDown size={14} /> : null}
                {trend !== 'stable' && <span>{isUp ? '+0.4%' : '-0.2%'}</span>}
            </div>
        </div>
    );
};

// --- AUCTION MODAL ---
const AuctionModal: React.FC<{ item: any; user: User | null; onClose: () => void }> = ({ item, user, onClose }) => {
    const [currentBid, setCurrentBid] = useState(item.basePrice);
    const [timeLeft, setTimeLeft] = useState(60);
    const [bids, setBids] = useState<{ bidder: string, amount: number, time: string }[]>([]);
    const [auctionStatus, setAuctionStatus] = useState<'active' | 'won' | 'lost'>('active');
    const [isHammerDown, setIsHammerDown] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { clearInterval(timer); endAuction(); return 0; }
                return prev - 1;
            });
        }, 1000);

        const competitorTimer = setInterval(() => {
            if (Math.random() > 0.6 && timeLeft > 5) {
                const increase = Math.floor(Math.random() * 50) + 10;
                const newBid = currentBid + increase;
                setCurrentBid(prev => Math.max(prev, newBid));
                addBid("Anonymous Collector", newBid);
            }
        }, 3000);

        return () => { clearInterval(timer); clearInterval(competitorTimer); };
    }, [timeLeft]); 

    const endAuction = () => {
        setIsHammerDown(true);
        const lastBidder = bids[0]?.bidder;
        if (lastBidder === 'You') {
            setAuctionStatus('won');
            if (user) authService.purchaseItem(user.id, currentBid, item.id.toString()).catch(console.error);
        } else {
            setAuctionStatus('lost');
        }
    };

    const addBid = (bidder: string, amount: number) => {
        const time = new Date().toLocaleTimeString();
        setBids(prev => [{ bidder, amount, time }, ...prev]);
        setCurrentBid(amount);
    };

    const placeBid = () => {
        if (!user) return;
        const nextBid = currentBid + 50;
        if (user.balance < nextBid) { alert("资金不足 (Insufficient Funds)"); return; }
        addBid("You", nextBid);
    };

    return (
        <div className="fixed inset-0 z-[2100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 bg-[#111] rounded-[48px] overflow-hidden shadow-2xl border border-art-gold/20 relative">
                <button onClick={onClose} className="absolute top-6 right-6 z-[150] p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"><X size={20}/></button>
                <div className="relative p-12 bg-[#050505] flex items-center justify-center">
                    <img src={item.image} className="max-w-full max-h-[60vh] object-contain shadow-[0_0_100px_rgba(197,160,89,0.15)] rounded-lg" />
                    {isHammerDown && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                            <div className="text-center transform scale-150">
                                <Gavel size={64} className="text-art-gold mx-auto mb-4" />
                                <h2 className="text-4xl font-serif text-white uppercase tracking-widest">{auctionStatus === 'won' ? 'SOLD to You!' : 'SOLD'}</h2>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-12 flex flex-col relative">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-red-500 mb-2 animate-pulse"><span className="w-2 h-2 bg-red-500 rounded-full"></span><span className="text-[10px] font-bold uppercase tracking-widest">Live Auction</span></div>
                            <h2 className="font-serif text-4xl text-white mb-2 line-clamp-1">{item.title}</h2>
                            <p className="text-stone-500 text-sm font-mono">{item.artist}</p>
                        </div>
                        <div className="text-right"><p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Current Bid</p><p className="font-mono text-4xl text-art-gold">Ξ {currentBid}</p></div>
                    </div>
                    <div className="mb-8">
                        <div className="flex justify-between text-xs text-stone-400 mb-2"><span>Time Remaining</span><span className="font-mono text-white">{timeLeft}s</span></div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 linear ${timeLeft < 10 ? 'bg-red-500' : 'bg-art-gold'}`} style={{ width: `${(timeLeft / 60) * 100}%` }}></div></div>
                    </div>
                    <div className="flex-1 overflow-y-auto mb-8 pr-2 space-y-3 max-h-[150px]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-4 sticky top-0 bg-[#111] pb-2">Recent Activity</p>
                        {bids.map((bid, i) => (
                            <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${bid.bidder === 'You' ? 'bg-art-gold/10 border-art-gold/30' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${bid.bidder === 'You' ? 'bg-art-gold text-black' : 'bg-stone-700 text-stone-300'}`}>{bid.bidder[0]}</div>
                                    <span className={`text-sm ${bid.bidder === 'You' ? 'text-art-gold' : 'text-stone-300'}`}>{bid.bidder}</span>
                                </div>
                                <div className="text-right"><span className="block font-mono text-white">Ξ {bid.amount}</span><span className="text-[9px] text-stone-500">{bid.time}</span></div>
                            </div>
                        ))}
                        {bids.length === 0 && <p className="text-stone-600 text-sm italic text-center py-4">Waiting for first bid...</p>}
                    </div>
                    <div className="mt-auto">
                        {!isHammerDown ? (
                            <button onClick={placeBid} className="w-full py-4 bg-art-gold text-black font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-lg active:scale-[0.98]">Bid Ξ {currentBid + 50}</button>
                        ) : (
                            <div className={`p-4 rounded-xl text-center border ${auctionStatus === 'won' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400'}`}>
                                <p className="font-bold text-lg">{auctionStatus === 'won' ? 'Congratulations! You won the auction.' : 'Auction Ended. Better luck next time.'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- LIST ARTWORK MODAL (绘梦上架) ---
const ListArtworkModal: React.FC<{ 
    generatedImages: GeneratedImage[];
    user: User;
    onClose: () => void;
    onListed: () => void;
}> = ({ generatedImages, user, onClose, onListed }) => {
    const [selectedImg, setSelectedImg] = useState<GeneratedImage | null>(null);
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [rarity, setRarity] = useState<'Common' | 'Rare' | 'Legendary'>('Common');
    const [isListing, setIsListing] = useState(false);
    const [listSuccess, setListSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleList = async () => {
        if (!selectedImg) { setError('请选择一幅作品'); return; }
        if (!title.trim()) { setError('请输入作品名称'); return; }
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) { setError('请输入有效价格'); return; }
        
        setIsListing(true);
        setError(null);
        try {
            const newItem: MarketItem = {
                id: `user-${Date.now()}`,
                title: title.trim(),
                artist: user.name,
                year: new Date().getFullYear().toString(),
                basePrice: priceNum,
                priceHistory: generateMockPriceHistory(priceNum),
                image: selectedImg.url,
                type: 'ai-generated',
                rarity: rarity,
                isSystem: false
            };
            await authService.listMarketItem(newItem);
            setListSuccess(true);
            setTimeout(() => { onListed(); onClose(); }, 1500);
        } catch (err: any) {
            setError(err.message || '上架失败');
        } finally {
            setIsListing(false);
        }
    };

    if (listSuccess) {
        return (
            <div className="fixed inset-0 z-[2100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fade-in">
                <div className="text-center space-y-6 animate-scale-in">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl"><CheckCircle size={48} className="text-white" /></div>
                    <h3 className="font-serif text-4xl text-white">上架成功</h3>
                    <p className="text-stone-400">您的作品已进入市场交易</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[2100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-4xl bg-[#111] rounded-[48px] overflow-hidden shadow-2xl border border-art-gold/20 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 z-[150] p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"><X size={20}/></button>
                
                <div className="p-12 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-art-gold/20 rounded-2xl flex items-center justify-center"><Upload size={24} className="text-art-gold" /></div>
                        <div>
                            <h2 className="font-serif text-3xl text-white">上架绘梦作品</h2>
                            <p className="text-stone-500 text-sm">将你的 AI 创作上架到藏馆市场交易</p>
                        </div>
                    </div>

                    {/* Select artwork from generated images */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-3 block">选择作品</label>
                        {generatedImages.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center">
                                <Palette size={32} className="text-stone-600 mx-auto mb-3" />
                                <p className="text-stone-500 text-sm">还没有创作作品，前往「绘梦」创作吧</p>
                            </div>
                        ) : (
                            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                                {generatedImages.map((img, idx) => (
                                    <button key={idx} onClick={() => { setSelectedImg(img); if (!title) setTitle(img.prompt.slice(0, 30)); }}
                                        className={`flex-shrink-0 w-28 h-28 rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${selectedImg?.timestamp === img.timestamp ? 'border-art-gold ring-2 ring-art-gold/30 scale-105' : 'border-white/10 opacity-60 hover:opacity-100'}`}>
                                        <img src={img.url} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">作品名称</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="为你的杰作命名..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-art-gold/50 transition-colors font-serif italic" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">售价 (Ξ ArtCoin)</label>
                            <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="1" placeholder="100"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-art-gold/50 transition-colors font-mono" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">稀有度标签</label>
                        <div className="flex gap-3">
                            {(['Common', 'Rare', 'Legendary'] as const).map(r => (
                                <button key={r} onClick={() => setRarity(r)}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${rarity === r
                                        ? r === 'Legendary' ? 'bg-art-gold/20 text-art-gold border-art-gold/40' : r === 'Rare' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-white/10 text-white border-white/30'
                                        : 'bg-transparent text-stone-500 border-white/5 hover:border-white/20'}`}>
                                    {r === 'Common' ? '普通' : r === 'Rare' ? '稀有' : '传说'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}

                    <button onClick={handleList} disabled={isListing || !selectedImg}
                        className="w-full py-5 bg-art-gold text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-white transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                        {isListing ? <span className="animate-spin"><Sparkles size={16} /></span> : <Upload size={16} />}
                        {isListing ? '上架中...' : '确认上架'}
                    </button>
                </div>
            </div>
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};


const ArtMarket: React.FC<ArtMarketProps> = ({ onNavigate, isActive, onFullScreenToggle, generatedImages = [] }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'market' | 'collection' | 'dreams'>('market');
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  
  const [filterType, setFilterType] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [sortBy, setSortBy] = useState<'rec' | 'price_asc' | 'price_desc' | 'rarity_desc'>('rec');
  
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [viewingItem, setViewingItem] = useState<any | null>(null); 
  const [auctionItem, setAuctionItem] = useState<any | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock AI-generated artworks for the dreams tab - using AI folder images
  const mockAiArtworks = useMemo(() => [
    { id: 'ai-mock-1', title: '梵高的戴珍珠耳环的少女', artist: 'NeuralVan', year: '2025', basePrice: 580, image: '/artworks/AI/梵高的戴珍珠耳环的少女.png', type: 'ai-generated', rarity: 'Legendary', priceHistory: generateMockPriceHistory(580) },
    { id: 'ai-mock-2', title: '达芬奇的《呐喊》', artist: 'DaVinciAI', year: '2025', basePrice: 720, image: '/artworks/AI/达芬奇的《呐喊》.png', type: 'ai-generated', rarity: 'Legendary', priceHistory: generateMockPriceHistory(720) },
    { id: 'ai-mock-3', title: '毕加索的《最后的晚餐》', artist: 'CubistNet', year: '2025', basePrice: 450, image: '/artworks/AI/毕加索的《最后的晚餐》.png', type: 'ai-generated', rarity: 'Rare', priceHistory: generateMockPriceHistory(450) },
    { id: 'ai-mock-4', title: '莫奈的《星夜》', artist: 'ImpressionAI', year: '2025', basePrice: 380, image: '/artworks/AI/莫奈的《星夜》.png', type: 'ai-generated', rarity: 'Rare', priceHistory: generateMockPriceHistory(380) },
    { id: 'ai-mock-5', title: '克里姆特的《黑客帝国》', artist: 'GoldenAI', year: '2025', basePrice: 520, image: '/artworks/AI/古斯塔夫·克里姆特的《黑客帝国》.png', type: 'ai-generated', rarity: 'Legendary', priceHistory: generateMockPriceHistory(520) },
    { id: 'ai-mock-6', title: '萨尔瓦多·达利的《赛博朋克城市》', artist: 'SurrealNet', year: '2025', basePrice: 490, image: '/artworks/AI/萨尔瓦多·达利的《赛博朋克城市》.png', type: 'ai-generated', rarity: 'Rare', priceHistory: generateMockPriceHistory(490) },
    { id: 'ai-mock-7', title: '葛饰北斋的《曼哈顿街头》', artist: 'UkiyoAI', year: '2025', basePrice: 340, image: '/artworks/AI/葛饰北斋的《曼哈顿街头》.png', type: 'ai-generated', rarity: 'Common', priceHistory: generateMockPriceHistory(340) },
    { id: 'ai-mock-8', title: '米开朗基罗的《宇航员》', artist: 'RenaissanceBot', year: '2025', basePrice: 680, image: '/artworks/AI/米开朗基罗的《宇航员》.png', type: 'ai-generated', rarity: 'Legendary', priceHistory: generateMockPriceHistory(680) },
    { id: 'ai-mock-9', title: '安迪·沃霍尔的《维纳斯的诞生》', artist: 'PopArtAI', year: '2025', basePrice: 290, image: '/artworks/AI/安迪·沃霍尔的《维纳斯的诞生》.png', type: 'ai-generated', rarity: 'Common', priceHistory: generateMockPriceHistory(290) },
    { id: 'ai-mock-10', title: '伦勃朗的蒙娜丽莎', artist: 'DutchMasterAI', year: '2025', basePrice: 550, image: '/artworks/AI/伦勃朗的蒙娜丽莎.png', type: 'ai-generated', rarity: 'Rare', priceHistory: generateMockPriceHistory(550) },
  ], []);

  useEffect(() => {
    onFullScreenToggle(!!viewingItem);
  }, [viewingItem, onFullScreenToggle]); 

  useEffect(() => {
      const unsub = authService.subscribe((u) => setUser(u));
      return () => unsub();
  }, []);

  const allItems = useMemo(() => generateMockItems(), []); 

  // Get user-listed items from market
  const userListedItems = useMemo(() => {
      const items = authService.getMarketItems();
      return items.filter(i => !i.isSystem);
  }, [refreshKey]);

  // Filter & Sort Logic
  const processedItems = useMemo(() => {
      let result: any[];
      
      if (activeTab === 'dreams') {
          // Show user-listed AI artworks + mock AI artworks
          const userItems = userListedItems.map(item => ({
              ...item,
              id: item.id,
              priceHistory: item.priceHistory || generateMockPriceHistory(item.basePrice)
          }));
          result = [...userItems, ...mockAiArtworks];
      } else if (activeTab === 'collection') {
          if (!user) return [];
          result = [...allItems].filter(i => user.inventoryIds?.includes(i.id.toString()));
      } else {
          // Merge system items + user-listed items
          const listed = userListedItems.map(item => ({
              ...item,
              priceHistory: item.priceHistory || generateMockPriceHistory(item.basePrice)
          }));
          result = [...listed, ...allItems];
      }

      if (filterType !== 'all') result = result.filter((i: any) => i.type === filterType);
      if (filterRarity !== 'all') result = result.filter((i: any) => i.rarity === filterRarity);
      if (sortBy === 'price_asc') result.sort((a: any, b: any) => a.basePrice - b.basePrice);
      else if (sortBy === 'price_desc') result.sort((a: any, b: any) => b.basePrice - a.basePrice);
      else if (sortBy === 'rarity_desc') {
          const rarityMap: Record<string, number> = { 'Legendary': 3, 'Rare': 2, 'Common': 1 };
          result.sort((a: any, b: any) => (rarityMap[b.rarity] || 0) - (rarityMap[a.rarity] || 0));
      }
      return result;
  }, [filterType, filterRarity, sortBy, allItems, activeTab, user, userListedItems, mockAiArtworks]);

  const visibleItems = processedItems.slice(0, visibleCount);
  const hasMore = visibleCount < processedItems.length;

  const handleLoadMore = () => setVisibleCount(prev => Math.min(prev + 12, processedItems.length));

  const handlePurchase = async (item: any) => {
      if (!user) return;
      setIsPurchasing(true);
      setPurchaseError(null);
      try {
          await authService.purchaseItem(user.id, item.basePrice, item.id.toString());
          setSelectedItem(null);
          setActiveTab('collection');
      } catch (err: any) {
          setPurchaseError(err.message);
      } finally {
          setIsPurchasing(false);
      }
  };

  const isOwned = (id: number | string) => user?.inventoryIds?.includes(id.toString());

  const tabs = [
      { key: 'market' as const, label: '公开市场', icon: <ShoppingCart size={14} /> },
      { key: 'dreams' as const, label: '绘梦交易', icon: <Palette size={14} /> },
      { key: 'collection' as const, label: '私人收藏', icon: <Package size={14} /> },
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 animate-fade-in relative z-20">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-art-gold"><Crown size={20} /><span className="text-[10px] font-bold uppercase tracking-[0.4em]">{t('market.tag_private')}</span></div>
                <h2 className="font-serif text-7xl md:text-8xl text-white tracking-tighter leading-none">{isActive && <AppleText text={t('market.title')} delay={0.2} />}<span className="text-stone-700">.</span></h2>
                
                {/* Tab Navigation with 3 tabs */}
                <div className="flex gap-2 pt-4">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => { setActiveTab(tab.key); setVisibleCount(12); }}
                            className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${activeTab === tab.key 
                                ? 'text-white border-art-gold bg-art-gold/10' 
                                : 'text-stone-500 border-transparent hover:text-stone-300 hover:border-white/10'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto items-end">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex items-center gap-6 shadow-xl">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-art-gold/10 flex items-center justify-center text-art-gold"><Wallet size={18} fill="currentColor" /></div><div><p className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Balance</p><p className="font-mono text-xl text-white">Ξ {user?.balance.toFixed(2) || '0.00'}</p></div></div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="text-right"><p className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Owned</p><p className="font-mono text-xl text-white">{user?.inventoryIds?.length || 0}</p></div>
                </div>
                {/* List Artwork Button for Dreams tab */}
                {activeTab === 'dreams' && user && (
                    <button onClick={() => setShowListModal(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-art-gold text-black rounded-xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl active:scale-[0.97]">
                        <Upload size={16} /> 上架我的作品
                    </button>
                )}
            </div>
        </div>

        {/* Dreams tab header */}
        {activeTab === 'dreams' && (
            <div className="mb-8 p-6 bg-gradient-to-r from-art-gold/10 to-transparent border border-art-gold/20 rounded-2xl flex items-center gap-6 animate-fade-in">
                <div className="w-14 h-14 bg-art-gold/20 rounded-2xl flex items-center justify-center flex-shrink-0"><Sparkles size={28} className="text-art-gold" /></div>
                <div>
                    <h3 className="text-white font-serif text-xl mb-1">绘梦交易市场</h3>
                    <p className="text-stone-400 text-sm">在「绘梦」中用 AI 创作的作品可以在这里上架交易，使用 ArtCoin (Ξ) 买卖。创作者定价，买家自由选购。</p>
                </div>
            </div>
        )}

        {/* Filters Toolbar */}
        <div className="mb-8 flex flex-wrap gap-4 animate-fade-in-up delay-100">
            <div className="relative group">
                <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)}
                    className="appearance-none bg-[#1a1a1a] border border-white/10 text-white text-xs font-bold uppercase tracking-wider pl-4 pr-10 py-3 rounded-full hover:border-art-gold/50 focus:outline-none focus:border-art-gold transition-colors">
                    <option value="all">All Rarity</option>
                    <option value="Legendary">Legendary</option>
                    <option value="Rare">Rare</option>
                    <option value="Common">Common</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            </div>
            <div className="relative group">
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                    className="appearance-none bg-[#1a1a1a] border border-white/10 text-white text-xs font-bold uppercase tracking-wider pl-4 pr-10 py-3 rounded-full hover:border-art-gold/50 focus:outline-none focus:border-art-gold transition-colors">
                    <option value="all">All Types</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="abstract">Abstract</option>
                    <option value="ai-generated">AI Generated</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            </div>
            <div className="relative group ml-auto">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-[#1a1a1a] border border-white/10 text-white text-xs font-bold uppercase tracking-wider pl-4 pr-10 py-3 rounded-full hover:border-art-gold/50 focus:outline-none focus:border-art-gold transition-colors">
                    <option value="rec">Recommended</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rarity_desc">Rarity: High to Low</option>
                </select>
                <SlidersHorizontal size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[50vh]">
            {visibleItems.length > 0 ? (
                visibleItems.map((item: any, idx: number) => (
                    <MarketCard key={`${item.id}-${idx}`} onClick={() => activeTab === 'collection' ? setViewingItem(item) : setSelectedItem(item)} className={`group bg-[#111] rounded-[32px] overflow-hidden border transition-all flex flex-col animate-fade-in-up ${activeTab === 'collection' ? 'border-art-gold/20 shadow-[0_0_20px_rgba(197,160,89,0.1)]' : 'border-white/5 hover:border-art-gold/40 shadow-lg'}`}>
                        <div className="aspect-[3/4] relative overflow-hidden bg-stone-900">
                            <img src={item.image} loading="lazy" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                            <div className="absolute top-4 left-4 flex gap-2 z-10">
                                {item.rarity !== 'Common' && <span className={`backdrop-blur-md text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border flex items-center gap-1 ${item.rarity === 'Legendary' ? 'bg-art-gold/20 text-art-gold border-art-gold/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'}`}><Crown size={10} /> {item.rarity}</span>}
                                {item.type === 'ai-generated' && <span className="backdrop-blur-md text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border bg-blue-500/20 text-blue-300 border-blue-500/30 flex items-center gap-1"><Sparkles size={10} /> AI</span>}
                            </div>
                            {isOwned(item.id) && <div className="absolute bottom-4 right-4 bg-green-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10"><ShieldCheck size={12} /> Owned</div>}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
                            {activeTab !== 'collection' && <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500"><LivePrice basePrice={item.basePrice} /></div>}
                        </div>
                        <div className="p-6 space-y-2 flex-1 flex flex-col justify-between relative z-10 bg-[#111]">
                            <div><h3 className="font-serif text-xl text-white group-hover:text-art-gold transition-colors truncate leading-none tracking-tight mb-2">{item.title}</h3><div className="flex items-center justify-between"><p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-medium">{item.artist}</p><ArrowUpRight size={14} className="text-stone-700 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div></div>
                        </div>
                    </MarketCard>
                ))
            ) : (
                <div className="col-span-full py-20 text-center text-stone-500">
                    <Filter size={48} className="mx-auto mb-4 opacity-20" />
                    <p>{activeTab === 'collection' ? '您的私人收藏室空空如也，去市场看看吧' : activeTab === 'dreams' ? '还没有绘梦作品上架，成为第一个创作者吧' : '没有找到符合条件的藏品'}</p>
                    <button onClick={() => { setFilterType('all'); setFilterRarity('all'); if (activeTab !== 'market') setActiveTab('market'); }} className="mt-4 text-art-gold text-xs font-bold uppercase tracking-widest hover:underline">
                        {activeTab === 'market' ? '清除筛选' : '前往市场'}
                    </button>
                </div>
            )}
        </div>

        {hasMore && visibleItems.length > 0 && <div className="mt-16 flex justify-center pb-12"><button onClick={handleLoadMore} className="group relative px-10 py-4 bg-[#111] border border-white/10 rounded-full text-white overflow-hidden transition-all hover:border-art-gold/50"><div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div><span className="relative z-10 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em]"><Plus size={14} /> 加载更多藏品</span></button></div>}

        {/* Viewing Collection Modal */}
        {viewingItem && (
            <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-xl flex items-center justify-center animate-fade-in" onClick={() => setViewingItem(null)}>
                <div className="relative w-full h-full flex items-center justify-center">
                    <button onClick={() => setViewingItem(null)} className="absolute top-4 right-4 z-[2010] text-white bg-black/20 p-2 rounded-full hover:bg-black/50 transition-colors"><X size={24} /></button>
                    <img src={viewingItem.image} className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center bg-black/30 px-6 py-3 rounded-2xl">
                        <h3 className="font-serif text-3xl text-white">{viewingItem.title}</h3>
                        <p className="text-stone-300">{viewingItem.artist} {viewingItem.year && `• ${viewingItem.year}`}</p>
                    </div>
                </div>
            </div>
        )}

        {/* Purchase Modal */}
        {selectedItem && (
            <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 md:p-12 animate-fade-in" onClick={() => setSelectedItem(null)}>
                <div className="bg-[#111] w-full max-w-6xl rounded-[40px] overflow-hidden shadow-2xl border border-white/10 flex flex-col lg:flex-row relative max-h-[90vh] z-[2010]" onClick={e => e.stopPropagation()}>
                    <button className="absolute top-8 right-8 z-[2020] p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all hover:rotate-90" onClick={() => setSelectedItem(null)}><X size={24} /></button>
                    <div className="w-full lg:w-1/2 bg-stone-950 relative p-8 flex items-center justify-center"><img src={selectedItem.image} className="w-auto h-auto max-h-full max-w-full object-contain shadow-2xl rounded-sm ring-1 ring-white/10" /><div className="absolute bottom-8 left-8 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur text-[10px] font-bold text-white rounded-full border border-white/10 whitespace-nowrap"><ShieldCheck size={14} className="text-art-gold" /> {t('market.shield_text')}</div></div>
                    <div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col overflow-y-auto">
                        <div className="space-y-8 flex-1">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border ${selectedItem.rarity === 'Legendary' ? 'bg-art-gold/10 text-art-gold border-art-gold/20' : 'bg-white/10 text-white border-white/20'}`}>{selectedItem.rarity}</span>
                                {selectedItem.type === 'ai-generated' && <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border bg-blue-500/10 text-blue-300 border-blue-500/20">AI Created</span>}
                            </div>
                            <div><h3 className="font-serif text-5xl text-white leading-none mb-2">{selectedItem.title}</h3><p className="text-stone-400 text-lg italic">{selectedItem.artist}, {selectedItem.year}</p></div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4"><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2"><BarChart3 size={14}/> Price History (30d)</span><LivePrice basePrice={selectedItem.basePrice} /></div><PriceGraph data={selectedItem.priceHistory} color={selectedItem.rarity === 'Legendary' ? '#C5A059' : '#ffffff'} /></div>
                            {purchaseError && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold flex items-center gap-3 animate-shake"><AlertCircle size={16} /> {purchaseError}</div>}
                        </div>
                        <div className="mt-12 sticky bottom-0 bg-[#111] pt-4 border-t border-white/5 flex gap-4">
                            {isOwned(selectedItem.id) ? (
                                <button className="w-full py-5 bg-green-600/20 text-green-400 border border-green-600/30 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs cursor-default flex items-center justify-center gap-3"><ShieldCheck size={16} /> 已收藏</button>
                            ) : (
                                <>
                                    <button onClick={() => { setAuctionItem(selectedItem); setSelectedItem(null); }} className="flex-1 py-5 bg-art-gold/20 text-art-gold border border-art-gold/30 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-art-gold hover:text-black transition-all shadow-xl flex items-center justify-center gap-3"><Gavel size={16} /> 竞拍</button>
                                    <button onClick={() => handlePurchase(selectedItem)} disabled={isPurchasing} className="flex-[2] py-5 bg-white text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-art-gold transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">{isPurchasing ? '交易确认中...' : `购买 (Ξ ${selectedItem.basePrice.toFixed(2)})`}</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Auction Modal */}
        {auctionItem && <AuctionModal item={auctionItem} user={user} onClose={() => setAuctionItem(null)} />}

        {/* List Artwork Modal */}
        {showListModal && user && (
            <ListArtworkModal 
                generatedImages={generatedImages}
                user={user}
                onClose={() => setShowListModal(false)}
                onListed={() => setRefreshKey(k => k + 1)}
            />
        )}
    </div>
  );
};

export default ArtMarket;
