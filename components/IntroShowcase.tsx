import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ViewState } from '../types';

interface IntroShowcaseProps {
  onNavigate: (view: ViewState) => void;
  isActive?: boolean;
}

function sectionOpacity(p: number, start: number, end: number): number {
  const fw = 0.05;
  if (p < start || p > end) return 0;
  if (p < start + fw) return (p - start) / fw;
  if (p > end - fw) return (end - p) / fw;
  return 1;
}

// ── Camera keyframes ──────────────────────────────────────────────────────────
const CAM_KEYS = [
  { scroll: 0.0, pos: new THREE.Vector3(0, 0,   5.5), look: new THREE.Vector3(0, 0, 0) },
  { scroll: 0.3, pos: new THREE.Vector3(0, 0.3, 3.2), look: new THREE.Vector3(0, 0.3, 0) },
  { scroll: 1.0, pos: new THREE.Vector3(0, 0.5, 4.8), look: new THREE.Vector3(0, 0.2, 0) },
];

function lerpCamKey(scroll: number): { pos: THREE.Vector3; look: THREE.Vector3 } {
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    const a = CAM_KEYS[i], b = CAM_KEYS[i + 1];
    if (scroll >= a.scroll && scroll <= b.scroll) {
      const t = (scroll - a.scroll) / (b.scroll - a.scroll);
      return { pos: a.pos.clone().lerp(b.pos, t), look: a.look.clone().lerp(b.look, t) };
    }
  }
  const last = CAM_KEYS[CAM_KEYS.length - 1];
  return { pos: last.pos.clone(), look: last.look.clone() };
}

// ── Camera rig — reads ref directly, no React re-render needed ────────────────
const CameraRig: React.FC<{ spRef: React.MutableRefObject<number> }> = ({ spRef }) => {
  const { camera } = useThree();
  const camPos = useRef(new THREE.Vector3(0, 0, 6));
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const sp = spRef.current;
    const { pos, look } = lerpCamKey(sp);
    camPos.current.lerp(pos, 0.06);
    lookTarget.current.lerp(look, 0.06);
    camera.position.copy(camPos.current);
    camera.lookAt(lookTarget.current);
  });

  return null;
};

