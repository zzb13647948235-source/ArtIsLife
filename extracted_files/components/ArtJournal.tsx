
import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { ArrowRight, User, Bookmark, MessageCircle, Share2, Clock, Zap, Star, X, AlignLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AppleText from './AppleText';

interface ArtJournalProps {
  onNavigate: (view: ViewState) => void;
  isActive?: boolean;
  onArticleOpen?: (isOpen: boolean) => void;
}

// FadeInImage Component reused locally
const FadeInImage: React.FC<{ src: string; className?: string }> = ({ src, className = "" }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className={`relative overflow-hidden w-full h-full bg-stone-200 ${className}`}>
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-stone-400 opacity-50" />
                </div>
            )}
            <img 
                src={src} 
                className={`w-full h-full object-cover transition-all duration-700 ease-out ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105 blur-sm'}`}
                onLoad={() => setLoaded(true)}
                loading="lazy"
            />
        </div>
    );
};

const MOCK_ARTICLE_CONTENT = `
  <p>光，在艺术的历史长河中，不仅仅是物理现象，更是神性的隐喻。</p>
  <p>当我们凝视卡拉瓦乔（Caravaggio）的画作时，最先被吸引的往往不是画面中的人物，而是那束不知从何而来的强光。这束光像手术刀一样，精准地切开黑暗，将人物的情绪、肌肉的张力以及那一瞬间的戏剧性赤裸裸地暴露在观众面前。</p>
  <h3>明暗对照法的革命</h3>
  <p>在文艺复兴盛期，拉斐尔和米开朗基罗追求的是理想的美、和谐的构图和柔和的光线。然而，卡拉瓦乔打破了这一切。他拒绝理想化，他把圣徒画成了脚底沾满泥土的农民，他让圣母像普通的妇人一样疲惫。</p>
  <p>这就是<b>Chiaroscuro（明暗对照法）</b>的极致运用。通过强烈的明暗对比，卡拉瓦乔创造了一种前所未有的立体感和戏剧张力。这种技法深深影响了后来的伦勃朗、委拉斯开兹，甚至现代电影的布光艺术。</p>
  <h3>被遗忘的与被铭记的</h3>
  <p>尽管在当时备受争议，但卡拉瓦乔的遗产是不可磨灭的。他告诉我们，艺术不需要粉饰太平，真实本身就是一种力量。黑暗并非一无是处，正是因为有了黑暗，光才显得如此耀眼。</p>
  <p>在数字时代，我们使用 AI 重新模拟这种光影逻辑。通过深度学习算法，我们试图解构卡拉瓦乔的“光之密码”，探究他是如何通过色彩的叠加来模拟光的散射与衰减。</p>
`;

const DIGITAL_TOOLS_CONTENT = `
  <p>数字画笔不再是对物理画笔的拙劣模仿，它们正在创造一种全新的视觉语言。</p>
  <h3>图层的哲学</h3>
  <p>传统油画依靠罩染法（Glazing）来建立深度，而数字绘画引入了“图层”的概念。这种非破坏性的编辑方式，允许艺术家在不破坏底层结构的情况下，进行无限次的尝试与回溯。这不仅改变了创作流程，更改变了艺术家的思维方式。</p>
  <h3>AI 作为缪斯</h3>
  <p>随着生成式 AI 的介入，艺术家不再是孤独的创作者。AI 可以作为助手，快速生成构图草图、色彩方案，甚至在艺术家的指引下完成繁琐的细节描绘。这种人机协作模式，正在重新定义“作者”的边界。</p>
`;

