import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { ArrowRight, User, Bookmark, MessageCircle, Share2, Clock, Zap, Star, X, AlignLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AppleText from './AppleText';
import Sparkle from './Sparkle';

interface ArtJournalProps {
  onNavigate: (view: ViewState) => void;
  isActive?: boolean;
  onArticleOpen?: (isOpen: boolean) => void;
}

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
  <p>在数字时代，我们使用 AI 重新模拟这种光影逻辑。通过深度学习算法，我们试图解构卡拉瓦乔的"光之密码"，探究他是如何通过色彩的叠加来模拟光的散射与衰减。</p>
`;

const DIGITAL_TOOLS_CONTENT = `
  <p>数字画笔不再是对物理画笔的拙劣模仿，它们正在创造一种全新的视觉语言。</p>
  <h3>图层的哲学</h3>
  <p>传统油画依靠罩染法（Glazing）来建立深度，而数字绘画引入了"图层"的概念。这种非破坏性的编辑方式，允许艺术家在不破坏底层结构的情况下，进行无限次的尝试与回溯。这不仅改变了创作流程，更改变了艺术家的思维方式。</p>
  <h3>AI 作为缪斯</h3>
  <p>随着生成式 AI 的介入，艺术家不再是孤独的创作者。AI 可以作为助手，快速生成构图草图、色彩方案，甚至在艺术家的指引下完成繁琐的细节描绘。这种人机协作模式，正在重新定义"作者"的边界。</p>
`;

const KLIMT_GOLD_CONTENT = `
  <p>金色，在克林姆特的画布上，不仅仅是一种颜料，更是一种关于永恒、欲望与死亡的哲学宣言。</p>
  <h3>从装饰到神圣</h3>
  <p>古斯塔夫·克林姆特生于维也纳的金匠世家，这或许解释了他对金箔近乎偏执的热爱。在他的"金色时期"（约1899-1910年），金箔成为了他标志性的艺术语言。《阿黛勒·布洛赫-鲍尔肖像 I》就是这一时期的巅峰之作。</p>
  <p>这幅画中，阿黛勒的面部和双手以写实手法精心描绘，而她的身体和背景则被抽象化、平面化，融入由螺旋、眼睛、三角形等图案组成的金色海洋。这种具象与抽象的碰撞，创造出一种超越时空的神秘感。</p>
  <h3>维也纳的世纪末情绪</h3>
  <p>克林姆特的金色并非单纯的奢华炫耀。在世纪之交的维也纳，弗洛伊德正在挖掘潜意识的深渊，马勒的交响曲充满了对死亡的预感。克林姆特的金色作品同样弥漫着一种甜蜜却令人不安的氛围——美丽与衰亡、爱欲与死亡总是缠绕在一起。</p>
`;

const MONET_WATER_LILIES_CONTENT = `
  <p>莫奈的睡莲，是印象派最后的遗嘱，也是现代抽象艺术的先声。</p>
  <h3>吉维尼的水上花园</h3>
  <p>1893年，莫奈在吉维尼购置了一块土地，引入水源，种下了他的睡莲。此后的三十年，这片水塘成为了他唯一的创作对象。他不再关心教堂、干草堆或伦敦的雾霭，他的整个世界浓缩为这一池碧水。</p>
  <p>晚年的莫奈饱受白内障困扰，但他从未停止创作。有人说，正是逐渐模糊的视力，让他的睡莲从具象走向了抽象——水面、倒影、花朵与光线交融在一起，难以分辨何处是天空，何处是水底。</p>
  <h3>超越印象主义</h3>
  <p>莫奈的睡莲系列，尤其是晚期的巨型壁画，已经远远超越了早期印象派"捕捉光影瞬间"的追求。它们预示了后来的抽象表现主义，甚至被认为影响了杰克逊·波洛克的"满幅画布"（All-over）手法。</p>
`;

const REMBRANDT_SELF_PORTRAIT_CONTENT = `
  <p>伦勃朗一生创作了近百幅自画像，记录了自己从意气风发的青年到落魄潦倒的老者的全部人生历程。</p>
  <h3>画布上的自传</h3>
  <p>没有任何一位艺术家像伦勃朗那样，如此频繁、深入地审视自己。从二十岁出头的少年意气，到三四十岁的成功画家，再到破产后孤独的晚年，每一幅自画像都是一面灵魂的镜子。</p>
  <p>他从不美化自己。在晚年的自画像中，我们看到的是布满皱纹的脸庞、充血的眼睛和破旧的衣衫。但同时，我们也能从那深邃的目光中感受到一种超越世俗苦难的尊严与洞察。</p>
  <h3>光与影的魔法师</h3>
  <p>伦勃朗的光，是从黑暗中浮现的，有别于卡拉瓦乔戏剧性的聚光灯。他的光更柔和、更内省，像是从人物内心深处发出的微弱但不可熄灭的烛光。</p>
`;

const BOTTICELLI_PRIMAVERA_CONTENT = `
  <p>波提切利的《春》，是文艺复兴早期最富诗意、最神秘难解的作品之一。</p>
  <h3>神话与寓言的织锦</h3>
  <p>画面中，从右至左依次出现：西风之神泽费罗斯追逐山林女神克洛里斯，克洛里斯化身为花神弗洛拉；画面中央是爱与美之神维纳斯，头顶飞舞的丘比特正蒙着眼射出爱情之箭；左侧三位手拉着手的优雅女性是美惠三女神；最左边是引领灵魂的墨丘利。</p>
  <p>然而，关于这幅画的真正含义，学界至今众说纷纭。它可能是为美第奇家族的婚礼所作，也可能是对新柏拉图主义哲学的视觉诠释。</p>
  <h3>线条的诗人</h3>
  <p>波提切利的艺术以其流畅、优雅的线条著称。人物的轮廓如同音乐的旋律，衣褶如水般流动。他追求的不是写实的肉体，而是一种超凡脱俗的理想之美。</p>
`;

const FRAGONARD_SWING_CONTENT = `
  <p>弗拉戈纳尔的《秋千》，是洛可可艺术最甜美也最暧昧的代表作。</p>
  <h3>一幅"不可告人"的委托</h3>
  <p>传说这幅画是由一位法国贵族委托创作的。他的要求是：让自己躺在灌木丛中，仰望坐在秋千上的情人。推动秋千的老人，则是那位被蒙在鼓里的主教丈夫。这幅画因此带有一丝戏谑的讽刺意味。</p>
  <p>画中女子的粉色裙裾在空中飞扬，一只绣花鞋脱脚而出——这是一个充满情欲暗示的细节。整幅画弥漫着一种轻佻、欢乐却又转瞬即逝的氛围，完美诠释了洛可可时代法国贵族的享乐主义。</p>
  <h3>粉彩色的世界</h3>
  <p>洛可可艺术的色彩是柔和的、粉嫩的，有别于巴洛克时期浓重的金色和深红。弗拉戈纳尔用轻盈的笔触描绘出阳光穿透树叶的斑驳光影，整幅画仿佛笼罩在一层甜蜜的薄雾中。</p>
`;

const SHISHKIN_FOREST_CONTENT = `
  <p>希什金的森林，是俄罗斯大地灵魂的视觉化身，每一棵松树都像是在吟唱一首关于故土的史诗。</p>
  <h3>俄罗斯的森林之王</h3>
  <p>伊凡·希什金被称为"俄罗斯风景画之父"。他的画室不是密闭的房间，而是辽阔的俄罗斯原野和森林。他能花费数周时间待在同一片林地，观察同一棵树在不同光线下的变化。</p>
  <p>《松树林中的早晨》是他最著名的作品。晨雾弥漫的森林深处，阳光穿透枝叶洒下金色的光柱。四只棕熊在一棵被风暴吹倒的老松树上嬉戏——这是俄罗斯原始森林充满生机的真实写照。（有趣的是，画中的熊并非出自希什金之手，而是由他的朋友康斯坦丁·萨维茨基绘制。）</p>
  <h3>科学与诗意的融合</h3>
  <p>希什金的画作以科学般精确的细节描绘著称。每一根松针、每一片树皮、每一束光线都经过细致的观察和忠实的再现。但这种精确并没有使画面变得枯燥乏味，反而赋予它一种宁静、崇高的诗意。</p>
`;

const LEIGHTON_ACCOLADE_CONTENT = `
  <p>莱顿的《授勋》，是维多利亚时代对骑士精神和浪漫之爱最精致的视觉颂歌。</p>
  <h3>中世纪的幻梦</h3>
  <p>埃德蒙·莱顿是19世纪末英国学院派绑画的代表人物。他沉迷于中世纪的传奇故事和亚瑟王的浪漫骑士精神。《授勋》描绘的是一位贵族女子将骑士之剑轻触在一位跪地青年的肩头，正式赐予他骑士身份的庄重时刻。</p>
  <p>画面的色调以金色和暗红色为主，营造出一种古老城堡或教堂内部的神圣氛围。女子身着洁白长裙，如同圣母一般纯洁；而跪地的骑士则身披铠甲，低头虔诚地接受祝福。</p>
  <h3>对理想之美的追求</h3>
  <p>与同时代的印象派画家追求户外光影、捕捉瞬间感受不同，莱顿等学院派画家更注重构图的完美、技法的精湛和主题的崇高。他们的作品如同精雕细琢的宝石，散发着一种遥远时代的理想光辉。</p>
`;

const ArtJournal: React.FC<ArtJournalProps> = ({ onNavigate, isActive, onArticleOpen }) => {
  const { t } = useLanguage();
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
      onArticleOpen?.(!!selectedArticle);
  }, [selectedArticle, onArticleOpen]);

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
      image: "/artworks/paintings/Water Lilies.jpg",
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
          image: "/artworks/paintings/Luncheon of the Boating Party.jpg",
          category: t('journal.articles.0_cat'),
          author: "Claude AI",
          date: "2025.06.01",
          content: "<p>印象派不仅是艺术运动，更是人类视觉认知的一次飞跃...</p><p>当 AI 试图理解印象派时，它不仅仅是在模仿笔触，更是在学习如何'舍弃'细节，保留'感觉'。</p>"
      },
      {
          title: t('journal.articles.1_title'),
          desc: t('journal.articles.1_desc'),
          image: "/artworks/paintings/Camille Monet in Japanese Costume.jpg",
          category: t('journal.articles.1_cat'),
          author: "History Bot",
          date: "2025.05.28",
          content: "<p>群青色（Ultramarine）在古代比黄金还要昂贵...</p><p>维米尔不惜负债也要使用这种颜料，只为了那一抹头巾的深邃。</p>"
      },
      {
          title: t('journal.articles.2_title'),
          desc: t('journal.articles.2_desc'),
          image: "/artworks/paintings/Lady Godiva.jpg",
          category: t('journal.articles.2_cat'),
          author: "Sarah Jones",
          date: "2025.05.15",
          content: "<p>在男性主导的艺术史中，阿特米希亚用画笔作为武器...</p>"
      },
      {
          title: "被遗忘的笔触：卡拉瓦乔的光影革命",
          desc: "深入探讨米开朗基罗·梅里西·达·卡拉瓦乔如何利用「明暗对照法」彻底改变了巴洛克时期的审美走向。",
          image: "/artworks/paintings/Temptation of St. Anthony, central panel of the triptych.jpg",
          category: "艺术史",
          author: "Lin Yutang",
          date: "2025.05.20",
          content: MOCK_ARTICLE_CONTENT
      },
      {
          title: "克林姆特的金色密码",
          desc: "揭秘维也纳分离派大师古斯塔夫·克林姆特如何将金箔融入油画，创造出一种超越时空的神秘美学。",
          image: "/artworks/paintings/Adele Bloch-Bauer I.jpg",
          category: "艺术家专题",
          author: "Dr. Vienna",
          date: "2025.05.18",
          content: KLIMT_GOLD_CONTENT
      },
      {
          title: "莫奈的睡莲：印象派的最后遗嘱",
          desc: "从吉维尼的水上花园到橘园美术馆的椭圆展厅，追溯莫奈晚年如何将一池碧水变成通往抽象艺术的大门。",
          image: "/artworks/paintings/Water Lilies.jpg",
          category: "艺术史",
          author: "Art Insight",
          date: "2025.05.12",
          content: MONET_WATER_LILIES_CONTENT
      },
      {
          title: "伦勃朗自画像：画布上的灵魂自传",
          desc: "近百幅自画像，记录了荷兰黄金时代最伟大画家从辉煌到落魄的完整人生历程。",
          image: "/artworks/paintings/Saskia as Flora.jpg",
          category: "人物志",
          author: "Museum AI",
          date: "2025.05.08",
          content: REMBRANDT_SELF_PORTRAIT_CONTENT
      },
      {
          title: "波提切利《春》：文艺复兴的神秘寓言",
          desc: "解读这幅充满神话人物与隐秘象征的杰作，探索美第奇家族与新柏拉图主义的精神世界。",
          image: "/artworks/paintings/Primavera (detail – Three Graces).jpg",
          category: "艺术史",
          author: "Renaissance AI",
          date: "2025.05.02",
          content: BOTTICELLI_PRIMAVERA_CONTENT
      },
      {
          title: "《秋千》：洛可可艺术的甜蜜与暧昧",
          desc: "弗拉戈纳尔的这幅画，以轻佻的姿态完美诠释了18世纪法国贵族的享乐主义精神。",
          image: "/artworks/paintings/The Swing.jpg",
          category: "艺术赏析",
          author: "ArtIsLife Editorial",
          date: "2025.04.28",
          content: FRAGONARD_SWING_CONTENT
      },
      {
          title: "希什金的松林：俄罗斯大地的诗篇",
          desc: "伊凡·希什金如何用科学家般的精确和诗人般的热情，将俄罗斯原始森林的壮美永恒定格于画布。",
          image: "/artworks/paintings/Morning in a Pine Forest.jpg",
          category: "自然主义",
          author: "Forest AI",
          date: "2025.04.22",
          content: SHISHKIN_FOREST_CONTENT
      },
      {
          title: "《授勋》：维多利亚时代的骑士幻梦",
          desc: "埃德蒙·莱顿的这幅作品，是对中世纪骑士精神和浪漫之爱最精致的视觉颂歌。",
          image: "/artworks/paintings/The Accolade.jpg",
          category: "拉斐尔前派",
          author: "Knight AI",
          date: "2025.04.15",
          content: LEIGHTON_ACCOLADE_CONTENT
      }
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">
       <div className="space-y-32">
           <div className="text-center space-y-4 animate-fade-in">
                <div className="inline-block px-3 py-1 bg-art-primary/10 text-art-primary rounded-full text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                    {t('journal.tag_curated')}
                </div>
                <div className="relative inline-block">
                  <Sparkle size={36} opacity={0.85} className="absolute -top-6 -left-8 text-art-primary" />
                  <Sparkle size={20} opacity={0.5} className="absolute -top-2 right-0 text-art-accent" />
                  <Sparkle size={14} opacity={0.4} variant="circle" className="absolute top-8 -left-4 text-art-gold" />
                  <Sparkle size={28} opacity={0.6} className="absolute -bottom-4 right-4 text-art-primary" />
                  <Sparkle size={12} opacity={0.35} variant="circle" className="absolute bottom-0 -right-6 text-art-muted" />
                  <h2 className="font-sans font-black text-7xl md:text-9xl text-stone-900 tracking-[-0.05em] leading-none select-none uppercase">
                      {isActive && <AppleText text={t('journal.title')} delay={0.2} />}
                      <span className="text-art-primary">.</span>
                  </h2>
                </div>
                <p className="text-stone-500 font-sans text-lg max-w-xl mx-auto leading-relaxed uppercase tracking-[0.15em] text-sm">
                   {t('journal.subtitle')}
                </p>
           </div>

           <div onClick={() => setSelectedArticle(featured)} className="grid grid-cols-1 lg:grid-cols-12 gap-0 shadow-2xl rounded-[40px] overflow-hidden bg-white border border-stone-100 group cursor-pointer animate-fade-in-up transform transition-transform hover:scale-[1.01]">
                <div className="lg:col-span-7 relative h-[60vh] lg:h-auto overflow-hidden">
                    <FadeInImage src={featured.image} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none"></div>
                </div>
                <div className="lg:col-span-5 p-12 md:p-16 flex flex-col justify-center space-y-8 relative">
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-art-primary">
                        <Bookmark size={14} /> {featured.tag}
                    </div>
                    <h3 className="font-serif text-4xl md:text-5xl text-stone-900 leading-[1.1] first-letter:text-7xl first-letter:font-bold first-letter:mr-1">
                        {featured.title}
                    </h3>
                    <p className="text-stone-500 text-lg leading-relaxed font-light">{featured.desc}</p>
                    <div className="pt-8 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400"><User size={18} /></div>
                            <div>
                                <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">{featured.author}</p>
                                <p className="text-[10px] text-stone-400">{featured.date}</p>
                            </div>
                        </div>
                        <button className="p-4 bg-stone-900 text-white rounded-full hover:bg-art-primary transition-colors"><ArrowRight size={20} /></button>
                    </div>
                </div>
           </div>

           <div className="py-8 border-y border-stone-200 overflow-hidden">
               <div className="flex items-center gap-12 animate-marquee whitespace-nowrap text-stone-400 font-serif italic text-xl">
                   {["Renaissance Secrets", "AI & Art Ethics", "The New Baroque", "Color Theory 101", "Museums of Tomorrow", "Digital Restoration"].map((topic, i) => (
                       <span key={i} className="flex items-center gap-4"><Zap size={16} className="text-art-gold" fill="currentColor" /> {topic}</span>
                   ))}
                   {["Renaissance Secrets", "AI & Art Ethics", "The New Baroque", "Color Theory 101", "Museums of Tomorrow", "Digital Restoration"].map((topic, i) => (
                       <span key={`dup-${i}`} className="flex items-center gap-4"><Zap size={16} className="text-art-gold" fill="currentColor" /> {topic}</span>
                   ))}
               </div>
           </div>

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
                                <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest z-10">{s.category}</div>
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

           <div className="bg-[#1a1a1a] rounded-[48px] p-12 md:p-20 text-white relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-art-primary/10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-[3s]"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <MessageCircle size={40} className="text-art-primary" />
                        <h3 className="font-serif text-4xl md:text-6xl leading-none whitespace-pre-line">{t('journal.newsletter_title')}</h3>
                        <p className="text-stone-400 font-light text-lg">{t('journal.newsletter_desc')}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input type="email" placeholder="Your Email" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:bg-white/10 focus:border-art-primary transition-all text-white" />
                        <button className="bg-white text-black px-10 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-art-primary hover:text-white transition-all">{t('journal.newsletter_btn')}</button>
                    </div>
                </div>
           </div>

           <div className="h-20"></div>
       </div>

       {selectedArticle && (
           <div className="fixed inset-0 z-[2000] bg-white animate-page-enter">
               <div className="fixed top-0 left-0 w-full h-1 bg-stone-100 z-[2020]">
                   <div className="h-full bg-art-primary transition-all duration-100 ease-out" style={{ width: `${readingProgress * 100}%` }}></div>
               </div>
               <button onClick={() => setSelectedArticle(null)} className="fixed top-8 right-8 z-[2030] p-3 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors">
                   <X size={24} className="text-stone-600" />
               </button>
               <div id="article-reader-container" className="h-full overflow-y-auto max-w-full">
                   <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
                       <div className="text-center mb-16 space-y-6 animate-fade-in-up">
                           <span className="text-art-primary text-xs font-bold uppercase tracking-[0.3em]">{selectedArticle.category || selectedArticle.tag}</span>
                           <h1 className="font-serif text-5xl md:text-7xl text-stone-900 leading-tight">{selectedArticle.title}</h1>
                           <div className="flex items-center justify-center gap-4 text-stone-400 text-sm pt-4 border-t border-stone-100 w-fit mx-auto mt-8 px-8">
                               <span className="font-bold uppercase tracking-widest text-stone-800">{selectedArticle.author}</span>
                               <span>-</span>
                               <span className="font-mono">{selectedArticle.date}</span>
                               <span>-</span>
                               <span className="flex items-center gap-2"><Clock size={14}/> 8 min read</span>
                           </div>
                       </div>
                       <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-xl mb-16 animate-scale-in">
                           <FadeInImage src={selectedArticle.image} className="w-full h-full object-cover" />
                       </div>
                       <div className="prose prose-lg prose-stone max-w-none font-serif leading-loose first-letter:text-5xl first-letter:font-bold first-letter:text-art-accent first-letter:float-left first-letter:mr-3 animate-fade-in-up delay-300" dangerouslySetInnerHTML={{ __html: selectedArticle.content || "<p>文章内容正在撰写中...</p>" }}></div>
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
