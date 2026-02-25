import React from 'react';

// ── SVG Plant Components ──────────────────────────────────────────────────────

const BigLeaf: React.FC<{ color?: string }> = ({ color = '#5a8a5a' }) => (
  <svg width="100%" height="100%" viewBox="0 0 80 130" fill="none">
    <path d="M40 125 C39 110, 37 95, 35 80" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M35 80 C15 65, 5 40, 18 18 C28 4, 52 2, 62 18 C72 34, 62 62, 35 80Z" fill={color} opacity="0.85"/>
    <path d="M35 80 C42 58, 48 35, 44 16" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M38 65 L18 50 M40 52 L60 42 M37 72 L16 62" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeLinecap="round"/>
  </svg>
);

const SmallLeaf: React.FC<{ color?: string }> = ({ color = '#7ab87a' }) => (
  <svg width="100%" height="100%" viewBox="0 0 50 80" fill="none">
    <path d="M25 75 C24 62, 23 50, 22 40" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 40 C10 30, 5 18, 14 8 C20 2, 34 2, 38 12 C42 22, 34 34, 22 40Z" fill={color} opacity="0.8"/>
    <path d="M22 40 C27 28, 30 16, 28 8" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

const Flower: React.FC<{ petalColor?: string }> = ({ petalColor = '#e8a0b0' }) => (
  <svg width="100%" height="100%" viewBox="0 0 60 110" fill="none">
    <path d="M30 105 C30 90, 29 75, 30 58" stroke="#6b9e6b" strokeWidth="2" strokeLinecap="round"/>
    <path d="M30 82 C20 76, 16 66, 20 60 C24 57, 30 64, 30 72Z" fill="#6b9e6b" opacity="0.8"/>
    {[0,72,144,216,288].map((a,i) => (
      <ellipse key={i}
        cx={30 + Math.cos((a-90)*Math.PI/180)*13}
        cy={38 + Math.sin((a-90)*Math.PI/180)*13}
        rx="7" ry="11"
        fill={petalColor} opacity="0.9"
        transform={`rotate(${a}, ${30 + Math.cos((a-90)*Math.PI/180)*13}, ${38 + Math.sin((a-90)*Math.PI/180)*13})`}
      />
    ))}
    <circle cx="30" cy="38" r="8" fill="#f5d06a"/>
    <circle cx="30" cy="38" r="5" fill="#e8b840"/>
  </svg>
);

const Daisy: React.FC = () => (
  <svg width="100%" height="100%" viewBox="0 0 55 100" fill="none">
    <path d="M27 96 C27 82, 26 68, 27 55" stroke="#6b9e6b" strokeWidth="2" strokeLinecap="round"/>
    <path d="M27 75 C18 70, 14 61, 18 55 C22 52, 27 59, 27 67Z" fill="#6b9e6b" opacity="0.8"/>
    {[0,45,90,135,180,225,270,315].map((a,i) => (
      <ellipse key={i}
        cx={27 + Math.cos((a-90)*Math.PI/180)*12}
        cy={35 + Math.sin((a-90)*Math.PI/180)*12}
        rx="5" ry="10"
        fill="white" opacity="0.9"
        transform={`rotate(${a}, ${27 + Math.cos((a-90)*Math.PI/180)*12}, ${35 + Math.sin((a-90)*Math.PI/180)*12})`}
      />
    ))}
    <circle cx="27" cy="35" r="8" fill="#f5d06a"/>
    <circle cx="27" cy="35" r="5" fill="#e8a820"/>
  </svg>
);

const GrassClump: React.FC = () => (
  <svg width="100%" height="100%" viewBox="0 0 90 100" fill="none">
    <path d="M12 98 C10 82, 6 62, 4 35 C8 52, 14 72, 16 90" stroke="#7ab87a" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M28 98 C26 78, 24 55, 28 20 C30 45, 33 68, 32 90" stroke="#5a9a5a" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M45 98 C44 80, 46 58, 50 28 C48 50, 46 72, 47 90" stroke="#7ab87a" strokeWidth="2" strokeLinecap="round"/>
    <path d="M62 98 C60 84, 64 65, 70 42 C66 58, 62 76, 63 92" stroke="#5a9a5a" strokeWidth="2" strokeLinecap="round"/>
    <path d="M76 98 C75 86, 78 70, 82 50 C79 64, 76 80, 77 94" stroke="#7ab87a" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const Fern: React.FC = () => (
  <svg width="100%" height="100%" viewBox="0 0 70 130" fill="none">
    <path d="M35 125 C34 108, 34 88, 36 65 C38 42, 42 22, 38 5" stroke="#5a8a5a" strokeWidth="2" strokeLinecap="round"/>
    {[110,95,80,65,50,35,20].map((y,i) => {
      const x = 35 + Math.sin(i * 0.9) * 5;
      return (
        <g key={i}>
          <path d={`M${x} ${y} C${x-16} ${y-4}, ${x-20} ${y-10}, ${x-12} ${y-15}`} stroke="#5a8a5a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d={`M${x} ${y} C${x+16} ${y-4}, ${x+20} ${y-10}, ${x+12} ${y-15}`} stroke="#5a8a5a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </g>
      );
    })}
  </svg>
);

const Tulip: React.FC<{ color?: string }> = ({ color = '#e87060' }) => (
  <svg width="100%" height="100%" viewBox="0 0 60 120" fill="none">
    <path d="M30 115 C30 95, 30 75, 30 55" stroke="#6b9e6b" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M30 90 C18 82, 12 70, 16 60 C20 54, 30 62, 30 75Z" fill="#6b9e6b" opacity="0.85"/>
    <path d="M30 75 C42 67, 48 55, 44 45 C40 39, 30 47, 30 60Z" fill="#6b9e6b" opacity="0.85"/>
    <path d="M18 55 C14 42, 16 28, 22 20 C26 15, 30 20, 30 30Z" fill={color} opacity="0.9"/>
    <path d="M30 30 C30 20, 34 15, 38 20 C44 28, 46 42, 42 55Z" fill={color} opacity="0.9"/>
    <path d="M22 55 C20 45, 22 32, 30 25 C38 32, 40 45, 38 55Z" fill={color} opacity="0.75"/>
  </svg>
);

const WildFlower: React.FC<{ color?: string }> = ({ color = '#a0c0e8' }) => (
  <svg width="100%" height="100%" viewBox="0 0 45 95" fill="none">
    <path d="M22 90 C22 76, 21 62, 22 48" stroke="#6b9e6b" strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 70 C14 65, 10 56, 14 50 C18 47, 22 54, 22 62Z" fill="#6b9e6b" opacity="0.8"/>
    {[0,60,120,180,240,300].map((a,i) => (
      <ellipse key={i}
        cx={22 + Math.cos((a-90)*Math.PI/180)*10}
        cy={30 + Math.sin((a-90)*Math.PI/180)*10}
        rx="5" ry="9"
        fill={color} opacity="0.85"
        transform={`rotate(${a}, ${22 + Math.cos((a-90)*Math.PI/180)*10}, ${30 + Math.sin((a-90)*Math.PI/180)*10})`}
      />
    ))}
    <circle cx="22" cy="30" r="6" fill="#f5e060"/>
  </svg>
);

// ── Plant instance: wraps SVG with wind animation ─────────────────────────────
interface PlantProps {
  component: React.ReactNode;
  style: React.CSSProperties;
  animClass: string;
  opacity?: number;
}

const Plant: React.FC<PlantProps> = ({ component, style, animClass, opacity = 1 }) => (
  <div
    className={`absolute pointer-events-none select-none ${animClass}`}
    style={{ opacity, transformOrigin: 'bottom center', ...style }}
  >
    {component}
  </div>
);

// ── Per-page plant layouts ─────────────────────────────────────────────────────
// home: lush garden — full variety, warm greens + pink/red blooms, dense layering
const HOME_PLANTS: PlantProps[] = [
  { component: <BigLeaf color="#5c8c3e" />,    style: { bottom: 0, left: '-12px', width: 95, height: 150 },  animClass: 'wind-sway-slow',   opacity: 0.6  },
  { component: <GrassClump />,                 style: { bottom: 0, left: '75px',  width: 105, height: 82 },  animClass: 'wind-sway-fast',   opacity: 0.38 },
  { component: <Flower petalColor="#e8607a" />,style: { bottom: 0, left: '185px', width: 62, height: 118 },  animClass: 'wind-sway-med',    opacity: 0.55 },
  { component: <Daisy />,                      style: { bottom: 0, left: '255px', width: 54, height: 100 },  animClass: 'wind-sway-slow',   opacity: 0.45 },
  { component: <Tulip color="#d94f3a" />,      style: { bottom: 0, right: '250px',width: 56, height: 118 },  animClass: 'wind-sway-fast-r', opacity: 0.5  },
  { component: <Fern />,                       style: { bottom: 0, right: '165px',width: 72, height: 132 },  animClass: 'wind-sway-med-r',  opacity: 0.42 },
  { component: <SmallLeaf color="#7dc87d" />,  style: { bottom: 0, right: '85px', width: 58, height: 92  },  animClass: 'wind-sway-slow-r', opacity: 0.48 },
  { component: <BigLeaf color="#3e6e3e" />,    style: { bottom: 0, right: '-12px',width: 102, height: 158 }, animClass: 'wind-sway-slow-r', opacity: 0.55 },
];

// journal: literary garden — ferns + wildflowers, cool purples/lavender, elegant & sparse
const JOURNAL_PLANTS: PlantProps[] = [
  { component: <Fern />,                       style: { bottom: 0, left: '-8px',  width: 80, height: 138 },  animClass: 'wind-sway-slow',   opacity: 0.5  },
  { component: <WildFlower color="#b89ad8" />, style: { bottom: 0, left: '72px',  width: 52, height: 98  },  animClass: 'wind-sway-med',    opacity: 0.55 },
  { component: <WildFlower color="#d8b0e8" />, style: { bottom: 0, left: '135px', width: 46, height: 90  },  animClass: 'wind-sway-fast',   opacity: 0.45 },
  { component: <WildFlower color="#9880c8" />, style: { bottom: 0, right: '130px',width: 50, height: 95  },  animClass: 'wind-sway-fast-r', opacity: 0.5  },
  { component: <Fern />,                       style: { bottom: 0, right: '-8px', width: 78, height: 135 },  animClass: 'wind-sway-slow-r', opacity: 0.48 },
];

// styles: art history — ornate tulips + big leaves, rich golds/burgundy, museum-like grandeur
const STYLES_PLANTS: PlantProps[] = [
  { component: <BigLeaf color="#4a7a2a" />,    style: { bottom: 0, left: '-10px', width: 100, height: 158 }, animClass: 'wind-sway-slow',   opacity: 0.52 },
  { component: <Tulip color="#8b1a2a" />,      style: { bottom: 0, left: '88px',  width: 58, height: 122 },  animClass: 'wind-sway-med',    opacity: 0.55 },
  { component: <Tulip color="#c5a030" />,      style: { bottom: 0, left: '155px', width: 54, height: 118 },  animClass: 'wind-sway-slow',   opacity: 0.5  },
  { component: <Tulip color="#7a1a38" />,      style: { bottom: 0, right: '148px',width: 56, height: 120 },  animClass: 'wind-sway-slow-r', opacity: 0.52 },
  { component: <BigLeaf color="#3a6a1a" />,    style: { bottom: 0, right: '-10px',width: 98, height: 155 },  animClass: 'wind-sway-slow-r', opacity: 0.5  },
];

// gallery: creative studio — wildflowers + grass, bright sky blues/corals, airy & playful
const GALLERY_PLANTS: PlantProps[] = [
  { component: <GrassClump />,                 style: { bottom: 0, left: '-5px',  width: 110, height: 85 },  animClass: 'wind-sway-fast',   opacity: 0.38 },
  { component: <WildFlower color="#60b8e8" />, style: { bottom: 0, left: '105px', width: 52, height: 98  },  animClass: 'wind-sway-med',    opacity: 0.55 },
  { component: <WildFlower color="#f07858" />, style: { bottom: 0, left: '168px', width: 48, height: 92  },  animClass: 'wind-sway-slow',   opacity: 0.5  },
  { component: <WildFlower color="#50c8a0" />, style: { bottom: 0, right: '160px',width: 50, height: 95  },  animClass: 'wind-sway-fast-r', opacity: 0.5  },
  { component: <GrassClump />,                 style: { bottom: 0, right: '-5px', width: 108, height: 82 },  animClass: 'wind-sway-med-r',  opacity: 0.35 },
];

// chat: conversation nook — soft daisies + small leaves, gentle whites/mint, calm & friendly
const CHAT_PLANTS: PlantProps[] = [
  { component: <SmallLeaf color="#6ab88a" />,  style: { bottom: 0, left: '-5px',  width: 58, height: 95  },  animClass: 'wind-sway-slow',   opacity: 0.45 },
  { component: <Daisy />,                      style: { bottom: 0, left: '55px',  width: 56, height: 102 },  animClass: 'wind-sway-med',    opacity: 0.5  },
  { component: <Daisy />,                      style: { bottom: 0, left: '118px', width: 50, height: 96  },  animClass: 'wind-sway-slow',   opacity: 0.42 },
  { component: <Daisy />,                      style: { bottom: 0, right: '110px',width: 52, height: 98  },  animClass: 'wind-sway-slow-r', opacity: 0.44 },
  { component: <SmallLeaf color="#50a870" />,  style: { bottom: 0, right: '-5px', width: 60, height: 98  },  animClass: 'wind-sway-med-r',  opacity: 0.42 },
];

// game: adventure arena — wild grass + bold flowers, vivid oranges/yellows, energetic & dynamic
const GAME_PLANTS: PlantProps[] = [
  { component: <GrassClump />,                 style: { bottom: 0, left: '-5px',  width: 115, height: 88 },  animClass: 'wind-sway-fast',   opacity: 0.42 },
  { component: <Flower petalColor="#f0a020" />,style: { bottom: 0, left: '108px', width: 64, height: 120 },  animClass: 'wind-sway-med',    opacity: 0.58 },
  { component: <Flower petalColor="#e85020" />,style: { bottom: 0, left: '182px', width: 60, height: 115 },  animClass: 'wind-sway-fast',   opacity: 0.52 },
  { component: <Flower petalColor="#f8c030" />,style: { bottom: 0, right: '175px',width: 62, height: 118 },  animClass: 'wind-sway-fast-r', opacity: 0.55 },
  { component: <GrassClump />,                 style: { bottom: 0, right: '-5px', width: 112, height: 85 },  animClass: 'wind-sway-fast-r', opacity: 0.4  },
];

// map: explorer's path — ferns + small leaves, deep forest greens, natural & grounded
const MAP_PLANTS: PlantProps[] = [
  { component: <Fern />,                       style: { bottom: 0, left: '-8px',  width: 82, height: 140 },  animClass: 'wind-sway-slow',   opacity: 0.5  },
  { component: <SmallLeaf color="#4a8a4a" />,  style: { bottom: 0, left: '74px',  width: 55, height: 88  },  animClass: 'wind-sway-med',    opacity: 0.45 },
  { component: <SmallLeaf color="#6aaa5a" />,  style: { bottom: 0, left: '138px', width: 50, height: 82  },  animClass: 'wind-sway-slow',   opacity: 0.4  },
  { component: <SmallLeaf color="#3a7a3a" />,  style: { bottom: 0, right: '130px',width: 52, height: 85  },  animClass: 'wind-sway-slow-r', opacity: 0.42 },
  { component: <Fern />,                       style: { bottom: 0, right: '-8px', width: 80, height: 138 },  animClass: 'wind-sway-med-r',  opacity: 0.48 },
];

// market: luxury boutique — roses (flowers) + big leaves, deep crimsons/golds, opulent & rich
const MARKET_PLANTS: PlantProps[] = [
  { component: <BigLeaf color="#3a6a1a" />,    style: { bottom: 0, left: '-10px', width: 98, height: 155 },  animClass: 'wind-sway-slow',   opacity: 0.52 },
  { component: <Flower petalColor="#c01840" />,style: { bottom: 0, left: '86px',  width: 64, height: 122 },  animClass: 'wind-sway-med',    opacity: 0.58 },
  { component: <Flower petalColor="#d4a020" />,style: { bottom: 0, left: '160px', width: 60, height: 118 },  animClass: 'wind-sway-slow',   opacity: 0.52 },
  { component: <Flower petalColor="#a01030" />,style: { bottom: 0, right: '152px',width: 62, height: 120 },  animClass: 'wind-sway-slow-r', opacity: 0.55 },
  { component: <BigLeaf color="#2a5a10" />,    style: { bottom: 0, right: '-10px',width: 96, height: 152 },  animClass: 'wind-sway-slow-r', opacity: 0.5  },
];

// community: social garden — mixed blooms, warm peach/coral/yellow, cheerful & welcoming
const COMMUNITY_PLANTS: PlantProps[] = [
  { component: <Flower petalColor="#f0a080" />,style: { bottom: 0, left: '-5px',  width: 62, height: 118 },  animClass: 'wind-sway-med',    opacity: 0.55 },
  { component: <Daisy />,                      style: { bottom: 0, left: '60px',  width: 54, height: 100 },  animClass: 'wind-sway-slow',   opacity: 0.48 },
  { component: <WildFlower color="#f8d050" />, style: { bottom: 0, left: '122px', width: 50, height: 95  },  animClass: 'wind-sway-fast',   opacity: 0.52 },
  { component: <WildFlower color="#f09060" />, style: { bottom: 0, right: '115px',width: 50, height: 93  },  animClass: 'wind-sway-fast-r', opacity: 0.5  },
  { component: <Daisy />,                      style: { bottom: 0, right: '58px', width: 54, height: 100 },  animClass: 'wind-sway-slow-r', opacity: 0.46 },
  { component: <Flower petalColor="#e87858" />,style: { bottom: 0, right: '-5px', width: 60, height: 115 },  animClass: 'wind-sway-med-r',  opacity: 0.52 },
];

const PAGE_PLANTS: Record<string, PlantProps[]> = {
  home:      HOME_PLANTS,
  journal:   JOURNAL_PLANTS,
  styles:    STYLES_PLANTS,
  gallery:   GALLERY_PLANTS,
  chat:      CHAT_PLANTS,
  game:      GAME_PLANTS,
  map:       MAP_PLANTS,
  market:    MARKET_PLANTS,
  community: COMMUNITY_PLANTS,
};

// ── Main export ───────────────────────────────────────────────────────────────
interface BotanicalDecorProps {
  page: string;
}

const BotanicalDecor: React.FC<BotanicalDecorProps> = ({ page }) => {
  const plants = PAGE_PLANTS[page];
  if (!plants) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[200px] pointer-events-none overflow-hidden z-[5]">
      {plants.map((p, i) => (
        <Plant key={i} {...p} style={{ ...p.style, animationDelay: `${(i * 0.38).toFixed(2)}s` }} />
      ))}
    </div>
  );
};

export default BotanicalDecor;

