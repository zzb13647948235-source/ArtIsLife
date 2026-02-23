
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ViewState, User } from '../types';
import { Search, Heart, Crown, SlidersHorizontal, TrendingUp, TrendingDown, Filter, ChevronDown, Plus, ArrowUpRight, X, ShieldCheck, Timer, Briefcase, Gavel, BarChart3, Info, Lock, Wallet, Image as ImageIcon, Star, AlertCircle, History } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../services/authService';
import { MASTERPIECE_COLLECTION } from '../constants';
import AppleText from './AppleText';

interface ArtMarketProps {
  onNavigate: (view: ViewState) => void;
  isActive?: boolean;
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
    // Generate items from the extensive MASTERPIECE_COLLECTION constant
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
        <div 
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative transition-transform duration-200 ease-out cursor-pointer ${className}`}
            style={{ transform, transformStyle: 'preserve-3d' }}
        >
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
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds auction
    const [bids, setBids] = useState<{ bidder: string, amount: number, time: string }[]>([]);
    const [auctionStatus, setAuctionStatus] = useState<'active' | 'won' | 'lost'>('active');
    const [isHammerDown, setIsHammerDown] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    endAuction();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Simulated competitors
        const competitorTimer = setInterval(() => {
            if (Math.random() > 0.6 && timeLeft > 5) {
                const increase = Math.floor(Math.random() * 50) + 10;
                const newBid = currentBid + increase;
                setCurrentBid(prev => Math.max(prev, newBid)); // Ensure monotonic increase relative to state
                addBid("Anonymous Collector", newBid);
            }
        }, 3000);

        return () => { clearInterval(timer); clearInterval(competitorTimer); };
    }, [timeLeft]); 

    const endAuction = () => {
        setIsHammerDown(true);
        // Determine winner: last bidder
        const lastBidder = bids[0]?.bidder;
        if (lastBidder === 'You') {
            setAuctionStatus('won');
            // Deduct funds if won
            if (user) {
                authService.purchaseItem(user.id, currentBid, item.id.toString()).catch(console.error);
            }
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
        if (user.balance < nextBid) {
            alert("资金不足 (Insufficient Funds)");
            return;
        }
        addBid("You", nextBid);
    };

    return (
        <div className="fixed inset-0 z-[2100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 bg-[#111] rounded-[48px] overflow-hidden shadow-2xl border border-art-gold/20 relative">
                <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"><X size={20}/></button>
                
                {/* Image Side */}
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

                {/* Interaction Side */}
                <div className="p-12 flex flex-col relative">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-red-500 mb-2 animate-pulse">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Live Auction</span>
                            </div>
                            <h2 className="font-serif text-4xl text-white mb-2 line-clamp-1">{item.title}</h2>
                            <p className="text-stone-500 text-sm font-mono">{item.artist}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Current Bid</p>
                            <p className="font-mono text-4xl text-art-gold">Ξ {currentBid}</p>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="mb-8">
                        <div className="flex justify-between text-xs text-stone-400 mb-2">
                            <span>Time Remaining</span>
                            <span className="font-mono text-white">{timeLeft}s</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 linear ${timeLeft < 10 ? 'bg-red-500' : 'bg-art-gold'}`} 
                                style={{ width: `${(timeLeft / 60) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Bid History */}
                    <div className="flex-1 overflow-y-auto mb-8 pr-2 space-y-3 max-h-[150px]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-4 sticky top-0 bg-[#111] pb-2">Recent Activity</p>
                        {bids.map((bid, i) => (
                            <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${bid.bidder === 'You' ? 'bg-art-gold/10 border-art-gold/30' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${bid.bidder === 'You' ? 'bg-art-gold text-black' : 'bg-stone-700 text-stone-300'}`}>
                                        {bid.bidder[0]}
                                    </div>
                                    <span className={`text-sm ${bid.bidder === 'You' ? 'text-art-gold' : 'text-stone-300'}`}>{bid.bidder}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-mono text-white">Ξ {bid.amount}</span>
                                    <span className="text-[9px] text-stone-500">{bid.time}</span>
                                </div>
                            </div>
                        ))}
                        {bids.length === 0 && <p className="text-stone-600 text-sm italic text-center py-4">Waiting for first bid...</p>}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-auto">
                        {!isHammerDown ? (
                            <div className="flex gap-4">
                                <button 
                                    onClick={placeBid}
                                    className="flex-1 py-4 bg-art-gold text-black font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-lg active:scale-[0.98]"
                                >
                                    Bid Ξ {currentBid + 50}
                                </button>
                            </div>
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

const ArtMarket: React.FC<ArtMarketProps> = ({ onNavigate, isActive }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'market' | 'collection'>('market');
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  
  // Filter States
  const [filterType, setFilterType] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [sortBy, setSortBy] = useState<'rec' | 'price_asc' | 'price_desc' | 'rarity_desc'>('rec');
  
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [viewingItem, setViewingItem] = useState<any | null>(null); 
  const [auctionItem, setAuctionItem] = useState<any | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
      const unsub = authService.subscribe((u) => setUser(u));
      return () => unsub();
  }, []);

  const allItems = useMemo(() => generateMockItems(), []); 

  // Filter & Sort Logic
  const processedItems = useMemo(() => {
      let result = [...allItems];
      if (activeTab === 'collection') {
          if (!user) return [];
          result = result.filter(i => user.inventoryIds?.includes(i.id.toString()));
      }
      if (filterType !== 'all') result = result.filter(i => i.type === filterType);
      if (filterRarity !== 'all') result = result.filter(i => i.rarity === filterRarity);
      if (sortBy === 'price_asc') result.sort((a, b) => a.basePrice - b.basePrice);
      else if (sortBy === 'price_desc') result.sort((a, b) => b.basePrice - a.basePrice);
      else if (sortBy === 'rarity_desc') {
          const rarityMap: Record<string, number> = { 'Legendary': 3, 'Rare': 2, 'Common': 1 };
          result.sort((a, b) => rarityMap[b.rarity] - rarityMap[a.rarity]);
      }
      return result;
  }, [filterType, filterRarity, sortBy, allItems, activeTab, user]);

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

  const isOwned = (id: number) => user?.inventoryIds?.includes(id.toString());

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 animate-fade-in relative z-20">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-art-gold"><Crown size={20} /><span className="text-[10px] font-bold uppercase tracking-[0.4em]">{t('market.tag_private')}</span></div>
                <h2 className="font-serif text-7xl md:text-8xl text-white tracking-tighter leading-none">{isActive && <AppleText text={t('market.title')} delay={0.2} />}<span className="text-stone-700">.</span></h2>
                <div className="flex gap-6 pt-4">
                    <button onClick={() => setActiveTab('market')} className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'market' ? 'text-white border-art-gold' : 'text-stone-500 border-transparent hover:text-stone-300'}`}>公开市场</button>
                    <button onClick={() => setActiveTab('collection')} className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'collection' ? 'text-white border-art-gold' : 'text-stone-500 border-transparent hover:text-stone-300'}`}>私人收藏</button>
                </div>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto items-end">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex items-center gap-6 shadow-xl">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-art-gold/10 flex items-center justify-center text-art-gold"><Wallet size={18} fill="currentColor" /></div><div><p className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Balance</p><p className="font-mono text-xl text-white">Ξ {user?.balance.toFixed(2) || '0.00'}</p></div></div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="text-right"><p className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Owned</p><p className="font-mono text-xl text-white">{user?.inventoryIds?.length || 0}</p></div>
                </div>
            </div>
        </div>

        {/* Filters Toolbar */}
        <div className="mb-8 flex flex-wrap gap-4 animate-fade-in-up delay-100">
            <div className="relative group">
                <select 
                    value={filterRarity} 
                    onChange={(e) => setFilterRarity(e.target.value)}
                    className="appearance-none bg-[#1a1a1a] border border-white/10 text-white text-xs font-bold uppercase tracking-wider pl-4 pr-10 py-3 rounded-full hover:border-art-gold/50 focus:outline-none focus:border-art-gold transition-colors"
                >
                    <option value="all">All Rarity</option>
                    <option value="Legendary">Legendary</option>
                    <option value="Rare">Rare</option>
                    <option value="Common">Common</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            </div>

            <div className="relative group">
                <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="appearance-none bg-[#1a1a1a] border border-white/10 text-white text-xs font-bold uppercase tracking-wider pl-4 pr-10 py-3 rounded-full hover:border-art-gold/50 focus:outline-none focus:border-art-gold transition-colors"
                >
                    <option value="all">All Types</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="abstract">Abstract</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            </div>

            <div className="relative group ml-auto">
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-[#1a1a1a] border border-white/10 text-white text-xs font-bold uppercase tracking-wider pl-4 pr-10 py-3 rounded-full hover:border-art-gold/50 focus:outline-none focus:border-art-gold transition-colors"
                >
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
                visibleItems.map((item, idx) => (
                    <MarketCard key={item.id} onClick={() => activeTab === 'collection' ? setViewingItem(item) : setSelectedItem(item)} className={`group bg-[#111] rounded-[32px] overflow-hidden border transition-all flex flex-col animate-fade-in-up ${activeTab === 'collection' ? 'border-art-gold/20 shadow-[0_0_20px_rgba(197,160,89,0.1)]' : 'border-white/5 hover:border-art-gold/40 shadow-lg'}`}>
                        <div className="aspect-[3/4] relative overflow-hidden bg-stone-900">
                            <img src={item.image} loading="lazy" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                            <div className="absolute top-4 left-4 flex gap-2 z-10">
                                {item.rarity !== 'Common' && <span className={`backdrop-blur-md text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border flex items-center gap-1 ${item.rarity === 'Legendary' ? 'bg-art-gold/20 text-art-gold border-art-gold/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'}`}><Crown size={10} /> {item.rarity}</span>}
                            </div>
                            {isOwned(item.id) && <div className="absolute bottom-4 right-4 bg-green-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10"><ShieldCheck size={12} /> Owned</div>}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
                            {activeTab === 'market' && <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500"><LivePrice basePrice={item.basePrice} /></div>}
                        </div>
                        <div className="p-6 space-y-2 flex-1 flex flex-col justify-between relative z-10 bg-[#111]">
                            <div><h3 className="font-serif text-xl text-white group-hover:text-art-gold transition-colors truncate leading-none tracking-tight mb-2">{item.title}</h3><div className="flex items-center justify-between"><p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-medium">{item.artist}</p><ArrowUpRight size={14} className="text-stone-700 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div></div>
                        </div>
                    </MarketCard>
                ))
            ) : (
                <div className="col-span-full py-20 text-center text-stone-500"><Filter size={48} className="mx-auto mb-4 opacity-20" /><p>{activeTab === 'collection' ? '您的私人收藏室空空如也，去市场看看吧' : '没有找到符合条件的藏品'}</p><button onClick={() => { setFilterType('all'); setFilterRarity('all'); if(activeTab === 'collection') setActiveTab('market'); }} className="mt-4 text-art-gold text-xs font-bold uppercase tracking-widest hover:underline">{activeTab === 'collection' ? '前往市场' : '清除筛选'}</button></div>
            )}
        </div>

        {hasMore && visibleItems.length > 0 && <div className="mt-16 flex justify-center pb-12"><button onClick={handleLoadMore} className="group relative px-10 py-4 bg-[#111] border border-white/10 rounded-full text-white overflow-hidden transition-all hover:border-art-gold/50"><div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div><span className="relative z-10 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em]"><Plus size={14} /> 加载更多藏品</span></button></div>}

        {/* Viewing Collection Modal */}
        {viewingItem && (
            <div className="fixed inset-0 z-[2050] bg-black animate-fade-in flex flex-col">
                <div className="absolute top-0 left-0 w-full p-8 z-30 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent"><div><h2 className="text-white/50 text-[10px] font-bold uppercase tracking-[0.4em]">Private Collection</h2></div><button onClick={() => setViewingItem(null)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"><X size={24} /></button></div>
                <div className="flex-1 relative flex items-center justify-center p-12 overflow-hidden"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] pointer-events-none"></div><div className="relative z-10 max-h-full max-w-full shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-scale-in"><div className="bg-[#1a1a1a] p-4 rounded-sm shadow-2xl ring-1 ring-white/10"><div className="relative border-[10px] border-[#2a2a2a] shadow-inner"><img src={viewingItem.image} className="max-h-[75vh] w-auto object-contain" /><div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] pointer-events-none"></div></div></div></div></div>
                <div className="p-10 bg-gradient-to-t from-black via-black/80 to-transparent z-20 text-center"><h1 className="font-serif text-4xl text-white italic mb-2">{viewingItem.title}</h1><p className="text-stone-400 text-sm uppercase tracking-widest">{viewingItem.artist} • {viewingItem.year}</p></div>
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
                            <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border ${selectedItem.rarity === 'Legendary' ? 'bg-art-gold/10 text-art-gold border-art-gold/20' : 'bg-white/10 text-white border-white/20'}`}>{selectedItem.rarity}</span></div></div>
                            <div><h3 className="font-serif text-5xl text-white leading-none mb-2">{selectedItem.title}</h3><p className="text-stone-400 text-lg italic">{selectedItem.artist}, {selectedItem.year}</p></div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4"><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2"><BarChart3 size={14}/> Price History (30d)</span><LivePrice basePrice={selectedItem.basePrice} /></div><PriceGraph data={selectedItem.priceHistory} color={selectedItem.rarity === 'Legendary' ? '#C5A059' : '#ffffff'} /></div>
                            
                            {/* Insufficient Funds Alert */}
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
    </div>
  );
};

export default ArtMarket;