const ArtJournal: React.FC<ArtJournalProps> = ({ onNavigate, isActive, onArticleOpen }) => {
  const { t } = useLanguage();
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
      onArticleOpen?.(!!selectedArticle);
  }, [selectedArticle, onArticleOpen]);

  // Article Reader Scroll Progress
  useEffect(() => {
      const handleScroll = (e: Event) => {
          const target = e.target as HTMLElement;
          const progress = target.scrollTop / (target.scrollHeight - target.clientHeight);
          setReadingProgress(progress);
      };

      const reader = document.getElementById('article-reader-container');
      if (reader) reader.addEventListener('scroll', handleScroll);
      return () => reader?.removeEventListener('scroll', handleScroll);
  }, [selectedArticle]);

  const featured = {
      title: '数字工具如何重塑当代绘画技巧',
      desc: '从图层叠加到撤销操作，数字逻辑正在潜移默化地改变艺术家的思维方式。探讨 AI 辅助创作对传统油画技法的冲击与融合。',
      image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070&auto=format&fit=crop",
      author: 'Sophia Chen',
      date: '2025.06.10',
      tag: '深度专栏',
      content: DIGITAL_TOOLS_CONTENT,
      category: 'Tech & Art'
  };

  const stories = [
      {
          title: t('journal.articles.0_title'),
          desc: t('journal.articles.0_desc'),
          image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/800px-Monet_-_Impression%2C_Sunrise.jpg",
          category: t('journal.articles.0_cat'),
          author: "Claude AI",
          date: "2025.06.01",
          content: "<p>印象派不仅是艺术运动，更是人类视觉认知的一次飞跃...</p><p>当 AI 试图理解印象派时，它不仅仅是在模仿笔触，更是在学习如何‘舍弃’细节，保留‘感觉’。</p>"
      },
      {
          title: t('journal.articles.1_title'),
          desc: t('journal.articles.1_desc'),
          image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg",
          category: t('journal.articles.1_cat'),
          author: "History Bot",
          date: "2025.05.28",
          content: "<p>群青色（Ultramarine）在古代比黄金还要昂贵...</p><p>维米尔不惜负债也要使用这种颜料，只为了那一抹头巾的深邃。</p>"
      },
      {
          title: t('journal.articles.2_title'),
          desc: t('journal.articles.2_desc'),
          image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Self-portrait_as_the_Allegory_of_Painting_%28La_Pittura%29_-_Artemisia_Gentileschi.jpg/800px-Self-portrait_as_the_Allegory_of_Painting_%28La_Pittura%29_-_Artemisia_Gentileschi.jpg",
          category: t('journal.articles.2_cat'),
          author: "Sarah Jones",
          date: "2025.05.15",
          content: "<p>在男性主导的艺术史中，阿特米希亚用画笔作为武器...</p>"
      },
      {
          title: "被遗忘的笔触：卡拉瓦乔的光影革命",
          desc: "深入探讨米开朗基罗·梅里西·达·卡拉瓦乔如何利用“明暗对照法”彻底改变了巴洛克时期的审美走向。",
          image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Caravaggio_-_The_Calling_of_Saint_Matthew.jpg/1200px-Caravaggio_-_The_Calling_of_Saint_Matthew.jpg",
          category: "Art History",
          author: "Lin Yutang",
          date: "2025.05.20",
          content: MOCK_ARTICLE_CONTENT
      },
      {
          title: "AI 修复的伦理边界",
          desc: "当我们用算法补全残缺的古希腊雕塑时，我们是在保护历史，还是在篡改记忆？",
          image: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?q=80&w=2070&auto=format&fit=crop",
          category: "Ethics",
          author: "Dr. A. Turing",
          date: "2025.05.10",
          content: "<p>修复不仅仅是技术的展示，更是对历史尊重的体现。</p>"
      },
      {
          title: "对话：当赛博朋克遇见水墨画",
          desc: "专访数字艺术家 Neo-Zhang，谈他是如何将霓虹灯光与传统留白技法结合的。",
          image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
          category: "Interview",
          author: "ArtIsLife Editorial",
          date: "2025.05.05",
          content: "<p>赛博朋克不仅是视觉风格，更是一种对未来的忧思...</p>"
      }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">
       <div className="space-y-32">
           
           {/* Header */}
           <div className="text-center space-y-4 animate-fade-in">
                <div className="inline-block px-3 py-1 bg-art-primary/10 text-art-primary rounded-full text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                    {t('journal.tag_curated')}
                </div>
                <h2 className="font-serif text-7xl md:text-9xl text-stone-900 tracking-tighter leading-none select-none">
                    {isActive && <AppleText text={t('journal.title')} delay={0.2} />}
                    <span className="text-stone-300 italic">.</span>
                </h2>
                <p className="text-stone-500 font-serif italic text-2xl max-w-xl mx-auto leading-relaxed">
                   {t('journal.subtitle')}
                </p>
           </div>

           {/* Featured Section */}
           <div onClick={() => setSelectedArticle(featured)} className="grid grid-cols-1 lg:grid-cols-12 gap-0 shadow-2xl rounded-[40px] overflow-hidden bg-white border border-stone-100 group cursor-pointer animate-fade-in-up transform transition-transform hover:scale-[1.01]">
                <div className="lg:col-span-7 relative h-[60vh] lg:h-auto overflow-hidden">
                    <FadeInImage 
                        src={featured.image} 
                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none"></div>
                </div>
                <div className="lg:col-span-5 p-12 md:p-16 flex flex-col justify-center space-y-8 relative">
                    {/* Featured label inside the card for mobile layout compatibility */}
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-art-primary">
                        <Bookmark size={14} /> {featured.tag}
                    </div>
                    <h3 className="font-serif text-4xl md:text-5xl text-stone-900 leading-[1.1] first-letter:text-7xl first-letter:font-bold first-letter:mr-1">
                        {featured.title}
                    </h3>
                    <p className="text-stone-500 text-lg leading-relaxed font-light">
                        {featured.desc}
                    </p>
                    <div className="pt-8 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">{featured.author}</p>
                                <p className="text-[10px] text-stone-400">{featured.date}</p>
                            </div>
                        </div>
                        <button className="p-4 bg-stone-900 text-white rounded-full hover:bg-art-primary transition-colors">
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
           </div>

           {/* Trending Ticker */}
           <div className="py-8 border-y border-stone-200 overflow-hidden">
               <div className="flex items-center gap-12 animate-marquee whitespace-nowrap text-stone-400 font-serif italic text-xl">
                   {["Renaissance Secrets", "AI & Art Ethics", "The New Baroque", "Color Theory 101", "Museums of Tomorrow", "Digital Restoration"].map((topic, i) => (
                       <span key={i} className="flex items-center gap-4">
                           <Zap size={16} className="text-art-gold" fill="currentColor" /> {topic}
                       </span>
                   ))}
                   {/* Duplicate for seamless loop */}
                   {["Renaissance Secrets", "AI & Art Ethics", "The New Baroque", "Color Theory 101", "Museums of Tomorrow", "Digital Restoration"].map((topic, i) => (
                       <span key={`dup-${i}`} className="flex items-center gap-4">
                           <Zap size={16} className="text-art-gold" fill="currentColor" /> {topic}
                       </span>
                   ))}
               </div>
           </div>

           {/* Stories Grid */}
           <div className="space-y-12">
                <div className="flex items-end justify-between px-2">
                    <h3 className="font-serif text-5xl text-stone-900 italic">{t('journal.section_stories')}</h3>
                    <button className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-art-primary transition-colors flex items-center gap-2">
                        {t('journal.view_archive')} <ArrowRight size={14} />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                    {stories.map((s, idx) => (
                        <div key={idx} onClick={() => setSelectedArticle(s)} className="group cursor-pointer space-y-6 flex flex-col h-full hover:-translate-y-2 transition-transform duration-500">
                            <div className="aspect-[4/3] rounded-[32px] overflow-hidden shadow-soft group-hover:shadow-xl transition-all duration-500 relative">
                                <div className="w-full h-full group-hover:scale-105 transition-transform duration-700">
                                    <FadeInImage src={s.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest z-10">
                                    {s.category}
                                </div>
                            </div>
                            <div className="px-2 space-y-3 flex flex-col flex-1">
                                <h4 className="font-serif text-2xl text-stone-900 group-hover:text-art-primary transition-colors leading-tight">{s.title}</h4>
                                <p className="text-stone-500 text-sm leading-relaxed line-clamp-3">{s.desc}</p>
                                <div className="flex-1"></div>
                                <div className="flex items-center gap-6 pt-4 text-stone-300 border-t border-stone-100 mt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold"><Clock size={12}/> {t('journal.read_time')}</div>
                                    <div className="flex items-center gap-4 ml-auto">
                                        <Share2 size={14} className="hover:text-stone-600 transition-colors" />
                                        <Bookmark size={14} className="hover:text-stone-600 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
           </div>

           {/* Newsletter Banner */}
           <div className="bg-[#1a1a1a] rounded-[48px] p-12 md:p-20 text-white relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-art-primary/10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-[3s]"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <MessageCircle size={40} className="text-art-primary" />
                        <h3 className="font-serif text-4xl md:text-6xl leading-none whitespace-pre-line">{t('journal.newsletter_title')}</h3>
                        <p className="text-stone-400 font-light text-lg">{t('journal.newsletter_desc')}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input 
                            type="email" 
                            placeholder="Your Email" 
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:bg-white/10 focus:border-art-primary transition-all text-white"
                        />
                        <button className="bg-white text-black px-10 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-art-primary hover:text-white transition-all">
                            {t('journal.newsletter_btn')}
                        </button>
                    </div>
                </div>
           </div>

           <div className="h-20"></div>
       </div>

       {/* Article Reader Modal - Full Screen, No Nav */}
       {selectedArticle && (
           <div className="fixed inset-0 z-[2000] bg-white animate-page-enter">
               
               {/* Reading Progress Bar */}
               <div className="fixed top-0 left-0 w-full h-1 bg-stone-100 z-[2020]">
                   <div 
                        className="h-full bg-art-primary transition-all duration-100 ease-out" 
                        style={{ width: `${readingProgress * 100}%` }}
                   ></div>
               </div>

               <button 
                   onClick={() => setSelectedArticle(null)}
                   className="fixed top-8 right-8 z-[2030] p-3 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
               >
                   <X size={24} className="text-stone-600" />
               </button>

               <div id="article-reader-container" className="h-full overflow-y-auto max-w-full">
                   <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
                       <div className="text-center mb-16 space-y-6 animate-fade-in-up">
                           <span className="text-art-primary text-xs font-bold uppercase tracking-[0.3em]">{selectedArticle.category || selectedArticle.tag}</span>
                           <h1 className="font-serif text-5xl md:text-7xl text-stone-900 leading-tight">{selectedArticle.title}</h1>
                           <div className="flex items-center justify-center gap-4 text-stone-400 text-sm pt-4 border-t border-stone-100 w-fit mx-auto mt-8 px-8">
                               <span className="font-bold uppercase tracking-widest text-stone-800">{selectedArticle.author}</span>
                               <span>•</span>
                               <span className="font-mono">{selectedArticle.date}</span>
                               <span>•</span>
                               <span className="flex items-center gap-2"><Clock size={14}/> 8 min read</span>
                           </div>
                       </div>

                       <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl mb-16 animate-scale-in">
                           <img src={selectedArticle.image} className="w-full h-full object-cover" />
                       </div>

                       <div 
                           className="prose prose-lg prose-stone max-w-none font-serif leading-loose first-letter:text-5xl first-letter:font-bold first-letter:text-art-accent first-letter:float-left first-letter:mr-3 animate-fade-in-up delay-300"
                           dangerouslySetInnerHTML={{ __html: selectedArticle.content || "<p>文章内容正在撰写中...</p>" }}
                       >
                       </div>

                       <div className="mt-20 pt-10 border-t border-stone-100 flex justify-between items-center text-stone-400">
                           <div className="flex gap-4">
                               <button className="flex items-center gap-2 hover:text-art-primary transition-colors"><Bookmark size={18} /> Save</button>
                               <button className="flex items-center gap-2 hover:text-art-primary transition-colors"><Share2 size={18} /> Share</button>
                           </div>
                           <span className="font-mono text-xs">End of Article</span>
                       </div>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default ArtJournal;
