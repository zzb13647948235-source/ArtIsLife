
import React from 'react';
import { ViewState } from '../types';

const About: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 md:pt-32 pb-20 bg-transparent">
       <div className="max-w-[1800px] mx-auto px-4 md:px-12">

          {/* Hero Text */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-32 mb-16 md:mb-32 items-end animate-fade-in-up">
              <div>
                 <span className="text-art-primary font-bold text-xs uppercase tracking-[0.3em] mb-4 md:mb-6 block">Our Mission</span>
                 <h2 className="font-serif text-4xl md:text-6xl lg:text-8xl text-art-accent leading-[0.9]">
                    Bridging <br/> Eras.
                 </h2>
              </div>
              <div className="pb-4">
                 <p className="text-base md:text-xl lg:text-2xl text-stone-600 font-light leading-relaxed text-justify">
                    ArtIsLife 不仅仅是一个工具，它是一座桥梁。我们致力于消除艺术创作的门槛，利用最先进的人工智能模型，让文艺复兴的光辉与数字时代的脉搏共振。
                 </p>
              </div>
          </div>

          {/* Visual Story */}
          <div className="relative h-[40vh] md:h-[60vh] lg:h-[80vh] w-full overflow-hidden rounded-sm mb-16 md:mb-32 group">
             <img
               src="https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=2000&auto=format&fit=crop"
               alt="Art Museum Hall"
               className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[1.5s] ease-out scale-105 group-hover:scale-100"
             />
             <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-1000"></div>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t border-art-accent/10 pt-12 md:pt-24">
             <div className="space-y-4 md:space-y-6">
                <span className="font-mono text-xs text-art-muted">01</span>
                <h3 className="font-serif text-2xl md:text-3xl text-art-accent">尊重经典</h3>
                <p className="text-stone-500 leading-loose text-sm md:text-base">
                   我们的模型经过精心调优，能够深入理解从巴洛克到印象派的每一个笔触细节，确保每一次生成都是对艺术史的致敬。
                </p>
             </div>
             <div className="space-y-4 md:space-y-6">
                <span className="font-mono text-xs text-art-muted">02</span>
                <h3 className="font-serif text-2xl md:text-3xl text-art-accent">技术赋能</h3>
                <p className="text-stone-500 leading-loose text-sm md:text-base">
                   基于 Google Gemini 强大的多模态能力，我们将复杂的艺术理论转化为简单的对话和指令，让创作触手可及。
                </p>
             </div>
             <div className="space-y-4 md:space-y-6">
                <span className="font-mono text-xs text-art-muted">03</span>
                <h3 className="font-serif text-2xl md:text-3xl text-art-accent">灵感社区</h3>
                <p className="text-stone-500 leading-loose text-sm md:text-base">
                   我们正在构建一个全球化的艺术社区，连接策展人、收藏家和创作者，共同探索数字艺术的边界。
                </p>
             </div>
          </div>

       </div>
    </div>
  );
};

export default About;
