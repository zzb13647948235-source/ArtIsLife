
import { GameLevel } from './types';

export const APP_NAME = "ArtIsLife";
export const APP_TAGLINE = "在这里，遇见艺术的灵魂";

export const SAMPLE_PROMPTS = [
  "印象派风格的日出，色彩鲜艳，笔触明显",
  "赛博朋克风格的蒙娜丽莎，霓虹灯光",
  "中国山水画风格的油画，宏大的构图",
  "梵高星空风格的现代城市夜景"
];

export const SUGGESTED_QUESTIONS = [
  "介绍一下印象派的历史背景",
  "谁是世界上最昂贵的油画画家？",
  "如何欣赏抽象派油画？",
  "最近有什么重大的艺术展览？"
];

export const SUGGESTED_LOCATIONS = [
  "Paris, Louvre",
  "New York, Met",
  "London, British Museum",
  "Florence, Uffizi",
  "Amsterdam, Rijksmuseum"
];

export const PRICING_PLANS = [
  {
    id: 'guest',
    name: 'Sketch',
    cnName: '速写客',
    price: '¥0',
    period: '/ 永久免费',
    description: '适合偶尔体验的艺术爱好者。',
    features: [
      '每日 3 次 AI 绘画创作',
      '体验前 2 个修复关卡',
      '基础色彩提示',
      '注册即赠 1,000 ArtCoin',
      '浏览藏馆公开市场',
      '参与每日签到抽奖'
    ],
    highlight: false,
    color: 'bg-white border-stone-200 text-stone-800'
  },
  {
    id: 'artist',
    name: 'Artist',
    cnName: '创作者',
    price: '¥39',
    period: '/ 月',
    description: '解锁完整游戏体验与高清创作。',
    features: [
      '无限次 AI 创作 (2K分辨率)',
      '解锁所有 50+ 大师修复关卡',
      '解锁“智能吸色”功能',
      '修复容错率提升',
      '专属艺术风格滤镜'
    ],
    highlight: true,
    color: 'bg-art-secondary border-art-secondary text-white'
  },
  {
    id: 'patron',
    name: 'Patron',
    cnName: '赞助人',
    price: '¥299',
    period: '/ 年',
    description: '尊贵的艺术赞助身份，享受极致特权。',
    features: [
      '包含所有“创作者”权益',
      'AI 创作支持 4K 超清画质',
      '游戏独占道具：“一键修复” (神来之笔)',
      '尊贵金色头像框',
      '个人主页金色徽章 & 专属客服'
    ],
    highlight: false,
    color: 'bg-[#1a1a1a] border-[#333] text-[#d4af37] ring-1 ring-[#d4af37]/30'
  }
];

