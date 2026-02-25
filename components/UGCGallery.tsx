import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UGCPost, UGCComment, User, ViewState } from '../types';
import { authService } from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Upload, Heart, MessageCircle, Trash2, X, Send, Image as ImageIcon,
  Sparkles, PenTool, Tag, ChevronLeft, ChevronRight, Loader2, Plus, Users
} from 'lucide-react';

interface UGCGalleryProps {
  user: User | null;
  onAuthRequired: () => void;
  onNavigate: (view: ViewState) => void;
  isActive?: boolean;
}

// Compress image via canvas to keep localStorage usage low
async function compressImage(file: File, maxDim = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
          else { width = Math.round((width * maxDim) / height); height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Upload Form ──────────────────────────────────────────────────────────────
const UploadForm: React.FC<{
  user: User;
  onSubmit: (post: UGCPost) => void;
  onCancel: () => void;
}> = ({ user, onSubmit, onCancel }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isAI, setIsAI] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('请上传图片文件'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('图片不能超过 5MB'); return; }
    setError('');
    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
    } catch { setError('图片处理失败，请重试'); }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/[,，]/g, '');
    if (t && !tags.includes(t) && tags.length < 5) { setTags([...tags, t]); setTagInput(''); }
  };

  const handleSubmit = async () => {
    if (!preview) { setError('请先上传图片'); return; }
    if (!title.trim()) { setError('请填写作品标题'); return; }
    setSubmitting(true);
    try {
      const post = await authService.createUGCPost({
        userId: user.id, userName: user.name, userAvatar: user.avatar,
        imageUrl: preview, title: title.trim(),
        description: description.trim() || undefined,
        tags, isAIGenerated: isAI,
      });
      onSubmit(post);
    } catch (e: any) { setError(e.message || '发布失败'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog" aria-modal="true" aria-label="上传作品">
      <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-stone-900">分享你的创作</h2>
            <button onClick={onCancel} aria-label="关闭" className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Drop zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer mb-6 overflow-hidden
              ${dragging ? 'border-art-primary bg-art-primary/5' : 'border-stone-200 hover:border-art-primary/50'}`}
            style={{ minHeight: preview ? 'auto' : '200px' }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            role="button" tabIndex={0} aria-label="点击或拖拽上传图片"
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {preview ? (
              <img src={preview} alt="预览" className="w-full max-h-64 object-contain rounded-2xl" />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                <Upload size={40} className="mb-3 text-stone-300" />
                <p className="font-medium text-sm">点击或拖拽上传图片</p>
                <p className="text-xs mt-1">支持 JPG、PNG、WebP，最大 5MB</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="作品标题 *"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-art-primary transition-colors"
              maxLength={60} aria-label="作品标题" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="描述你的创作灵感（可选）"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm resize-none focus:outline-none focus:border-art-primary transition-colors"
              rows={3} maxLength={300} aria-label="作品描述" />

            {/* Tags */}
            <div className="flex gap-2 flex-wrap items-center">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                  #{t}
                  <button onClick={() => setTags(tags.filter(x => x !== t))} aria-label={`删除标签 ${t}`} className="no-min ml-1 text-stone-400 hover:text-red-500">
                    <X size={10} />
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <div className="flex gap-1">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
                    placeholder="添加标签" className="px-3 py-1 border border-stone-200 rounded-full text-xs focus:outline-none focus:border-art-primary w-24"
                    aria-label="添加标签" />
                  <button onClick={addTag} aria-label="确认标签" className="p-1 rounded-full bg-stone-100 hover:bg-stone-200 no-min">
                    <Plus size={14} className="text-stone-500" />
                  </button>
                </div>
              )}
            </div>

            {/* AI toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${isAI ? 'bg-art-primary' : 'bg-stone-200'}`}
                onClick={() => setIsAI(!isAI)} role="switch" aria-checked={isAI} tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setIsAI(!isAI)}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isAI ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-stone-600 flex items-center gap-1.5">
                <Sparkles size={14} className="text-art-primary" /> AI 生成作品
              </span>
            </label>

            {error && <p className="text-red-500 text-xs font-medium" role="alert">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button onClick={onCancel} className="flex-1 py-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-500 hover:bg-stone-50 transition-colors">
                取消
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-3 bg-art-accent text-white rounded-xl text-sm font-bold hover:bg-art-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {submitting ? '发布中…' : '发布作品'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Post Modal ───────────────────────────────────────────────────────────────
const PostModal: React.FC<{
  post: UGCPost;
  user: User | null;
  onClose: () => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => Promise<void>;
  onDelete: (postId: string) => void;
}> = ({ post, user, onClose, onLike, onComment, onDelete }) => {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLiked = user ? post.likedByIds.includes(user.id) : false;

  // Focus trap
  useEffect(() => {
    closeRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const submitComment = async () => {
    if (!commentText.trim() || !user) return;
    setSubmitting(true);
    await onComment(post.id, commentText.trim());
    setCommentText('');
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog" aria-modal="true" aria-label={post.title}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Image side */}
        <div className="md:w-1/2 bg-stone-100 flex items-center justify-center min-h-[300px] relative">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-contain max-h-[60vh] md:max-h-[92vh]" />
          {post.isAIGenerated && (
            <span className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 bg-black/60 text-white text-[10px] font-bold rounded-full backdrop-blur-sm">
              <Sparkles size={10} /> AI 生成
            </span>
          )}
        </div>

        {/* Info side */}
        <div className="md:w-1/2 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center font-serif italic text-stone-600 text-sm overflow-hidden">
                {post.userAvatar ? <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" /> : post.userName[0]}
              </div>
              <div>
                <p className="font-bold text-sm text-stone-900">{post.userName}</p>
                <p className="text-[10px] text-stone-400">{new Date(post.timestamp).toLocaleDateString('zh-CN')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.id === post.userId && (
                <button onClick={() => { onDelete(post.id); onClose(); }}
                  aria-label="删除作品" className="p-2 rounded-full hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
              <button ref={closeRef} onClick={onClose} aria-label="关闭"
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 border-b border-stone-100">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">{post.title}</h3>
            {post.description && <p className="text-sm text-stone-500 leading-relaxed mb-3">{post.description}</p>}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-stone-100 rounded-full text-[10px] font-medium text-stone-500">#{t}</span>
                ))}
              </div>
            )}
            <button onClick={() => onLike(post.id)}
              aria-label={isLiked ? '取消点赞' : '点赞'} aria-pressed={isLiked}
              className={`mt-4 flex items-center gap-2 text-sm font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-stone-400 hover:text-red-400'}`}>
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              {post.likedByIds.length} 个喜欢
            </button>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {post.comments.length === 0 && (
              <p className="text-stone-300 text-sm text-center py-4">还没有评论，来说第一句话吧</p>
            )}
            {post.comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-serif italic text-stone-500 shrink-0">
                  {c.userName[0]}
                </div>
                <div>
                  <span className="font-bold text-xs text-stone-700 mr-2">{c.userName}</span>
                  <span className="text-sm text-stone-600">{c.text}</span>
                  <p className="text-[10px] text-stone-300 mt-0.5">{new Date(c.timestamp).toLocaleString('zh-CN')}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment input */}
          {user ? (
            <div className="p-4 border-t border-stone-100 flex gap-3 items-center">
              <input ref={inputRef} value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
                placeholder="写下你的感想…" maxLength={200}
                className="flex-1 px-4 py-2.5 bg-stone-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-art-primary/30 transition-all"
                aria-label="评论内容" />
              <button onClick={submitComment} disabled={submitting || !commentText.trim()}
                aria-label="发送评论"
                className="p-2.5 bg-art-accent text-white rounded-full hover:bg-art-primary transition-colors disabled:opacity-40">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          ) : (
            <p className="p-4 text-center text-xs text-stone-400 border-t border-stone-100">登录后参与评论</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Post Card ────────────────────────────────────────────────────────────────
const PostCard: React.FC<{
  post: UGCPost;
  user: User | null;
  onOpen: () => void;
  onLike: (postId: string) => void;
}> = ({ post, user, onOpen, onLike }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isLiked = user ? post.likedByIds.includes(user.id) : false;

  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border border-stone-100">
      <button className="w-full text-left focus-visible:ring-2 focus-visible:ring-art-primary" onClick={onOpen} aria-label={`查看作品：${post.title}`}>
        <div className="relative aspect-square bg-stone-100 overflow-hidden">
          {!imgLoaded && <div className="absolute inset-0 bg-stone-200 animate-pulse" />}
          <img src={post.imageUrl} alt={post.title} loading="lazy"
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)} />
          {post.isAIGenerated && (
            <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/50 text-white text-[9px] font-bold rounded-full backdrop-blur-sm">
              <Sparkles size={8} /> AI
            </span>
          )}
        </div>
      </button>
      <div className="p-4">
        <button onClick={onOpen} className="w-full text-left no-min">
          <h3 className="font-serif font-bold text-stone-900 text-sm truncate mb-1">{post.title}</h3>
          <p className="text-[11px] text-stone-400 truncate">{post.userName}</p>
        </button>
        <div className="flex items-center justify-between mt-3">
          <button onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
            aria-label={isLiked ? '取消点赞' : '点赞'} aria-pressed={isLiked}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors no-min ${isLiked ? 'text-red-500' : 'text-stone-300 hover:text-red-400'}`}>
            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
            {post.likedByIds.length}
          </button>
          <button onClick={onOpen} aria-label="查看评论"
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-stone-500 transition-colors no-min">
            <MessageCircle size={14} />
            {post.comments.length}
          </button>
        </div>
      </div>
    </article>
  );
};

// ── Main UGCGallery ───────────────────────────────────────────────────────────
const UGCGallery: React.FC<UGCGalleryProps> = ({ user, onAuthRequired, onNavigate, isActive }) => {
  const [posts, setPosts] = useState<UGCPost[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [activePost, setActivePost] = useState<UGCPost | null>(null);
  const [filter, setFilter] = useState<'all' | 'ai' | 'hand'>('all');
  const { t } = useLanguage();

  useEffect(() => {
    if (isActive) setPosts(authService.getUGCPosts());
  }, [isActive]);

  const handleLike = useCallback(async (postId: string) => {
    if (!user) { onAuthRequired(); return; }
    const updated = await authService.toggleLikeUGCPost(user.id, postId);
    setPosts(updated);
    setActivePost(prev => prev?.id === postId ? updated.find(p => p.id === postId) || null : prev);
  }, [user, onAuthRequired]);

  const handleComment = useCallback(async (postId: string, text: string) => {
    if (!user) return;
    const updatedPost = await authService.addUGCComment(postId, { userId: user.id, userName: user.name, text });
    setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    setActivePost(updatedPost);
  }, [user]);

  const handleDelete = useCallback(async (postId: string) => {
    if (!user) return;
    await authService.deleteUGCPost(user.id, postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
  }, [user]);

  const handleUploadSubmit = (post: UGCPost) => {
    setPosts(prev => [post, ...prev]);
    setShowUpload(false);
  };

  const filtered = posts.filter(p =>
    filter === 'all' ? true : filter === 'ai' ? p.isAIGenerated : !p.isAIGenerated
  );

  return (
    <div className="pt-28 pb-20 px-6 md:px-16 max-w-[1800px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-art-primary/10 flex items-center justify-center">
              <Users size={20} className="text-art-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-art-primary/80">Community</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-art-accent italic tracking-tight">艺术社区</h1>
          <p className="text-stone-400 text-sm max-w-md leading-relaxed">分享你的 AI 生成作品或手绘创作，与全球艺术爱好者交流灵感。</p>
        </div>
        <button onClick={() => user ? setShowUpload(true) : onAuthRequired()}
          className="flex items-center gap-3 px-8 py-4 bg-art-accent text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-art-primary transition-all shadow-hard active:scale-95 self-start md:self-auto">
          <Upload size={16} /> 上传作品
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-8" role="tablist" aria-label="作品筛选">
        {([['all', '全部'], ['ai', 'AI 生成'], ['hand', '手绘原创']] as const).map(([val, label]) => (
          <button key={val} role="tab" aria-selected={filter === val}
            onClick={() => setFilter(val)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
              ${filter === val ? 'bg-art-accent text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <ImageIcon size={64} className="text-stone-200 mb-6" />
          <p className="font-serif text-2xl italic text-stone-300 mb-2">还没有作品</p>
          <p className="text-stone-400 text-sm mb-8">成为第一个分享创作的艺术家</p>
          <button onClick={() => user ? setShowUpload(true) : onAuthRequired()}
            className="px-8 py-4 bg-art-accent text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-art-primary transition-all">
            立即上传
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} user={user}
              onOpen={() => setActivePost(post)}
              onLike={handleLike} />
          ))}
        </div>
      )}

      {/* Modals */}
      {showUpload && user && (
        <UploadForm user={user} onSubmit={handleUploadSubmit} onCancel={() => setShowUpload(false)} />
      )}
      {activePost && (
        <PostModal post={activePost} user={user}
          onClose={() => setActivePost(null)}
          onLike={handleLike}
          onComment={handleComment}
          onDelete={handleDelete} />
      )}
    </div>
  );
};

export default UGCGallery;



