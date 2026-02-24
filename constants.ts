
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
    era: '19世纪',
    region: '法国',
    medium: '油画',
    tags: ['光影', '户外', '色彩', '笔触'],
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
    era: '19世纪末',
    region: '法国',
    medium: '油画',
    tags: ['情感', '色彩', '笔触', '表现'],
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
    era: '19世纪初',
    region: '欧洲',
    medium: '油画',
    tags: ['情感', '自然', '崇高', '历史'],
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
    era: '19世纪',
    region: '法国',
    medium: '油画',
    tags: ['劳动', '社会', '写实', '日常'],
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
    era: '20世纪',
    region: '欧洲',
    medium: '混合媒介',
    tags: ['几何', '色彩', '形式', '精神'],
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
    era: '17世纪',
    region: '欧洲',
    medium: '油画',
    tags: ['戏剧', '光影', '运动', '宗教'],
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
    era: '15-16世纪',
    region: '意大利',
    medium: '壁画/油画',
    tags: ['人文', '宗教', '透视', '古典'],
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
    era: '18世纪',
    region: '法国',
    medium: '油画',
    tags: ['装饰', '优雅', '享乐', '贵族'],
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
    era: '19世纪末',
    region: '奥地利',
    medium: '油画/装饰',
    tags: ['装饰', '象征', '金色', '女性'],
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
    era: '19世纪',
    region: '俄罗斯',
    medium: '油画',
    tags: ['自然', '风景', '写实', '细节'],
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
    era: '19世纪',
    region: '英国',
    medium: '油画',
    tags: ['中世纪', '文学', '细节', '女性'],
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
    era: '17世纪',
    region: '荷兰',
    medium: '油画',
    tags: ['肖像', '光影', '写实', '日常'],
    works: [
      {
        title: '扮作花神的莎斯姬亚',
        artist: '伦勃朗·凡·莱因',
        desc: '伦勃朗以妻子莎斯姬亚为模特，将她描绘成古罗马花神弗洛拉的形象。她头戴花冠，手持花束，柔和的光线照亮她温柔的面庞，将亲密的私人情感融入神话的宏大叙事中。',
        imageUrl: '/artworks/paintings/Saskia as Flora.jpg'
      },
      {
        title: '夜巡',
        artist: '伦勃朗·凡·莱因',
        desc: '这是西方美术史上最著名的群像画之一。伦勃朗打破了传统群像画的静态构图，将阿姆斯特丹民兵队描绘成正在出发巡逻的动态场景。强烈的明暗对比和戏剧性的光线，赋予了画面震撼人心的生命力。',
        imageUrl: '/artworks/paintings/Rembrandt - The Night Watch.jpg'
      }
    ]
  },
  {
    id: 'neoclassicism',
    name: '新古典主义',
    enName: 'Neoclassicism',
    period: '1760 - 1850',
    color: 'bg-slate-50 border-slate-200',
    era: '18-19世纪',
    region: '法国',
    medium: '油画',
    tags: ['理性', '历史', '英雄', '古典'],
    works: [
      {
        title: '荷拉斯兄弟之誓',
        artist: '雅克-路易·大卫',
        desc: '大卫以古罗马英雄主义题材，创作了这幅新古典主义的奠基之作。三兄弟向父亲宣誓为国捐躯，刚毅的姿态与悲泣的女眷形成强烈对比。严谨的构图和冷峻的色调，传达出理性与牺牲精神的崇高。',
        imageUrl: '/artworks/paintings/David - Oath of the Horatii.jpg'
      },
      {
        title: '马拉之死',
        artist: '雅克-路易·大卫',
        desc: '法国大革命的视觉纪念碑。大卫以近乎宗教圣像的庄严感，描绘了革命领袖马拉在浴缸中遇刺的场景。极简的构图、强烈的光影和手中未放下的笔，将一个政治事件升华为永恒的殉道图像。',
        imageUrl: '/artworks/paintings/David - The Death of Marat.jpg'
      }
    ]
  },
  {
    id: 'spanish-golden-age',
    name: '西班牙黄金时代',
    enName: 'Spanish Golden Age',
    period: '1550 - 1700',
    color: 'bg-red-50 border-red-300',
    era: '16-17世纪',
    region: '西班牙',
    medium: '油画',
    tags: ['宗教', '宫廷', '戏剧', '光影'],
    works: [
      {
        title: '宫娥',
        artist: '迭戈·委拉斯开兹',
        desc: '西方绘画史上最神秘的杰作之一。画面中，委拉斯开兹本人正在作画，小公主玛格丽特被侍女环绕，而背景镜中隐约映出国王夫妇的身影。这幅画对观看者与被观看者关系的探讨，令后世艺术家和哲学家着迷不已。',
        imageUrl: '/artworks/paintings/Velazquez - Las Meninas.jpg'
      },
      {
        title: '托莱多风景',
        artist: '埃尔·格列柯',
        desc: '格列柯以扭曲拉长的人物和强烈的色彩著称，而这幅风景画则展现了他另一面的天才。乌云翻滚的天空笼罩着古城托莱多，绿色的山丘与灰白的建筑在暴风雨前的光线中显得神秘而震撼，被视为西方风景画的先驱之作。',
        imageUrl: '/artworks/paintings/El Greco - View of Toledo.jpg'
      }
    ]
  },
  {
    id: 'expressionism',
    name: '表现主义',
    enName: 'Expressionism',
    period: '1890 - 1940',
    color: 'bg-gray-100 border-gray-300',
    era: '19世纪末-20世纪初',
    region: '北欧/中欧',
    medium: '油画',
    tags: ['焦虑', '情感', '扭曲', '内心'],
    works: [
      {
        title: '呐喊',
        artist: '爱德华·蒙克',
        desc: '这是现代艺术史上最具辨识度的图像之一。蒙克描绘了一个在血红色天空下发出无声呐喊的人物，扭曲的线条和强烈的色彩将人类内心深处的焦虑与存在主义恐惧外化为视觉语言，成为现代人精神困境的永恒象征。',
        imageUrl: '/artworks/paintings/Munch - The Scream.jpg'
      },
      {
        title: '带绷带的自画像',
        artist: '文森特·梵高',
        desc: '梵高在割掉自己耳朵后不久创作了这幅自画像。他以平静而直接的目光注视着观者，包扎的耳朵和厚重的冬衣诉说着刚刚经历的痛苦。这幅画是梵高内心世界最真实的写照，也是艺术史上最令人动容的自我审视之一。',
        imageUrl: '/artworks/paintings/Van Gogh - Self-Portrait with Bandaged Ear.jpg'
      }
    ]
  },
  {
    id: 'cubism-fauvism',
    name: '立体主义与野兽派',
    enName: 'Cubism & Fauvism',
    period: '1905 - 1940',
    color: 'bg-violet-50 border-violet-200',
    era: '20世纪初',
    region: '法国',
    medium: '油画',
    tags: ['解构', '色彩', '形式', '革命'],
    works: [
      {
        title: '格尔尼卡',
        artist: '巴勃罗·毕加索',
        desc: '毕加索为抗议纳粹德国轰炸西班牙小镇格尔尼卡而创作的这幅巨作，是20世纪最有力的反战宣言。黑白灰的色调、破碎扭曲的人体与动物，将战争的恐怖与人类的苦难凝固成永恒的控诉，震撼着每一位观者的良知。',
        imageUrl: '/artworks/paintings/Picasso - Guernica.jpg'
      },
      {
        title: '舞蹈',
        artist: '亨利·马蒂斯',
        desc: '马蒂斯用最简洁的线条和最纯粹的色彩，描绘了五个裸体人物手拉手围成圆圈起舞的场景。鲜艳的红色人体、蓝色天空和绿色大地，构成了一首关于生命、喜悦与自由的视觉颂歌，是野兽派艺术的巅峰之作。',
        imageUrl: '/artworks/paintings/Matisse - The Dance.jpg'
      }
    ]
  },
  {
    id: 'russian-realism',
    name: '俄罗斯现实主义',
    enName: 'Russian Realism',
    period: '1860 - 1900',
    color: 'bg-cyan-50 border-cyan-200',
    era: '19世纪',
    region: '俄罗斯',
    medium: '油画',
    tags: ['社会', '历史', '民族', '批判'],
    works: [
      {
        title: '伊凡雷帝杀子',
        artist: '伊利亚·列宾',
        desc: '列宾以极度写实的手法，描绘了俄国沙皇伊凡雷帝在盛怒之下杀死亲生儿子后的悔恨瞬间。父亲颤抖的双手捂住儿子的伤口，儿子垂死的眼神中没有怨恨，只有宽恕。这幅画因过于震撼而曾被沙皇下令禁止展出。',
        imageUrl: '/artworks/paintings/Ivan the Terrible and His Son Ivan.jpg'
      },
      {
        title: '博亚里娜·莫罗佐娃',
        artist: '瓦西里·苏里科夫',
        desc: '苏里科夫描绘了17世纪俄国宗教改革中，贵族女信徒莫罗佐娃被押送流放时高举两指（旧礼仪派手势）的悲壮场景。雪地上的囚车、围观人群的各异神情，构成了一幅震撼人心的历史画卷，是俄罗斯历史画的巅峰之作。',
        imageUrl: '/artworks/paintings/Surikov - Boyarina Morozova.jpg'
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
    { title: "Young woman taking a footbath", artist: "Unknown Artist", url: "/artworks/paintings/Young woman taking a footbath.jpg", type: "unknown", year: "unknown" },
    // --- New 40 paintings from Gallerix ---
    { title: "Ivan the Terrible and His Son Ivan", artist: "Ilya Repin", url: "/artworks/paintings/Ivan the Terrible and His Son Ivan.jpg", type: "realism", year: "1885" },
    { title: "Cossacks Reply to the Sultan", artist: "Ilya Repin", url: "/artworks/paintings/Cossacks Reply to the Sultan.jpg", type: "realism", year: "1891" },
    { title: "Haulers on the Volga", artist: "Ilya Repin", url: "/artworks/paintings/Haulers on the Volga.jpg", type: "realism", year: "1873" },
    { title: "Did Not Wait", artist: "Ilya Repin", url: "/artworks/paintings/Did Not Wait.jpg", type: "realism", year: "1884" },
    { title: "David with the Head of Goliath", artist: "Caravaggio", url: "/artworks/paintings/Caravaggio - David with the Head of Goliath.jpg", type: "portrait", year: "1610" },
    { title: "Calling of Saint Matthew", artist: "Caravaggio", url: "/artworks/paintings/Caravaggio - Calling of Saint Matthew.jpg", type: "portrait", year: "1600" },
    { title: "Judith and Holofernes", artist: "Caravaggio", url: "/artworks/paintings/Caravaggio - Judith and Holofernes.jpg", type: "portrait", year: "1599" },
    { title: "Bacchus", artist: "Caravaggio", url: "/artworks/paintings/Caravaggio - Bacchus.jpg", type: "portrait", year: "1595" },
    { title: "Narcissus", artist: "Caravaggio", url: "/artworks/paintings/Caravaggio - Narcissus.jpg", type: "portrait", year: "1599" },
    { title: "The Cardsharps", artist: "Caravaggio", url: "/artworks/paintings/Caravaggio - The Cardsharps.jpg", type: "portrait", year: "1594" },
    { title: "Liberty Leading the People", artist: "Eugène Delacroix", url: "/artworks/paintings/Delacroix - Liberty Leading the People.jpg", type: "realism", year: "1830" },
    { title: "The Death of Sardanapalus", artist: "Eugène Delacroix", url: "/artworks/paintings/Delacroix - The Death of Sardanapalus.jpg", type: "portrait", year: "1827" },
    { title: "The Massacre at Chios", artist: "Eugène Delacroix", url: "/artworks/paintings/Delacroix - The Massacre at Chios.jpg", type: "realism", year: "1824" },
    { title: "The Women of Algiers", artist: "Eugène Delacroix", url: "/artworks/paintings/Delacroix - The Women of Algiers.jpg", type: "portrait", year: "1834" },
    { title: "The Ninth Wave", artist: "Ivan Aivazovsky", url: "/artworks/paintings/Aivazovsky - The Ninth Wave.jpg", type: "landscape", year: "1850" },
    { title: "Rainbow", artist: "Ivan Aivazovsky", url: "/artworks/paintings/Aivazovsky - Rainbow.jpg", type: "landscape", year: "1873" },
    { title: "The Black Sea", artist: "Ivan Aivazovsky", url: "/artworks/paintings/Aivazovsky - The Black Sea.jpg", type: "landscape", year: "1881" },
    { title: "Marriage of the Virgin", artist: "Raphael", url: "/artworks/paintings/Raphael - Marriage of the Virgin.jpg", type: "portrait", year: "1504" },
    { title: "Three Graces", artist: "Raphael", url: "/artworks/paintings/Raphael - Three Graces.jpg", type: "portrait", year: "1504" },
    { title: "Transfiguration of Christ", artist: "Raphael", url: "/artworks/paintings/Raphael - Transfiguration of Christ.jpg", type: "portrait", year: "1520" },
    { title: "The Last Day of Pompeii", artist: "Karl Bryullov", url: "/artworks/paintings/Brullov - The Last Day of Pompeii.jpg", type: "realism", year: "1833" },
    { title: "Italian Afternoon", artist: "Karl Bryullov", url: "/artworks/paintings/Brullov - Italian Afternoon.jpg", type: "portrait", year: "1827" },
    { title: "Rider", artist: "Karl Bryullov", url: "/artworks/paintings/Brullov - Rider.jpg", type: "portrait", year: "1832" },
    { title: "Bathsheba", artist: "Karl Bryullov", url: "/artworks/paintings/Brullov - Bathsheba.jpg", type: "portrait", year: "1832" },
    { title: "Italian Morning", artist: "Karl Bryullov", url: "/artworks/paintings/Brullov - Italian Morning.jpg", type: "portrait", year: "1823" },
    { title: "Hylas and the Nymphs", artist: "John William Waterhouse", url: "/artworks/paintings/Waterhouse - Hylas and the Nymphs.jpg", type: "portrait", year: "1896" },
    { title: "The Lady of Shalott", artist: "John William Waterhouse", url: "/artworks/paintings/Waterhouse - The Lady of Shalott.jpg", type: "portrait", year: "1888" },
    { title: "Circe Offering the Cup to Ulysses", artist: "John William Waterhouse", url: "/artworks/paintings/Waterhouse - Circe Offering the Cup to Ulysses.jpg", type: "portrait", year: "1891" },
    { title: "Echo and Narcissus", artist: "John William Waterhouse", url: "/artworks/paintings/Waterhouse - Echo and Narcissus.jpg", type: "portrait", year: "1903" },
    { title: "Boreas", artist: "John William Waterhouse", url: "/artworks/paintings/Waterhouse - Boreas.jpg", type: "portrait", year: "1903" },
    { title: "The Soul of the Rose", artist: "John William Waterhouse", url: "/artworks/paintings/Waterhouse - The Soul of the Rose.jpg", type: "portrait", year: "1908" },
    { title: "Dancers in Pink", artist: "Edgar Degas", url: "/artworks/paintings/Degas - Dancers in Pink.jpg", type: "portrait", year: "1876" },
    { title: "Woman Combing Her Hair", artist: "Edgar Degas", url: "/artworks/paintings/Degas - Woman Combing Her Hair.jpg", type: "portrait", year: "1885" },
    { title: "The Rehearsal of the Ballet", artist: "Edgar Degas", url: "/artworks/paintings/Degas - The Rehearsal of the Ballet.jpg", type: "portrait", year: "1874" },
    { title: "Dance Class", artist: "Edgar Degas", url: "/artworks/paintings/Degas - Dance Class.jpg", type: "portrait", year: "1874" },
    { title: "The Absinthe Drinker", artist: "Edgar Degas", url: "/artworks/paintings/Degas - The Absinthe Drinker.jpg", type: "portrait", year: "1876" },
    { title: "The Fighting Temeraire", artist: "J.M.W. Turner", url: "/artworks/paintings/Turner - The Fighting Temeraire.jpg", type: "landscape", year: "1839" },
    { title: "Rain, Steam and Speed", artist: "J.M.W. Turner", url: "/artworks/paintings/Turner - Rain Steam and Speed.jpg", type: "landscape", year: "1844" },
    { title: "Snowstorm at Sea", artist: "J.M.W. Turner", url: "/artworks/paintings/Turner - Snowstorm at Sea.jpg", type: "landscape", year: "1842" },
    { title: "Venice from the Porch", artist: "J.M.W. Turner", url: "/artworks/paintings/Turner - Venice from the Porch.jpg", type: "landscape", year: "1835" },
    // --- 100 new public-domain masterpieces ---
    // Vermeer
    { title: "Girl with a Pearl Earring", artist: "Johannes Vermeer", url: "/artworks/paintings/Vermeer - Girl with a Pearl Earring.jpg", type: "portrait", year: "1665" },
    { title: "The Milkmaid", artist: "Johannes Vermeer", url: "/artworks/paintings/Vermeer - The Milkmaid.jpg", type: "portrait", year: "1658" },
    { title: "Woman Reading a Letter", artist: "Johannes Vermeer", url: "/artworks/paintings/Vermeer - Woman Reading a Letter.jpg", type: "portrait", year: "1663" },
    { title: "The Art of Painting", artist: "Johannes Vermeer", url: "/artworks/paintings/Vermeer - The Art of Painting.jpg", type: "portrait", year: "1668" },
    { title: "View of Delft", artist: "Johannes Vermeer", url: "/artworks/paintings/Vermeer - View of Delft.jpg", type: "landscape", year: "1661" },
    // Botticelli
    { title: "Birth of Venus", artist: "Sandro Botticelli", url: "/artworks/paintings/Botticelli - Birth of Venus.jpg", type: "portrait", year: "1485" },
    { title: "Pallas and the Centaur", artist: "Sandro Botticelli", url: "/artworks/paintings/Botticelli - Pallas and the Centaur.jpg", type: "portrait", year: "1482" },
    { title: "Portrait of a Young Woman", artist: "Sandro Botticelli", url: "/artworks/paintings/Botticelli - Portrait of a Young Woman.jpg", type: "portrait", year: "1480" },
    // Titian
    { title: "Venus of Urbino", artist: "Titian", url: "/artworks/paintings/Titian - Venus of Urbino.jpg", type: "portrait", year: "1538" },
    { title: "Bacchus and Ariadne", artist: "Titian", url: "/artworks/paintings/Titian - Bacchus and Ariadne.jpg", type: "portrait", year: "1523" },
    { title: "Portrait of a Man", artist: "Titian", url: "/artworks/paintings/Titian - Portrait of a Man.jpg", type: "portrait", year: "1512" },
    { title: "Assumption of the Virgin", artist: "Titian", url: "/artworks/paintings/Titian - Assumption of the Virgin.jpg", type: "portrait", year: "1518" },
    // Rubens
    { title: "The Garden of Love", artist: "Peter Paul Rubens", url: "/artworks/paintings/Rubens - The Garden of Love.jpg", type: "portrait", year: "1633" },
    { title: "Samson and Delilah", artist: "Peter Paul Rubens", url: "/artworks/paintings/Rubens - Samson and Delilah.jpg", type: "portrait", year: "1610" },
    { title: "The Three Graces", artist: "Peter Paul Rubens", url: "/artworks/paintings/Rubens - The Three Graces.jpg", type: "portrait", year: "1635" },
    { title: "Descent from the Cross", artist: "Peter Paul Rubens", url: "/artworks/paintings/Rubens - Descent from the Cross.jpg", type: "portrait", year: "1614" },
    // Rembrandt
    { title: "The Night Watch", artist: "Rembrandt van Rijn", url: "/artworks/paintings/Rembrandt - The Night Watch.jpg", type: "portrait", year: "1642" },
    { title: "The Anatomy Lesson of Dr. Tulp", artist: "Rembrandt van Rijn", url: "/artworks/paintings/Rembrandt - The Anatomy Lesson.jpg", type: "portrait", year: "1632" },
    { title: "Return of the Prodigal Son", artist: "Rembrandt van Rijn", url: "/artworks/paintings/Rembrandt - Return of the Prodigal Son.jpg", type: "portrait", year: "1669" },
    { title: "Belshazzar's Feast", artist: "Rembrandt van Rijn", url: "/artworks/paintings/Rembrandt - Belshazzar Feast.jpg", type: "portrait", year: "1635" },
    // Velázquez
    { title: "Las Meninas", artist: "Diego Velázquez", url: "/artworks/paintings/Velazquez - Las Meninas.jpg", type: "portrait", year: "1656" },
    { title: "Portrait of Pope Innocent X", artist: "Diego Velázquez", url: "/artworks/paintings/Velazquez - Portrait of Pope Innocent X.jpg", type: "portrait", year: "1650" },
    { title: "The Surrender of Breda", artist: "Diego Velázquez", url: "/artworks/paintings/Velazquez - The Surrender of Breda.jpg", type: "realism", year: "1635" },
    // Goya
    { title: "Saturn Devouring His Son", artist: "Francisco Goya", url: "/artworks/paintings/Goya - Saturn Devouring His Son.jpg", type: "abstract", year: "1823" },
    { title: "The Third of May 1808", artist: "Francisco Goya", url: "/artworks/paintings/Goya - The Third of May 1808.jpg", type: "realism", year: "1814" },
    { title: "The Naked Maja", artist: "Francisco Goya", url: "/artworks/paintings/Goya - The Naked Maja.jpg", type: "portrait", year: "1800" },
    { title: "The Clothed Maja", artist: "Francisco Goya", url: "/artworks/paintings/Goya - The Clothed Maja.jpg", type: "portrait", year: "1803" },
    // El Greco
    { title: "View of Toledo", artist: "El Greco", url: "/artworks/paintings/El Greco - View of Toledo.jpg", type: "landscape", year: "1600" },
    { title: "The Burial of the Count of Orgaz", artist: "El Greco", url: "/artworks/paintings/El Greco - The Burial of the Count of Orgaz.jpg", type: "portrait", year: "1588" },
    { title: "The Disrobing of Christ", artist: "El Greco", url: "/artworks/paintings/El Greco - The Disrobing of Christ.jpg", type: "portrait", year: "1579" },
    // Neoclassicism
    { title: "Et in Arcadia Ego", artist: "Nicolas Poussin", url: "/artworks/paintings/Poussin - Et in Arcadia Ego.jpg", type: "portrait", year: "1637" },
    { title: "Pilgrimage to Cythera", artist: "Antoine Watteau", url: "/artworks/paintings/Watteau - Pilgrimage to Cythera.jpg", type: "landscape", year: "1717" },
    { title: "Oath of the Horatii", artist: "Jacques-Louis David", url: "/artworks/paintings/David - Oath of the Horatii.jpg", type: "realism", year: "1784" },
    { title: "The Death of Marat", artist: "Jacques-Louis David", url: "/artworks/paintings/David - The Death of Marat.jpg", type: "realism", year: "1793" },
    { title: "Napoleon Crossing the Alps", artist: "Jacques-Louis David", url: "/artworks/paintings/David - Napoleon Crossing the Alps.jpg", type: "portrait", year: "1801" },
    { title: "La Grande Odalisque", artist: "Jean-Auguste-Dominique Ingres", url: "/artworks/paintings/Ingres - La Grande Odalisque.jpg", type: "portrait", year: "1814" },
    { title: "The Turkish Bath", artist: "Jean-Auguste-Dominique Ingres", url: "/artworks/paintings/Ingres - The Turkish Bath.jpg", type: "portrait", year: "1862" },
    // Realism / Barbizon
    { title: "A Burial at Ornans", artist: "Gustave Courbet", url: "/artworks/paintings/Courbet - A Burial at Ornans.jpg", type: "realism", year: "1850" },
    { title: "The Origin of the World", artist: "Gustave Courbet", url: "/artworks/paintings/Courbet - The Origin of the World.jpg", type: "realism", year: "1866" },
    { title: "The Gleaners", artist: "Jean-François Millet", url: "/artworks/paintings/Millet - The Gleaners.jpg", type: "realism", year: "1857" },
    { title: "The Angelus", artist: "Jean-François Millet", url: "/artworks/paintings/Millet - The Angelus.jpg", type: "realism", year: "1859" },
    // Impressionism (new works)
    { title: "Impression, Sunrise", artist: "Claude Monet", url: "/artworks/paintings/Monet - Impression Sunrise.jpg", type: "landscape", year: "1872" },
    { title: "Haystacks at Sunset", artist: "Claude Monet", url: "/artworks/paintings/Monet - Haystacks at Sunset.jpg", type: "landscape", year: "1891" },
    { title: "Poplars on the Epte", artist: "Claude Monet", url: "/artworks/paintings/Monet - Poplars on the Epte.jpg", type: "landscape", year: "1891" },
    { title: "The Japanese Footbridge", artist: "Claude Monet", url: "/artworks/paintings/Monet - The Japanese Footbridge.jpg", type: "landscape", year: "1899" },
    { title: "Dance at Le Moulin de la Galette", artist: "Pierre-Auguste Renoir", url: "/artworks/paintings/Renoir - Dance at Le Moulin de la Galette.jpg", type: "portrait", year: "1876" },
    { title: "Two Sisters on the Terrace", artist: "Pierre-Auguste Renoir", url: "/artworks/paintings/Renoir - Two Sisters on the Terrace.jpg", type: "portrait", year: "1881" },
    { title: "The Umbrellas", artist: "Pierre-Auguste Renoir", url: "/artworks/paintings/Renoir - The Umbrellas.jpg", type: "portrait", year: "1886" },
    { title: "Boulevard Montmartre", artist: "Camille Pissarro", url: "/artworks/paintings/Pissarro - Boulevard Montmartre.jpg", type: "landscape", year: "1897" },
    { title: "Flood at Port-Marly", artist: "Alfred Sisley", url: "/artworks/paintings/Sisley - Flood at Port-Marly.jpg", type: "landscape", year: "1876" },
    // Post-Impressionism (new works)
    { title: "The Card Players", artist: "Paul Cézanne", url: "/artworks/paintings/Cezanne - The Card Players.jpg", type: "realism", year: "1895" },
    { title: "Mont Sainte-Victoire", artist: "Paul Cézanne", url: "/artworks/paintings/Cezanne - Mont Sainte-Victoire.jpg", type: "landscape", year: "1904" },
    { title: "The Large Bathers", artist: "Paul Cézanne", url: "/artworks/paintings/Cezanne - The Large Bathers.jpg", type: "portrait", year: "1906" },
    { title: "Where Do We Come From? What Are We? Where Are We Going?", artist: "Paul Gauguin", url: "/artworks/paintings/Gauguin - Where Do We Come From.jpg", type: "abstract", year: "1898" },
    { title: "The Vision After the Sermon", artist: "Paul Gauguin", url: "/artworks/paintings/Gauguin - The Vision After the Sermon.jpg", type: "abstract", year: "1888" },
    { title: "Spirit of the Dead Watching", artist: "Paul Gauguin", url: "/artworks/paintings/Gauguin - Spirit of the Dead Watching.jpg", type: "portrait", year: "1892" },
    { title: "The Starry Night", artist: "Vincent van Gogh", url: "/artworks/paintings/Van Gogh - The Starry Night.jpg", type: "landscape", year: "1889" },
    { title: "Sunflowers", artist: "Vincent van Gogh", url: "/artworks/paintings/Van Gogh - Sunflowers.jpg", type: "landscape", year: "1888" },
    { title: "Self-Portrait with Bandaged Ear", artist: "Vincent van Gogh", url: "/artworks/paintings/Van Gogh - Self-Portrait with Bandaged Ear.jpg", type: "portrait", year: "1889" },
    { title: "The Potato Eaters", artist: "Vincent van Gogh", url: "/artworks/paintings/Van Gogh - The Potato Eaters.jpg", type: "realism", year: "1885" },
    { title: "A Sunday on La Grande Jatte", artist: "Georges Seurat", url: "/artworks/paintings/Seurat - A Sunday on La Grande Jatte.jpg", type: "landscape", year: "1886" },
    { title: "At the Moulin Rouge", artist: "Henri de Toulouse-Lautrec", url: "/artworks/paintings/Toulouse-Lautrec - At the Moulin Rouge.jpg", type: "portrait", year: "1895" },
    { title: "Jane Avril Dancing", artist: "Henri de Toulouse-Lautrec", url: "/artworks/paintings/Toulouse-Lautrec - Jane Avril Dancing.jpg", type: "portrait", year: "1892" },
    // Vienna Secession / Expressionism
    { title: "The Kiss", artist: "Gustav Klimt", url: "/artworks/paintings/Klimt - The Kiss.jpg", type: "abstract", year: "1908" },
    { title: "Judith I", artist: "Gustav Klimt", url: "/artworks/paintings/Klimt - Judith I.jpg", type: "portrait", year: "1901" },
    { title: "Hope II", artist: "Gustav Klimt", url: "/artworks/paintings/Klimt - Hope II.jpg", type: "portrait", year: "1908" },
    { title: "Self-Portrait with Physalis", artist: "Egon Schiele", url: "/artworks/paintings/Schiele - Self-Portrait with Physalis.jpg", type: "portrait", year: "1912" },
    { title: "The Scream", artist: "Edvard Munch", url: "/artworks/paintings/Munch - The Scream.jpg", type: "abstract", year: "1893" },
    { title: "Madonna", artist: "Edvard Munch", url: "/artworks/paintings/Munch - Madonna.jpg", type: "portrait", year: "1894" },
    // Abstract / Modernism
    { title: "Composition VII", artist: "Wassily Kandinsky", url: "/artworks/paintings/Kandinsky - Composition VII.jpg", type: "abstract", year: "1913" },
    { title: "Yellow-Red-Blue", artist: "Wassily Kandinsky", url: "/artworks/paintings/Kandinsky - Yellow-Red-Blue.jpg", type: "abstract", year: "1925" },
    { title: "Broadway Boogie Woogie", artist: "Piet Mondrian", url: "/artworks/paintings/Mondrian - Broadway Boogie Woogie.jpg", type: "abstract", year: "1943" },
    { title: "Black Square", artist: "Kazimir Malevich", url: "/artworks/paintings/Malevich - Black Square.jpg", type: "abstract", year: "1915" },
    { title: "Suprematist Composition", artist: "Kazimir Malevich", url: "/artworks/paintings/Malevich - Suprematist Composition.jpg", type: "abstract", year: "1916" },
    { title: "Les Demoiselles d'Avignon", artist: "Pablo Picasso", url: "/artworks/paintings/Picasso - Les Demoiselles d Avignon.jpg", type: "abstract", year: "1907" },
    { title: "Guernica", artist: "Pablo Picasso", url: "/artworks/paintings/Picasso - Guernica.jpg", type: "abstract", year: "1937" },
    { title: "The Weeping Woman", artist: "Pablo Picasso", url: "/artworks/paintings/Picasso - The Weeping Woman.jpg", type: "portrait", year: "1937" },
    { title: "The Dance", artist: "Henri Matisse", url: "/artworks/paintings/Matisse - The Dance.jpg", type: "abstract", year: "1910" },
    { title: "Woman with a Hat", artist: "Henri Matisse", url: "/artworks/paintings/Matisse - Woman with a Hat.jpg", type: "portrait", year: "1905" },
    { title: "Reclining Nude", artist: "Amedeo Modigliani", url: "/artworks/paintings/Modigliani - Reclining Nude.jpg", type: "portrait", year: "1917" },
    { title: "Portrait of Jeanne Hébuterne", artist: "Amedeo Modigliani", url: "/artworks/paintings/Modigliani - Portrait of Jeanne Hebuterne.jpg", type: "portrait", year: "1919" },
    // British / American
    { title: "Madame X", artist: "John Singer Sargent", url: "/artworks/paintings/Sargent - Madame X.jpg", type: "portrait", year: "1884" },
    { title: "Arrangement in Grey and Black No.1", artist: "James McNeill Whistler", url: "/artworks/paintings/Whistler - Arrangement in Grey and Black.jpg", type: "portrait", year: "1871" },
    { title: "Ophelia", artist: "John Everett Millais", url: "/artworks/paintings/Millais - Ophelia.jpg", type: "portrait", year: "1852" },
    { title: "Beata Beatrix", artist: "Dante Gabriel Rossetti", url: "/artworks/paintings/Rossetti - Beata Beatrix.jpg", type: "portrait", year: "1870" },
    { title: "The Golden Stairs", artist: "Edward Burne-Jones", url: "/artworks/paintings/Burne-Jones - The Golden Stairs.jpg", type: "portrait", year: "1880" },
    { title: "The Roses of Heliogabalus", artist: "Lawrence Alma-Tadema", url: "/artworks/paintings/Alma-Tadema - The Roses of Heliogabalus.jpg", type: "portrait", year: "1888" },
    { title: "The Birth of Venus", artist: "William-Adolphe Bouguereau", url: "/artworks/paintings/Bouguereau - The Birth of Venus.jpg", type: "portrait", year: "1879" },
    { title: "Nymphs and Satyr", artist: "William-Adolphe Bouguereau", url: "/artworks/paintings/Bouguereau - Nymphs and Satyr.jpg", type: "portrait", year: "1873" },
    { title: "Flaming June", artist: "Frederic Leighton", url: "/artworks/paintings/Leighton - Flaming June.jpg", type: "portrait", year: "1895" },
    { title: "The Ball on Shipboard", artist: "James Tissot", url: "/artworks/paintings/Tissot - The Ball on Shipboard.jpg", type: "portrait", year: "1874" },
    { title: "Walk on the Beach", artist: "Joaquín Sorolla", url: "/artworks/paintings/Sorolla - Walk on the Beach.jpg", type: "landscape", year: "1909" },
    // Russian School
    { title: "Unexpected Visitors", artist: "Ilya Repin", url: "/artworks/paintings/Repin - Unexpected Visitors.jpg", type: "realism", year: "1884" },
    { title: "Above Eternal Peace", artist: "Isaac Levitan", url: "/artworks/paintings/Levitan - Above Eternal Peace.jpg", type: "landscape", year: "1894" },
    { title: "Golden Autumn", artist: "Isaac Levitan", url: "/artworks/paintings/Levitan - Golden Autumn.jpg", type: "landscape", year: "1895" },
    { title: "Morning of the Streltsy Execution", artist: "Vasily Surikov", url: "/artworks/paintings/Surikov - Morning of the Streltsy Execution.jpg", type: "realism", year: "1881" },
    { title: "Boyarina Morozova", artist: "Vasily Surikov", url: "/artworks/paintings/Surikov - Boyarina Morozova.jpg", type: "realism", year: "1887" },
    { title: "What is Truth?", artist: "Nikolai Ge", url: "/artworks/paintings/Ge - What is Truth.jpg", type: "realism", year: "1890" },
    { title: "Christ in the Wilderness", artist: "Ivan Kramskoi", url: "/artworks/paintings/Kramskoi - Christ in the Wilderness.jpg", type: "realism", year: "1872" },
];

// Dynamically generate levels from the masterpiece collection
const PALETTES = [
  ['#2B2B2B', '#E6E6E6', '#C5A059', '#BC4B1A', '#3B5975', '#7A9E7E'],
  ['#1A1A2E', '#E8D5B7', '#D4A853', '#8B4513', '#4A7C9E', '#C8A882'],
  ['#0D1B2A', '#F5E6D3', '#B8860B', '#8B0000', '#2F4F4F', '#DEB887'],
  ['#1C1C1C', '#F0EAD6', '#CD853F', '#A0522D', '#4682B4', '#90EE90'],
  ['#2C1810', '#FFF8DC', '#DAA520', '#B22222', '#191970', '#98FB98'],
];

const generateRegions = (index: number, difficulty: number) => {
  const count = difficulty <= 1 ? 3 : difficulty <= 2 ? 4 : difficulty <= 3 ? 5 : difficulty <= 4 ? 6 : 7;
  const palette = PALETTES[index % PALETTES.length];
  const positions = [
    { x: 25, y: 25 }, { x: 70, y: 30 }, { x: 45, y: 55 },
    { x: 20, y: 70 }, { x: 75, y: 65 }, { x: 50, y: 20 }, { x: 60, y: 80 },
  ];
  const hints = ['Warm highlight', 'Cool shadow', 'Mid-tone', 'Deep shadow', 'Reflected light', 'Accent tone', 'Background wash'];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    x: positions[i].x + ((index * (i + 3)) % 15) - 7,
    y: positions[i].y + ((index * (i + 2)) % 15) - 7,
    color: palette[i % palette.length],
    radius: 12 + (difficulty * 2) + (i % 3) * 3,
    hint: hints[i],
  }));
};

export const GAME_LEVELS: GameLevel[] = MASTERPIECE_COLLECTION.map((art, index) => {
  const difficulty = Math.min(5, Math.floor(index / 10) + 1) as 1 | 2 | 3 | 4 | 5;
  const palette = PALETTES[index % PALETTES.length];
  return {
    id: index + 1,
    title: art.title,
    artist: art.artist,
    year: art.year,
    imageUrl: art.url,
    description: `探索${art.artist}的经典之作《${art.title}》。体会${art.year}年的色彩哲学。`,
    isPremium: index > 2,
    difficulty,
    palette,
    regions: generateRegions(index, difficulty),
  };
});