export const ART_STYLES = [
  {
    id: 'impressionism',
    name: '印象派',
    enName: 'Impressionism',
    period: '1860s - 1890s',
    color: 'bg-blue-50 border-blue-200',
    works: [
      { 
        title: '鲁昂大教堂，阳光下的入口', 
        artist: '克劳德·莫奈', 
        desc: '莫奈对光与色变化的痴迷，在鲁昂大教堂系列中达到顶峰。他租赁了教堂对面的房间，在一天中的不同时间、不同天气下，描绘了超过30幅教堂正面。这幅画捕捉了阳光直射下的景象，石材的质感几乎消融在灿烂的金色光辉中。',
        imageUrl: '/artworks/paintings/Rouen Cathedral, the Portal in the Sun.jpg'
      },
      { 
        title: '游船上的午餐', 
        artist: '雷诺阿', 
        desc: '阳光透过树叶的缝隙洒落在喧闹的人群身上，形成斑驳的光斑。雷诺阿用甜美明丽的色彩，描绘了巴黎蒙马特高地露天舞会的欢愉时刻，每一张笑脸都洋溢着生活的喜悦。',
        imageUrl: '/artworks/paintings/Luncheon of the Boating Party.jpg'
      }
    ]
  },
  {
    id: 'post-impressionism',
    name: '后印象派',
    enName: 'Post-Impressionism',
    period: '1886 - 1905',
    color: 'bg-yellow-50 border-yellow-200',
    works: [
      { 
        title: '阿尔勒的夜晚露天咖啡座', 
        artist: '文森特·梵高', 
        desc: '梵高用他标志性的高饱和度色彩和厚涂笔触，描绘了法国阿尔勒一家咖啡馆的温暖室外场景。深蓝色的星空与明亮的黄色灯光形成强烈对比，营造出一种既宁静又充满活力的独特氛围。',
        imageUrl: '/artworks/paintings/Cafe Terrace in Arles at Night.jpg'
      },
      { 
        title: '有柏树的麦田', 
        artist: '文森特·梵高', 
        desc: '这是梵高在圣雷米时期创作的系列作品之一。画面中，金色的麦田翻滚着，如同一片燃烧的海洋；而挺拔的柏树则像绿色的火焰，直指天空。强烈的笔触和色彩对比，传达出画家内心炙热的情感和对自然的敬畏。',
        imageUrl: '/artworks/paintings/Wheat Field with Cypresses.jpg'
      }
    ]
  },
  {
    id: 'romanticism',
    name: '浪漫主义',
    enName: 'Romanticism',
    period: '1800 - 1850',
    color: 'bg-red-50 border-red-200',
    works: [
      { 
        title: '暴风雨中的船只',
        artist: '佚名（浪漫主义画派）',
        desc: '一艘孤独的帆船在汹涌的波涛中奋力搏击，乌云翻滚的天空与翻腾的海面几乎融为一体。这种将人类的渺小与自然的狂暴力量并置的构图，正是浪漫主义"崇高"美学的典型体现——在恐惧与敬畏中感受到超越理性的精神震撼。',
        imageUrl: '/artworks/paintings/Ship on Stormy Seas.jpg'
      },
      {
        title: '君士坦丁堡的里安德塔',
        artist: '佚名（浪漫主义画派）',
        desc: '金色的夕阳将君士坦丁堡的天际线染成一片温暖的琥珀色，里安德塔孤独地矗立在波光粼粼的水面之上。这幅作品将东方异域的神秘与自然光影的壮美完美融合，体现了浪漫主义对远方和未知世界的无尽向往。',
        imageUrl: '/artworks/paintings/View of the Leandro Tower in Constantinople.jpg'
      }
    ]
  },
  {
    id: 'realism',
    name: '现实主义',
    enName: 'Realism',
    period: '1840s - 1880s',
    color: 'bg-stone-100 border-stone-200',
    works: [
      { 
        title: '地板刨工', 
        artist: '古斯塔夫·卡耶博特', 
        desc: '卡耶博特以近乎摄影的精确度，描绘了三名工人刨光木地板的场景。强烈的日光从窗户射入，勾勒出工人们结实的肌肉线条和专注的神情。这幅画因其“粗俗”的题材和不加美化的真实感，在当时引起了巨大争议。',
        imageUrl: '/artworks/paintings/Floor Strippers.jpg'
      },
      {
        title: '石工',
        artist: '古斯塔夫·库尔贝',
        desc: '库尔贝在这幅画中描绘了两位石匠的艰苦劳动，一位年老，一位年轻，象征着劳动者无法摆脱的宿命。画家以毫不妥协的真实感，展现了他们破烂的衣衫和疲惫的神态，这幅作品被视为现实主义的宣言。',
        imageUrl: '/artworks/《石工》.png'
      }
    ]
  },
  {
    id: 'abstract-art',
    name: '抽象艺术',
    enName: 'Abstract Art',
    period: '1910 - Present',
    color: 'bg-purple-50 border-purple-200',
    works: [
      { 
        title: '构图八号', 
        artist: '瓦西里·康定斯基', 
        desc: '康定斯基认为色彩和形状具有音乐般的律动。在这幅作品中，锐利的三角形、完美的圆形和舞动的线条交织在一起，构成了一首宏大的视觉交响乐，被视为“热抽象”的巅峰。',
        imageUrl: '/artworks/《构图八号》.webp'
      },
      {
        title: '红、黄、蓝的构成',
        artist: '皮特·蒙德里安',
        desc: '蒙德里安将世界简化为最基本的元素：水平线、垂直线和三原色。这种极致的简约追求宇宙间绝对的和谐与平衡。这种“冷抽象”风格对现代设计、建筑产生了深远的影响。',
        imageUrl: '/artworks/paintings/《红、黄、蓝的构成》.png'
      }
    ]
  },
  {
    id: 'baroque',
    name: '巴洛克',
    enName: 'Baroque',
    period: '1600 - 1750',
    color: 'bg-amber-50 border-amber-200',
    works: [
      {
        title: '劫夺留基伯的女儿',
        artist: '彼得·保罗·鲁本斯',
        desc: '鲁本斯以其戏剧性的构图和动感十足的人物造型著称。这幅画描绘了卡斯托耳和波吕丢刻斯劫走留基伯两个女儿的神话场景，旋转的身体、奔腾的马匹和飘扬的织物交织成一场视觉风暴，是巴洛克运动感的极致体现。',
        imageUrl: '/artworks/paintings/Rape of the Daughters of Leucippus.jpg'
      },
      {
        title: '纺织女工（阿拉克涅的寓言）',
        artist: '迭戈·委拉斯开兹',
        desc: '委拉斯开兹晚年的杰作，前景描绘了皇家挂毯工坊中纺纱女工劳作的日常场景，背景则巧妙地嵌入了希腊神话中阿拉克涅挑战雅典娜的故事。画面以光线和空气感营造出纵深的空间层次，将现实与神话完美交融。',
        imageUrl: '/artworks/paintings/Las hilanderas, o La fábula de Aracne.jpg'
      }
    ]
  },
  {
    id: 'renaissance',
    name: '文艺复兴',
    enName: 'Renaissance',
    period: '1400 - 1600',
    color: 'bg-emerald-50 border-emerald-200',
    works: [
      {
        title: '最后的晚餐',
        artist: '列奥纳多·达·芬奇',
        desc: '达·芬奇用数年时间完成的这幅壁画，描绘了耶稣宣布有人将要出卖他时，十二门徒各自不同的反应。精确的透视法将所有视线引向画面中心的基督，创造出空间的深度和叙事的张力，被誉为西方美术史上最伟大的宗教绘画之一。',
        imageUrl: '/artworks/paintings/Last Supper.jpg'
      },
      {
        title: '春（三美神局部）',
        artist: '桑德罗·波提切利',
        desc: '波提切利的《春》是文艺复兴早期最具诗意的作品之一。画面中三美神手拉着手翩翩起舞，她们的薄纱长裙随风飘动，线条优雅流畅。这幅画展现了对古典美学的追求和对人体之美的赞颂。',
        imageUrl: '/artworks/paintings/Primavera (detail – Three Graces).jpg'
      }
    ]
  },
  {
    id: 'rococo',
    name: '洛可可',
    enName: 'Rococo',
    period: '1720 - 1780',
    color: 'bg-pink-50 border-pink-200',
    works: [
      {
        title: '秋千',
        artist: '让-奥诺雷·弗拉戈纳尔',
        desc: '这幅画是洛可可艺术最具代表性的作品之一。一位贵妇在花园中荡秋千，她的绣花鞋飞出脚尖，裙裾在空中飘荡。整个画面充满了轻盈、甜美与暧昧的气息，体现了18世纪法国贵族生活的享乐主义精神。',
        imageUrl: '/artworks/paintings/The Swing.jpg'
      },
      {
        title: '维纳斯安慰爱神',
        artist: '弗朗索瓦·布歇',
        desc: '布歇是路易十五时期最受宠的宫廷画家。这幅作品中，维纳斯温柔地安慰着小爱神丘比特，柔和的粉色调、丝滑的肌肤质感和精致的花卉背景，展现了洛可可艺术对感官愉悦和装饰性的极致追求。',
        imageUrl: '/artworks/paintings/Venus, consoling Love.jpg'
      }
    ]
  },
  {
    id: 'vienna-secession',
    name: '维也纳分离派',
    enName: 'Vienna Secession',
    period: '1897 - 1920',
    color: 'bg-yellow-50 border-yellow-300',
    works: [
      {
        title: '阿黛勒·布洛赫-鲍尔肖像 I',
        artist: '古斯塔夫·克林姆特',
        desc: '克林姆特"金色时期"的代表作，画面中大量使用了金箔和装饰性的图案。阿黛勒身着华丽的金色长袍，面部以写实手法描绘，而身体和背景则充满了几何与有机图案的交织，创造出一种神圣而迷幻的氛围。',
        imageUrl: '/artworks/paintings/Adele Bloch-Bauer I.jpg'
      },
      {
        title: '女人的三个阶段',
        artist: '古斯塔夫·克林姆特',
        desc: '克林姆特以象征主义的手法描绘了女性生命的三个阶段：年幼的婴儿、盛年的母亲和衰老的妇人。画面用金色装饰线条和花纹包裹人物，将生命的轮回、美与衰老的残酷并置在一起，令人沉思。',
        imageUrl: '/artworks/paintings/The Three Ages of Woman.jpg'
      }
    ]
  },
  {
    id: 'naturalism',
    name: '自然主义',
    enName: 'Naturalism',
    period: '1870 - 1900',
    color: 'bg-green-50 border-green-200',
    works: [
      {
        title: '松树林中的早晨',
        artist: '伊凡·希什金',
        desc: '希什金是俄罗斯风景画的巨匠，这幅画描绘了晨雾弥漫的松树林中，四只棕熊在倒塌的树干上嬉戏的场景。每一根松针、每一片树皮都经过精心描绘，展现了俄罗斯大自然的壮美与生机。',
        imageUrl: '/artworks/paintings/Morning in a Pine Forest.jpg'
      },
      {
        title: '莫斯科附近的正午',
        artist: '伊凡·希什金',
        desc: '广阔的麦田在夏日正午的阳光下延伸至地平线，几棵高大的树木投下长长的阴影。希什金以科学般精确的笔触再现了俄罗斯中部平原的壮阔景色。',
        imageUrl: '/artworks/paintings/Noon. In the vicinity of Moscow.jpg'
      }
    ]
  },
  {
    id: 'pre-raphaelite',
    name: '拉斐尔前派',
    enName: 'Pre-Raphaelitism',
    period: '1848 - 1860s',
    color: 'bg-rose-50 border-rose-200',
    works: [
      {
        title: '授勋',
        artist: '埃德蒙·莱顿',
        desc: '一位身着白色长裙的贵族女子正用长剑为跪在她面前的骑士授勋。画面构图庄重而浪漫，细腻的织物质感和柔和的光线营造出一种中世纪传说般的梦幻氛围。',
        imageUrl: '/artworks/paintings/The Accolade.jpg'
      },
      {
        title: '戈黛瓦夫人',
        artist: '约翰·柯里尔',
        desc: '柯里尔以极其写实的手法描绘了英国传说中的戈黛瓦夫人为减免百姓赋税而裸身骑马穿越考文垂街头的故事，展现了拉斐尔前派对历史传说和女性尊严的崇高致敬。',
        imageUrl: '/artworks/paintings/Lady Godiva.jpg'
      }
    ]
  },
  {
    id: 'dutch-golden-age',
    name: '荷兰黄金时代',
    enName: 'Dutch Golden Age',
    period: '1588 - 1672',
    color: 'bg-orange-50 border-orange-200',
    works: [
      {
        title: '扮作花神的莎斯姬亚',
        artist: '伦勃朗·凡·莱因',
        desc: '伦勃朗以妻子莎斯姬亚为模特，将她描绘成古罗马花神弗洛拉的形象。她头戴花冠，手持花束，柔和的光线照亮她温柔的面庞，将亲密的私人情感融入神话的宏大叙事中。',
        imageUrl: '/artworks/paintings/Saskia as Flora.jpg'
      },
      {
        title: '自画像',
        artist: '伦勃朗·凡·莱因',
        desc: '伦勃朗一生创作了近百幅自画像，被称为"画布上的自传"。这幅晚年自画像中，饱经沧桑的面容在暗色背景中浮现，深邃的目光中饱含着对人生的洞察和对艺术的执着。',
        imageUrl: '/artworks/paintings/Self-Portrait.jpg'
      }
    ]
  }
];