// ── Marble fallback ───────────────────────────────────────────────────────────
const marbleVert = `
  varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorldPos;
  void main() {
    vUv = uv; vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0); vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const marbleFrag = `
  varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorldPos;
  uniform float uTime;
  float hash(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
  float noise(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
  float fbm(vec3 p){float v=0.0;float a=0.5;vec3 s=vec3(100.0);for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.0+s;a*=0.5;}return v;}
  void main(){
    vec3 p=vWorldPos*2.2; float n=fbm(p+uTime*0.04);
    float marble=sin(p.y*4.0+n*9.0+uTime*0.05)*0.5+0.5; float vein=pow(marble,2.5);
    vec3 base=vec3(0.96,0.94,0.90); vec3 veinC=vec3(0.72,0.70,0.68);
    vec3 col=mix(base,veinC,vein*0.6);
    vec3 ld=normalize(vec3(1.2,2.0,1.5)); vec3 vd=normalize(cameraPosition-vWorldPos);
    float diff=max(dot(vNormal,ld),0.0); float spec=pow(max(dot(reflect(-ld,vNormal),vd),0.0),32.0);
    float rim=pow(1.0-max(dot(vNormal,vd),0.0),3.0);
    vec3 fc=col*(0.35+diff*0.55)+vec3(1.0,0.97,0.90)*spec*0.4+vec3(0.85,0.75,0.55)*rim*0.18;
    gl_FragColor=vec4(fc,1.0);
  }
`;

const FallbackSphere: React.FC<{ spRef: React.MutableRefObject<number> }> = ({ spRef }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return;
    const sp = spRef.current;
    matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    const targetY = sp < 0.25 ? -1.5 + (sp / 0.25) * 1.5 : 0;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.06;
  });

  return (
    <mesh ref={meshRef} position={[0, -1.5, 0]}>
      <sphereGeometry args={[1.15, 128, 128]} />
      <shaderMaterial ref={matRef} vertexShader={marbleVert} fragmentShader={marbleFrag} uniforms={uniforms} />
    </mesh>
  );
};

// ── GLB model ─────────────────────────────────────────────────────────────────
const IntroModel: React.FC<{
  spRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}> = ({ spRef, mouseRef }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/david.glb');

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        // GLB has no NORMAL attribute — compute them so lighting works
        if (mesh.geometry && !mesh.geometry.attributes.normal) {
          mesh.geometry.computeVertexNormals();
        }
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0x5a4a3a, roughness: 0.6, metalness: 0.05,
          side: THREE.DoubleSide,
        });
      }
    });
    // GLB bbox Y: 25→137 (~112 units) — normalize to 3.2 units and center
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) c.scale.setScalar(3.2 / maxDim);
    const box2 = new THREE.Box3().setFromObject(c);
    const center = box2.getCenter(new THREE.Vector3());
    c.position.sub(center);
    return c;
  }, [scene]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const sp = spRef.current;
    const { x: mx, y: my } = mouseRef.current;

    // Rise from y=-1.5 to y=0 during first 25% of scroll
    const riseTarget = sp < 0.25 ? -1.5 + (sp / 0.25) * 1.5 : 0;
    const floatOffset = sp >= 0.25 ? Math.sin(clock.getElapsedTime() * 0.6) * 0.04 : 0;
    groupRef.current.position.y += (riseTarget + floatOffset - groupRef.current.position.y) * 0.05;

    // Stop rotation when "共创未来" section appears (sp >= 0.70)
    if (sp >= 0.70) return;

    // Scroll-driven Y rotation (0 → ~200°) + subtle mouse parallax
    const targetRotY = sp * Math.PI * 1.1 + mx * 0.18;
    const targetRotX = my * 0.07;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.04;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      <primitive object={cloned} />
    </group>
  );
};

interface ModelEBProps { spRef: React.MutableRefObject<number>; mouseRef: React.MutableRefObject<{ x: number; y: number }>; children: React.ReactNode; }
interface ModelEBState { failed: boolean; }
class ModelErrorBoundary extends React.Component<ModelEBProps, ModelEBState> {
  constructor(props: ModelEBProps) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError(): ModelEBState { return { failed: true }; }
  render() {
    if (this.state.failed) return <FallbackSphere spRef={this.props.spRef} />;
    return this.props.children;
  }
}

// ── Scene ─────────────────────────────────────────────────────────────────────
const IntroScene: React.FC<{
  spRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}> = ({ spRef, mouseRef }) => (
  <>
    <CameraRig spRef={spRef} />
    {/* Rembrandt lighting rig */}
    <ambientLight intensity={0.6} color="#f5f0e8" />
    {/* Key: upper-left warm */}
    <directionalLight position={[-2.5, 4, 1.5]} intensity={2.0} color="#fff8f0" />
    {/* Fill: right cool */}
    <directionalLight position={[3, 0.5, 1]} intensity={0.8} color="#e0e8f0" />
    {/* Rim: behind-right */}
    <pointLight position={[1.5, 3, -3]} intensity={1.5} color="#ffd090" />
    {/* Ground bounce */}
    <pointLight position={[0, -2, 1]} intensity={0.4} color="#c8a878" />
    <ModelErrorBoundary spRef={spRef} mouseRef={mouseRef}>
      <Suspense fallback={<FallbackSphere spRef={spRef} />}>
        <IntroModel spRef={spRef} mouseRef={mouseRef} />
      </Suspense>
    </ModelErrorBoundary>
  </>
);

// ── Main component ────────────────────────────────────────────────────────────
const IntroShowcase: React.FC<IntroShowcaseProps> = ({ onNavigate, isActive = true }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const spRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const container = outerRef.current?.closest('.scroll-container') as HTMLElement | null;
    if (!container) return;
    const handleScroll = () => {
      const max = container.scrollHeight - container.clientHeight;
      if (max <= 0) return;
      const p = Math.min(1, Math.max(0, container.scrollTop / max));
      spRef.current = p;           // sync update — useFrame reads this every frame
      setScrollProgress(p);        // async update — drives text opacity + progress bar
      if (!hasScrolled && container.scrollTop > 10) setHasScrolled(true);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isActive, hasScrolled]);

  useEffect(() => {
    if (isActive) { spRef.current = 0; setScrollProgress(0); setHasScrolled(false); }
  }, [isActive]);

  return (
    <div ref={outerRef} style={{ height: '500vh' }} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#F9F8F6]">

        {/* Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas
            camera={{ position: [0, 0, 5.5], fov: 42 }}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            style={{ background: '#F9F8F6' }}
            dpr={[1, 1.5]}
          >
            <IntroScene spRef={spRef} mouseRef={mouseRef} />
          </Canvas>
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(249,248,246,0.6) 100%)' }} />

        {/* Section 1 — center intro */}
        {(() => {
          const op = sectionOpacity(scrollProgress, 0.00, 0.25);
          return (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
              style={{ opacity: op, transition: 'opacity 0.3s ease' }}>
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-art-primary mb-6">PLATFORM</span>
              <h1 className="font-sans font-black text-[12vw] md:text-[8rem] text-stone-900 leading-none tracking-[-0.04em]">ArtIsLife</h1>
              <p className="text-stone-500 text-xl md:text-2xl font-light tracking-[0.2em] mt-4">艺术，让生命更丰盛</p>
            </div>
          );
        })()}

        {/* Section 2 — left */}
        {(() => {
          const op = sectionOpacity(scrollProgress, 0.22, 0.50);
          return (
            <div className="absolute inset-0 z-20 flex items-center pointer-events-none px-8 md:px-20"
              style={{ opacity: op, transition: 'opacity 0.3s ease' }}>
              <div className="max-w-sm">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-art-primary mb-4 block">我们是谁</span>
                <h2 className="font-sans font-black text-3xl md:text-4xl text-stone-900 leading-tight mb-4 tracking-[-0.03em]">创作者的数字家园</h2>
                <p className="text-stone-500 text-sm md:text-base leading-relaxed font-light mb-6">
                  ArtIsLife 是为艺术家、收藏家与爱好者打造的一体化创作平台。在这里，AI 赋能创作，区块链确权资产，社区连接灵魂。
                </p>
                <div className="flex flex-wrap gap-2">
                  {['AI 艺术生成', '数字藏品市场', '创作者社区', '博物馆导览'].map(f => (
                    <span key={f} className="text-[10px] px-3 py-1 border border-art-primary/40 text-art-primary rounded-full uppercase tracking-wider">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Section 3 — right */}
        {(() => {
          const op = sectionOpacity(scrollProgress, 0.45, 0.75);
          return (
            <div className="absolute inset-0 z-20 flex items-center justify-end pointer-events-none px-8 md:px-20"
              style={{ opacity: op, transition: 'opacity 0.3s ease' }}>
              <div className="max-w-sm text-right">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-art-primary mb-4 block">发展前景</span>
                <h2 className="font-sans font-black text-3xl md:text-4xl text-stone-900 leading-tight mb-4 tracking-[-0.03em]">数字艺术新纪元</h2>
                <p className="text-stone-500 text-sm md:text-base leading-relaxed font-light mb-6">
                  全球数字艺术市场规模预计在 2028 年突破 $1,200 亿，年复合增长率达 34%。我们正处于这场变革的核心。
                </p>
                <div className="flex flex-col gap-2 items-end">
                  {['$1,200亿 市场规模', '34% 年增长率', '5亿+ 潜在用户'].map(s => (
                    <span key={s} className="text-[11px] text-art-primary font-mono tracking-wider">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Section 4 — center CTA */}
        {(() => {
          const op = sectionOpacity(scrollProgress, 0.70, 1.00);
          return (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center"
              style={{ opacity: op, transition: 'opacity 0.3s ease', pointerEvents: op > 0.5 ? 'auto' : 'none' }}>
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-art-primary mb-6">路线图</span>
              <h2 className="font-sans font-black text-5xl md:text-7xl text-stone-900 leading-none tracking-[-0.04em] mb-10">共创未来</h2>
              <div className="flex flex-col gap-4 mb-10 w-full max-w-xs">
                {[
                  { phase: 'Phase 1', desc: '平台上线 · AI 创作工具 · 社区建设' },
                  { phase: 'Phase 2', desc: '数字藏品市场 · 创作者经济体系' },
                  { phase: 'Phase 3', desc: '元宇宙展览 · 全球艺术家网络' },
                ].map(({ phase, desc }) => (
                  <div key={phase} className="flex items-start gap-4">
                    <span className="text-[10px] font-bold text-art-primary uppercase tracking-widest mt-0.5 w-16 shrink-0">{phase}</span>
                    <span className="text-stone-500 text-xs leading-relaxed">{desc}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('home')}
                className="px-10 py-4 border-2 border-stone-900 text-stone-900 text-xs font-black uppercase tracking-[0.3em] hover:bg-stone-900 hover:text-white transition-all duration-500 rounded-full"
              >
                进入平台
              </button>
            </div>
          );
        })()}

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-stone-200 z-30 pointer-events-none">
          <div className="h-full bg-art-primary transition-all duration-100" style={{ width: `${scrollProgress * 100}%` }} />
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-700"
          style={{ opacity: hasScrolled ? 0 : 1 }}
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-stone-400">向下滚动</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-stone-400/60 to-transparent animate-bounce" />
        </div>

      </div>
    </div>
  );
};

// Preload the model so it's ready when the page is visited
useGLTF.preload('/david.glb');

export default IntroShowcase;
