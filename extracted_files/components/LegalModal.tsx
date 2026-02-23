
import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="bg-white w-full max-w-3xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-art-primary/10 text-art-primary rounded-full flex items-center justify-center">
                    {type === 'privacy' ? <Shield size={20} /> : <FileText size={20} />}
                </div>
                <div>
                    <h3 className="font-serif text-2xl text-stone-800">
                        {type === 'privacy' ? '隐私政策' : '服务条款'}
                    </h3>
                    <p className="text-xs text-stone-400 uppercase tracking-widest">
                        最后更新: 2025年1月1日
                    </p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-all">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 prose prose-stone max-w-none text-stone-600 leading-relaxed font-sans text-sm">
            {type === 'privacy' ? (
                <>
                    <h4>1. 信息收集</h4>
                    <p>ArtIsLife ("我们") 尊重并保护所有使用服务用户的个人隐私权。为了给您提供更准确、更有个性化的服务，我们会按照本隐私权政策的规定使用和披露您的个人信息。</p>
                    <p>我们在您注册账号时，会收集您的用户名、电子邮箱地址等信息。在使用 AI 创作功能时，我们会临时处理您的提示词（Prompts）和生成的图片数据，但不会将其用于训练第三方模型。</p>
                    
                    <h4>2. 信息使用</h4>
                    <p>我们收集的信息将用于：(a) 向您提供服务；(b) 改进产品体验；(c) 在征得您同意的情况下发送服务通知。</p>
                    
                    <h4>3. 信息披露</h4>
                    <p>在如下情况下，我们将依据您的个人意愿或法律的规定全部或部分的披露您的个人信息：(a) 经您事先同意，向第三方披露；(b) 为提供您所要求的产品和服务，而必须和第三方分享您的个人信息。</p>
                    
                    <h4>4. 数据安全</h4>
                    <p>我们使用 SSL 加密技术传输数据，并将您的信息加密存储在安全的服务器上。尽管如此，请注意互联网传输并非 100% 安全。</p>
                </>
            ) : (
                <>
                    <h4>1. 服务条款的确认和接纳</h4>
                    <p>ArtIsLife 的各项电子服务的所有权和运作权归 ArtIsLife Inc. 所有。用户同意所有注册协议条款并完成注册程序，才能成为本站的正式用户。</p>
                    
                    <h4>2. 用户行为规范</h4>
                    <p>用户在使用 AI 创作服务时，不得生成含有暴力、色情、政治敏感或侵犯他人版权的内容。一经发现，我们有权立即封禁账号。</p>
                    
                    <h4>3. 知识产权</h4>
                    <p>用户使用本平台 AI 生成的图片，其商业使用权归用户所有（取决于具体会员等级的授权范围），但平台保留展示权用于产品宣传。</p>
                    
                    <h4>4. 免责声明</h4>
                    <p>鉴于 AI 技术的特殊性，我们不保证生成的艺术作品完全符合您的预期，也不对因使用生成内容而导致的任何法律纠纷承担责任。</p>
                    
                    <h4>5. 协议修改</h4>
                    <p>我们保留在必要时修改本协议的权利。修改后的条款一旦公布即有效代替原来的服务条款。</p>
                </>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-sm font-bold transition-colors">
                关闭
            </button>
            <button onClick={onClose} className="px-6 py-2 bg-art-primary hover:bg-art-accent text-white rounded-lg text-sm font-bold transition-colors">
                我已阅读并同意
            </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
