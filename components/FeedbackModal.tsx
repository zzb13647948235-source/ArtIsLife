import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    // Simulate API call
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setText('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up relative border border-stone-100">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
        >
            <X size={20}/>
        </button>
        
        {!submitted ? (
            <>
                <h3 className="font-serif text-2xl font-bold text-art-accent mb-2 flex items-center gap-2">
                    <MessageSquare className="text-art-primary" size={24}/> 
                    意见反馈
                </h3>
                <p className="text-stone-500 text-sm mb-6">您的建议是我们进步的动力。请告诉我们需要改进的地方。</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea 
                        className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-art-primary focus:border-transparent outline-none h-32 resize-none text-stone-700 placeholder:text-stone-400"
                        placeholder="请描述您遇到的问题或建议..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                        required
                    />
                    <button 
                      type="submit" 
                      className="w-full py-3 bg-art-primary hover:bg-art-secondary text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                        <Send size={18}/> 提交反馈
                    </button>
                </form>
            </>
        ) : (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle2 size={32}/>
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-800">感谢您的反馈！</h3>
                <p className="text-stone-500 mt-2 text-sm">我们会认真阅读每一条建议。</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;