// Expanded 100+ Art Collection for Market & Game
export const MASTERPIECE_COLLECTION = [
    { title: "A Bar at the Folies-Bergère", artist: "Édouard Manet", url: "/artworks/paintings/A Bar at the Folies-Bergere.jpg", type: "portrait", year: "1882" },
    { title: "Portrait of Adele Bloch-Bauer I", artist: "Gustav Klimt", url: "/artworks/paintings/Adele Bloch-Bauer I.jpg", type: "portrait", year: "1907" },
    { title: "Blossoming Almond Tree", artist: "Vincent van Gogh", url: "/artworks/paintings/Blossoming Almond Tree.jpg", type: "landscape", year: "1890" },
    { title: "Cafe Terrace at Night", artist: "Vincent van Gogh", url: "/artworks/paintings/Cafe Terrace in Arles at Night.jpg", type: "landscape", year: "1888" },
    { title: "Camille Monet in Japanese Costume", artist: "Claude Monet", url: "/artworks/paintings/Camille Monet in Japanese Costume.jpg", type: "portrait", year: "1876" },
    { title: "Danaë", artist: "Gustav Klimt", url: "/artworks/paintings/Danae.jpg", type: "portrait", year: "1907" },
    { title: "The Floor Scrapers", artist: "Gustave Caillebotte", url: "/artworks/paintings/Floor Strippers.jpg", type: "realism", year: "1875" },
    { title: "Irises", artist: "Vincent van Gogh", url: "/artworks/paintings/Irises.jpg", type: "landscape", year: "1889" },
    { title: "Lady Godiva", artist: "John Collier", url: "/artworks/paintings/Lady Godiva.jpg", type: "portrait", year: "1898" },
    { title: "Landscape at Auvers after the Rain", artist: "Vincent van Gogh", url: "/artworks/paintings/Landscape at Auvers after Rain.jpg", type: "landscape", year: "1890" },
    { title: "Las Hilanderas", artist: "Diego Velázquez", url: "/artworks/paintings/Las hilanderas, o La fábula de Aracne.jpg", type: "portrait", year: "1657" },
    { title: "The Last Supper", artist: "Leonardo da Vinci", url: "/artworks/paintings/Last Supper.jpg", type: "portrait", year: "1498" },
    { title: "Luncheon of the Boating Party", artist: "Pierre-Auguste Renoir", url: "/artworks/paintings/Luncheon of the Boating Party.jpg", type: "portrait", year: "1881" },
    { title: "Madonna Litta", artist: "Leonardo da Vinci", url: "/artworks/paintings/Madonna Litta.jpg", type: "portrait", year: "1490" },
    { title: "Morning in a Pine Forest", artist: "Ivan Shishkin", url: "/artworks/paintings/Morning in a Pine Forest.jpg", type: "landscape", year: "1889" },
    { title: "Paris Street; Rainy Day", artist: "Gustave Caillebotte", url: "/artworks/paintings/Paris place de l Europe.jpg", type: "landscape", year: "1877" },
    { title: "The Artist's Garden at Giverny", artist: "Claude Monet", url: "/artworks/paintings/Path under the Rose Trellises.jpg", type: "landscape", year: "1900" },
    { title: "Portrait of the Postman Joseph Roulin", artist: "Vincent van Gogh", url: "/artworks/paintings/Portrait of the Postman Joseph Roulin.jpg", type: "portrait", year: "1889" },
    { title: "Primavera", artist: "Sandro Botticelli", url: "/artworks/paintings/Primavera (detail – Three Graces).jpg", type: "portrait", year: "1482" },
    { title: "Rape of the Daughters of Leucippus", artist: "Peter Paul Rubens", url: "/artworks/paintings/Rape of the Daughters of Leucippus.jpg", type: "portrait", year: "1618" },
    { title: "Tree Roots", artist: "Vincent van Gogh", url: "/artworks/paintings/Roots and Tree Trunks.jpg", type: "abstract", year: "1890" },
    { title: "Rouen Cathedral, the Portal in the Sun", artist: "Claude Monet", url: "/artworks/paintings/Rouen Cathedral, the Portal in the Sun.jpg", type: "landscape", year: "1894" },
    { title: "Saskia as Flora", artist: "Rembrandt", url: "/artworks/paintings/Saskia as Flora.jpg", type: "portrait", year: "1634" },
    { title: "The Temptation of St. Anthony", artist: "Hieronymus Bosch", url: "/artworks/paintings/Temptation of St. Anthony, central panel of the triptych.jpg", type: "abstract", year: "1501" },
    { title: "The Accolade", artist: "Edmund Leighton", url: "/artworks/paintings/The Accolade.jpg", type: "portrait", year: "1901" },
    { title: "Woman with a Parasol - Madame Monet and Her Son", artist: "Claude Monet", url: "/artworks/paintings/The Promenade, Woman with a Parasol.jpg", type: "portrait", year: "1875" },
    { title: "The Swing", artist: "Jean-Honoré Fragonard", url: "/artworks/paintings/The Swing.jpg", type: "portrait", year: "1767" },
    { title: "The Three Ages of Woman", artist: "Gustav Klimt", url: "/artworks/paintings/The Three Ages of Woman.jpg", type: "portrait", year: "1905" },
    { title: "The Bridge at Argenteuil", artist: "Claude Monet", url: "/artworks/paintings/The bridge of Argentueil.jpg", type: "landscape", year: "1874" },
    { title: "Venus Consoling Love", artist: "François Boucher", url: "/artworks/paintings/Venus, consoling Love.jpg", type: "portrait", year: "1751" },
    { title: "Bedroom in Arles", artist: "Vincent van Gogh", url: "/artworks/paintings/Vincent s Bedroom in Arles.jpg", type: "landscape", year: "1888" },
    { title: "Water Lilies", artist: "Claude Monet", url: "/artworks/paintings/Water Lilies.jpg", type: "landscape", year: "1919" },
    { title: "Wheat Field with Cypresses", artist: "Vincent van Gogh", url: "/artworks/paintings/Wheat Field with Cypresses.jpg", type: "landscape", year: "1889" },
    { title: "Delphic Sibyl", artist: "Michelangelo", url: "/artworks/paintings/Дельфийская сивилла.jpg", type: "portrait", year: "1509" },
    { title: "Composition VIII", artist: "Wassily Kandinsky", url: "/artworks/《构图八号》.webp", type: "abstract", year: "1923" },
    { title: "The Stone Breakers", artist: "Gustave Courbet", url: "/artworks/《石工》.png", type: "realism", year: "1849" },
    // TODO: Verify title, artist, type, and year for the artworks below
    { title: "A Reclining Nude on a Day Bed", artist: "Unknown Artist", url: "/artworks/paintings/A Reclining Nude on a Day Bed.jpg", type: "unknown", year: "unknown" },
    { title: "A Young Girl Leaning on a Window", artist: "Unknown Artist", url: "/artworks/paintings/A Young Girl Leaning on a Window.jpg", type: "unknown", year: "unknown" },
    { title: "Acrobats at the Cirque Fernando (Francisca and Angelina Wartenberg)", artist: "Pierre-Auguste Renoir", url: "/artworks/paintings/Acrobats at the Cirque Fernando (Francisca and Angelina Wartenberg).jpg", type: "portrait", year: "1879" },
    { title: "Allegory of Sculpture", artist: "Unknown Artist", url: "/artworks/paintings/Allegory of Sculpture.jpg", type: "unknown", year: "unknown" },
    { title: "An Incantation", artist: "Unknown Artist", url: "/artworks/paintings/An Incantation.jpg", type: "unknown", year: "unknown" },
    { title: "Bambina con il Gatto Nero in Braccio 1885", artist: "Unknown Artist", url: "/artworks/paintings/Bambina con il Gatto Nero in Braccio 1885.jpg", type: "unknown", year: "unknown" },
    { title: "Culture Flemish", artist: "Unknown Artist", url: "/artworks/paintings/Culture Flemish.jpg", type: "unknown", year: "unknown" },
    { title: "Diana and Endymion", artist: "Unknown Artist", url: "/artworks/paintings/Diana and Endymion.jpg", type: "unknown", year: "unknown" },
    { title: "Dragonfly (Painter’s daughter portrait)", artist: "Unknown Artist", url: "/artworks/paintings/Dragonfly (Painter’s daughter portrait).jpg", type: "unknown", year: "unknown" },
    { title: "Evening In Cairo", artist: "Unknown Artist", url: "/artworks/paintings/Evening In Cairo.jpg", type: "unknown", year: "unknown" },
    { title: "Gimblette", artist: "Unknown Artist", url: "/artworks/paintings/Gimblette.jpg", type: "unknown", year: "unknown" },
    { title: "Girl with a dog", artist: "Unknown Artist", url: "/artworks/paintings/Girl with a dog.jpg", type: "unknown", year: "unknown" },
    { title: "Head of a Dog", artist: "Édouard Manet", url: "/artworks/paintings/Head of a Dog.jpg", type: "portrait", year: "1876" },
    { title: "Infanta Margaraita", artist: "Diego Velázquez", url: "/artworks/paintings/Infanta Margaraita.jpg", type: "portrait", year: "1659" },
    { title: "Jeanne Samary (also known as La Reverie)", artist: "Pierre-Auguste Renoir", url: "/artworks/paintings/Jeanne Samary (also known as La Reverie).jpg", type: "portrait", year: "1877" },
    { title: "Leda and the Swan (Francesco Melzi)", artist: "Francesco Melzi", url: "/artworks/paintings/Leda and the Swan (Francesco Melzi).jpg", type: "portrait", year: "1515" },
    { title: "Mars and Venus surprised by Vulcan", artist: "Unknown Artist", url: "/artworks/paintings/Mars and Venus surprised by Vulcan.jpg", type: "unknown", year: "unknown" },
    { title: "Mme. Manet and her son", artist: "Édouard Manet", url: "/artworks/paintings/Mme. Manet and her son.jpg", type: "portrait", year: "1868" },
    { title: "Model", artist: "Unknown Artist", url: "/artworks/paintings/Model.jpg", type: "unknown", year: "unknown" },
    { title: "Noon. In the vicinity of Moscow", artist: "Ivan Shishkin", url: "/artworks/paintings/Noon. In the vicinity of Moscow.jpg", type: "landscape", year: "1869" },
    { title: "Nu Sur La Plage", artist: "Unknown Artist", url: "/artworks/paintings/Nu Sur La Plage.jpg", type: "unknown", year: "unknown" },
    { title: "Nude Fixing Her Hair", artist: "Pierre-Auguste Renoir", url: "/artworks/paintings/Nude Fixing Her Hair.jpg", type: "portrait", year: "1885" },
    { title: "Nude Woman Reclining, Seen from the Back", artist: "Unknown Artist", url: "/artworks/paintings/Nude Woman Reclining, Seen from the Back.jpg", type: "unknown", year: "unknown" },
    { title: "Nude on sofa (Miss O Murphy)", artist: "François Boucher", url: "/artworks/paintings/Nude on sofa (Miss O Murphy).jpg", type: "portrait", year: "1752" },
    { title: "Odalisque", artist: "Unknown Artist", url: "/artworks/paintings/Odalisque.jpg", type: "unknown", year: "unknown" },
    { title: "Portrait of a Lady with a Lap Dog", artist: "Unknown Artist", url: "/artworks/paintings/Portrait of a Lady with a Lap Dog.jpg", type: "unknown", year: "unknown" },
    { title: "Rest", artist: "Unknown Artist", url: "/artworks/paintings/Rest.jpg", type: "unknown", year: "unknown" },
    { title: "Rouen Cathedral, the Portal, Morning Fog", artist: "Claude Monet", url: "/artworks/paintings/Rouen Cathedral, the Portal, Morning Fog.jpg", type: "landscape", year: "1894" },
    { title: "Self-Portrait", artist: "Rembrandt", url: "/artworks/paintings/Self-Portrait.jpg", type: "portrait", year: "1660" },
    { title: "Ship on Stormy Seas", artist: "Unknown Artist", url: "/artworks/paintings/Ship on Stormy Seas.jpg", type: "unknown", year: "unknown" },
    { title: "The Beautiful Servant", artist: "Unknown Artist", url: "/artworks/paintings/The Beautiful Servant.jpg", type: "unknown", year: "unknown" },
    { title: "The Boat (Claude Monet, with Madame Monet, Working on his Boat in Argenteuil)", artist: "Édouard Manet", url: "/artworks/paintings/The Boat (Claude Monet, with Madame Monet, Working on his Boat in Argenteuil).jpg", type: "portrait", year: "1874" },
    { title: "The Gypsy Girl (also known as Summer)", artist: "Frans Hals", url: "/artworks/paintings/The Gypsy Girl (also known as Summer).jpg", type: "portrait", year: "1628" },
    { title: "The Hermit and the Sleeping Angelica", artist: "Unknown Artist", url: "/artworks/paintings/The Hermit and the Sleeping Angelica.jpg", type: "unknown", year: "unknown" },
    { title: "The Isleworth Mona Lisa", artist: "Unknown Artist", url: "/artworks/paintings/The Isleworth Mona Lisa.jpg", type: "unknown", year: "unknown" },
    { title: "The Raised Skirt", artist: "Unknown Artist", url: "/artworks/paintings/The Raised Skirt.jpg", type: "unknown", year: "unknown" },
    { title: "Torso (also known as Bust of a Woman) – 1873", artist: "Unknown Artist", url: "/artworks/paintings/Torso (also known as Bust of a Woman) – 1873.jpg", type: "unknown", year: "unknown" },
    { title: "View of the Leandro Tower in Constantinople", artist: "Unknown Artist", url: "/artworks/paintings/View of the Leandro Tower in Constantinople.jpg", type: "unknown", year: "unknown" },
    { title: "Walk in the forest", artist: "Unknown Artist", url: "/artworks/paintings/Walk in the forest.jpg", type: "unknown", year: "unknown" },
    { title: "Water Lilies (02)", artist: "Claude Monet", url: "/artworks/paintings/Water Lilies (02).jpg", type: "landscape", year: "1916" },
    { title: "Water Lilies, 1916-19 03", artist: "Claude Monet", url: "/artworks/paintings/Water Lilies, 1916-19 03.jpg", type: "landscape", year: "1919" },
    { title: "Waterloo Bridge, Sunlight Effect 2", artist: "Claude Monet", url: "/artworks/paintings/Waterloo Bridge, Sunlight Effect 2.jpg", type: "landscape", year: "1903" },
    { title: "Woman with a Parasol, Facing Right", artist: "Claude Monet", url: "/artworks/paintings/Woman with a Parasol, Facing Right.jpg", type: "portrait", year: "1886" },
    { title: "Young woman taking a footbath", artist: "Unknown Artist", url: "/artworks/paintings/Young woman taking a footbath.jpg", type: "unknown", year: "unknown" }
];

// Dynamically generate levels from the masterpiece collection
export const GAME_LEVELS: GameLevel[] = MASTERPIECE_COLLECTION.map((art, index) => ({
    id: index + 1,
    title: art.title,
    artist: art.artist,
    year: art.year,
    imageUrl: art.url,
    description: `探索${art.artist}的经典之作《${art.title}》。体会${art.year}年的色彩哲学。`,
    isPremium: index > 2, // First 3 free
    difficulty: Math.min(5, Math.floor(index / 10) + 1) as any,
    palette: ['#2B2B2B', '#E6E6E6', '#C5A059', '#BC4B1A', '#3B5975'], // Mock palette for now
    regions: [
        { id: 1, x: 30 + (index * 7) % 40, y: 30 + (index * 5) % 40, color: '#BC4B1A', radius: 15 + (index % 10), hint: 'Warm tone area' },
        { id: 2, x: 60 + (index * 3) % 30, y: 60 + (index * 4) % 30, color: '#3B5975', radius: 20, hint: 'Cool shadow area' }
    ]
}));
