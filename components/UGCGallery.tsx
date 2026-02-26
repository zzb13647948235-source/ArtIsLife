import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UGCPost, UGCComment, User, ViewState } from '../types';
import { authService } from '../services/authService';
import {
  Upload, Heart, MessageCircle, Trash2, X, Send, Sparkles,
  Plus, Loader2, Eye, Bell, TrendingUp, Flame, Clock, ImageIcon
} from 'lucide-react';

interface UGCGalleryProps {
  user: User | null;
  onAuthRequired: () => void;
  onNavigate: (view: ViewState) => void;
  isActive?: boolean;
}

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
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Upload Form ───────────────────────────────────────────────────────────────
const UploadForm: React.FC<{ user: User; onSubmit: (post: UGCPost) => void; onCancel: () => void }> = ({ user, onSubmit, onCancel }) => {
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
    try { setPreview(await compressImage(file)); } catch { setError('图片处理失败'); }
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
    <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-white rounded-t-[28px] md:rounded-[28px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl font-bold text-stone-900">分享你的创作</h2>
            <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 transition-colors active:scale-90">
              <X size={18} />
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl transition-all cursor-pointer mb-4 overflow-hidden flex items-center justify-center
              ${dragging ? 'border-art-primary bg-art-primary/5' : 'border-stone-200 hover:border-art-primary/50'}`}
            style={{ minHeight: '160px' }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {preview
              ? <img src={preview} alt="预览" className="w-full max-h-56 object-contain" />
              : <div className="flex flex-col items-center gap-2 py-10 text-stone-400">
                  <ImageIcon size={32} className="text-stone-300" />
                  <p className="text-sm font-medium">点击或拖拽上传图片</p>
                  <p className="text-xs text-stone-300">JPG / PNG / WebP，最大 5MB</p>
                </div>
            }
          </div>

          <div className="space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="作品标题 *"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-art-primary transition-colors" maxLength={60} />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="描述你的创作灵感（可选）"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm resize-none focus:outline-none focus:border-art-primary transition-colors" rows={2} maxLength={300} />

            <div className="flex gap-2 flex-wrap items-center min-h-[32px]">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600">
                  #{t}
                  <button onClick={() => setTags(tags.filter(x => x !== t))} className="ml-1 w-4 h-4 flex items-center justify-center text-stone-400 hover:text-red-500 transition-colors leading-none active:scale-90">
                    <X size={10} />
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <div className="flex items-center gap-1">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
                    placeholder="添加标签" className="px-3 py-1 border border-stone-200 rounded-full text-xs focus:outline-none focus:border-art-primary transition-colors w-24" />
                  <button onClick={addTag} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors active:scale-90">
                    <Plus size={14} className="text-stone-500" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => setIsAI(v => !v)}>
              <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${isAI ? 'bg-art-primary' : 'bg-stone-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isAI ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs text-stone-600 flex items-center gap-1">
                <Sparkles size={12} className="text-art-primary" /> AI 生成作品
              </span>
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button onClick={onCancel} className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-bold text-stone-500 hover:bg-stone-50 transition-colors flex items-center justify-center">
                取消
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 bg-art-accent text-white rounded-xl text-sm font-bold hover:bg-art-primary disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {submitting ? '发布中…' : '发布'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// ── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="mb-3 animate-pulse">
    <div className="rounded-2xl bg-stone-100" style={{ height: `${140 + Math.random() * 120}px` }} />
    <div className="px-2.5 pt-2.5 pb-2 space-y-1.5">
      <div className="h-3 bg-stone-100 rounded-full w-3/4" />
      <div className="h-2.5 bg-stone-100 rounded-full w-1/2" />
    </div>
  </div>
);

// ── Post Card ─────────────────────────────────────────────────────────────────
const PostCard: React.FC<{
  post: UGCPost;
  user: User | null;
  onLike: (id: string) => void;
  onOpen: (post: UGCPost) => void;
  onDelete: (id: string) => void;
}> = ({ post, user, onLike, onOpen, onDelete }) => {
  const isLiked = user ? post.likedByIds.includes(user.id) : false;
  const isOwner = user?.id === post.userId;
  const [likeAnim, setLikeAnim] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    onLike(post.id);
  };

  return (
    <div className="mb-3 group cursor-pointer" onClick={() => onOpen(post)}>
      <div className="relative rounded-2xl overflow-hidden bg-stone-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
        <img src={post.imageUrl} alt={post.title} className="w-full object-cover block transition-transform duration-500 group-hover:scale-105" loading="lazy" />

        {post.isAIGenerated && (
          <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/50 text-white text-[9px] font-bold rounded-full backdrop-blur-sm leading-none">
            <Sparkles size={8} /> AI
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <p className="text-white text-xs font-semibold line-clamp-1 drop-shadow">{post.title}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-white/80 text-[10px]"><Heart size={9} fill="currentColor" /> {post.likedByIds.length}</span>
            <span className="flex items-center gap-1 text-white/80 text-[10px]"><MessageCircle size={9} /> {post.comments.length}</span>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 active:scale-90"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>

      <div className="px-2.5 pt-2.5 pb-2">
        <p className="text-xs font-semibold text-stone-800 line-clamp-2 leading-snug mb-2">{post.title}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-art-primary to-art-accent flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
              {post.userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] text-stone-500 truncate">{post.userName}</span>
          </div>
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-[10px] font-semibold flex-shrink-0 ml-2 transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'text-stone-400 hover:text-red-400'} ${likeAnim ? 'scale-125' : ''}`}
          >
            <Heart size={11} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{post.likedByIds.length}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Post Detail Modal ─────────────────────────────────────────────────────────
const PostModal: React.FC<{
  post: UGCPost;
  user: User | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onComment: (postId: string, text: string) => Promise<void>;
  onDelete: (id: string) => void;
  onAuthRequired: () => void;
}> = ({ post, user, onClose, onLike, onComment, onDelete, onAuthRequired }) => {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isLiked = user ? post.likedByIds.includes(user.id) : false;
  const isOwner = user?.id === post.userId;
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div
      className="fixed inset-0 z-[600] flex items-end md:items-center justify-center md:p-4 bg-black/70 md:backdrop-blur-sm"
      role="dialog" aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-[28px] md:rounded-[28px] w-full max-w-3xl max-h-[92vh] md:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">

        {/* Image */}
        <div className="md:w-[45%] max-h-[38vh] md:max-h-none bg-stone-950 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-contain" />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-art-primary to-art-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {post.userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-stone-800 truncate">{post.userName}</p>
                <p className="text-[10px] text-stone-400">{new Date(post.timestamp).toLocaleDateString('zh-CN')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              {isOwner && (
                <button onClick={() => { onDelete(post.id); onClose(); }}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors active:scale-90">
                  <Trash2 size={14} />
                </button>
              )}
              <button onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 transition-colors active:scale-90">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Post info */}
          <div className="px-4 py-3 border-b border-stone-100 flex-shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-stone-900 text-sm leading-snug mb-1">{post.title}</h3>
                {post.description && <p className="text-xs text-stone-500 leading-relaxed">{post.description}</p>}
              </div>
              {post.isAIGenerated && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-art-primary/10 text-art-primary text-[9px] font-bold rounded-full flex-shrink-0">
                  <Sparkles size={8} /> AI
                </span>
              )}
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {post.tags.map(t => (
                  <span key={t} className="text-[10px] text-art-primary font-semibold bg-art-primary/5 px-2 py-0.5 rounded-full">#{t}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 mt-3">
              <button onClick={() => onLike(post.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors active:scale-90 ${isLiked ? 'text-red-500' : 'text-stone-400 hover:text-red-400'}`}>
                <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{post.likedByIds.length}</span>
              </button>
              <span className="flex items-center gap-1.5 text-xs text-stone-400">
                <MessageCircle size={14} /><span>{post.comments.length}</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-400">
                <Eye size={14} /><span>{post.viewCount ?? 0}</span>
              </span>
            </div>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {post.comments.length === 0
              ? <p className="text-xs text-stone-400 text-center py-6">暂无评论，来说第一句话吧</p>
              : post.comments.map(c => (
                <div key={c.id} className="flex gap-2 items-start">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-art-primary/60 to-art-accent/60 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5">
                    {c.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 bg-stone-50 rounded-2xl px-3 py-2 flex-1">
                    <span className="text-xs font-bold text-stone-700">{c.userName} </span>
                    <span className="text-xs text-stone-600 break-words">{c.text}</span>
                  </div>
                </div>
              ))
            }
            <div ref={commentsEndRef} />
          </div>

          {/* Comment input */}
          <div className="px-4 py-3 border-t border-stone-100 flex-shrink-0">
            {user
              ? <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-art-primary to-art-accent flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitComment()}
                    placeholder="说点什么…"
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-full text-xs focus:outline-none focus:border-art-primary/50 transition-colors"
                  />
                  <button
                    onClick={submitComment}
                    disabled={submitting || !commentText.trim()}
                    className="w-9 h-9 flex items-center justify-center bg-art-accent text-white rounded-full disabled:opacity-40 hover:bg-art-primary transition-colors flex-shrink-0 active:scale-90"
                  >
                    {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  </button>
                </div>
              : <button onClick={onAuthRequired}
                  className="w-full py-2 text-xs text-stone-400 bg-stone-50 border border-stone-200 rounded-full hover:bg-stone-100 transition-colors">
                  登录后参与评论
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const UGCGallery: React.FC<UGCGalleryProps> = ({ user, onAuthRequired, isActive }) => {
  const [posts, setPosts] = useState<UGCPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<UGCPost | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'hot'>('newest');

  useEffect(() => {
    const unsub = authService.subscribeToUGC((updated) => {
      setPosts(prev => {
        const newCount = updated.length - prev.length;
        if (newCount > 0 && prev.length > 0) setNewPostCount(n => n + newCount);
        return updated;
      });
      setLoading(false);
    });
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (selectedPost) {
      const updated = posts.find(p => p.id === selectedPost.id);
      if (updated) setSelectedPost(updated);
    }
  }, [posts]);

  const handleLike = useCallback(async (postId: string) => {
    if (!user) { onAuthRequired(); return; }
    await authService.toggleLikeUGCPost(user.id, postId);
  }, [user, onAuthRequired]);

  const handleComment = useCallback(async (postId: string, text: string) => {
    if (!user) { onAuthRequired(); return; }
    await authService.addUGCComment(postId, { userId: user.id, userName: user.name, text });
  }, [user, onAuthRequired]);

  const handleDelete = useCallback(async (postId: string) => {
    if (!user) return;
    await authService.deleteUGCPost(user.id, postId);
    if (selectedPost?.id === postId) setSelectedPost(null);
  }, [user, selectedPost]);

  const trendingTags = Array.from(
    posts.flatMap(p => p.tags).reduce((acc, tag) => {
      acc.set(tag, (acc.get(tag) || 0) + 1); return acc;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag]) => tag);

  const sortedPosts = [...posts].sort((a, b) =>
    sortBy === 'hot' ? (b.likedByIds.length - a.likedByIds.length) : (b.timestamp - a.timestamp)
  );
  const filteredPosts = activeTag ? sortedPosts.filter(p => p.tags.includes(activeTag)) : sortedPosts;

  // 3-column masonry on desktop, 2 on mobile
  const col1 = filteredPosts.filter((_, i) => i % 3 === 0);
  const col2 = filteredPosts.filter((_, i) => i % 3 === 1);
  const col3 = filteredPosts.filter((_, i) => i % 3 === 2);

  return (
    <div className="pt-20 md:pt-28 pb-16 px-4 md:px-8 max-w-[1400px] mx-auto animate-fade-in">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 italic leading-tight">创作广场</h1>
            <p className="text-xs text-stone-400 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              实时更新 · <span className="font-semibold text-stone-500">{posts.length}</span> 件作品
            </p>
          </div>
          <button
            onClick={() => user ? setShowUpload(true) : onAuthRequired()}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-art-accent text-white rounded-full text-sm font-bold hover:bg-art-primary transition-all duration-300 shadow-md active:scale-95 flex-shrink-0 mt-1"
          >
            <Plus size={15} /> 发布作品
          </button>
        </div>

        {/* Sort tabs */}
        <div className="flex items-center gap-2 mt-4">
          <button onClick={() => setSortBy('newest')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sortBy === 'newest' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
            <Clock size={12} /> 最新
          </button>
          <button onClick={() => setSortBy('hot')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${sortBy === 'hot' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
            <Flame size={12} /> 最热
          </button>
        </div>
      </div>

      {/* New posts banner */}
      {newPostCount > 0 && (
        <button onClick={() => setNewPostCount(0)}
          className="w-full mb-5 py-3 bg-art-primary text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-art-accent transition-all shadow-md active:scale-[0.99]">
          <Bell size={14} /> {newPostCount} 条新作品，点击查看
        </button>
      )}

      {/* Tag filter */}
      {trendingTags.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide items-center">
          <TrendingUp size={13} className="text-stone-300 flex-shrink-0" />
          <button onClick={() => setActiveTag(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${!activeTag ? 'bg-art-accent text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
            全部
          </button>
          {trendingTags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${activeTag === tag ? 'bg-art-accent text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex gap-3 items-start">
          {[0, 1, 2].map(col => (
            <div key={col} className={`flex-1 min-w-0 ${col === 2 ? 'hidden md:block' : ''} ${col === 1 ? 'mt-5' : ''}`}>
              {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-stone-400">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
            <ImageIcon size={28} className="text-stone-300" />
          </div>
          <p className="font-semibold text-sm text-stone-500 mb-1">{activeTag ? `没有"#${activeTag}"相关作品` : '还没有作品'}</p>
          <p className="text-xs text-stone-300 mb-6">{activeTag ? '换个标签试试' : '来发布第一件创作吧'}</p>
          {!activeTag && (
            <button onClick={() => user ? setShowUpload(true) : onAuthRequired()}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-art-accent text-white rounded-full text-sm font-bold hover:bg-art-primary transition-all shadow-md active:scale-95">
              <Plus size={14} /> 发布作品
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-3 items-start">
          <div className="flex-1 min-w-0">
            {col1.map(post => <PostCard key={post.id} post={post} user={user} onLike={handleLike} onOpen={setSelectedPost} onDelete={handleDelete} />)}
          </div>
          <div className="flex-1 min-w-0 mt-5">
            {col2.map(post => <PostCard key={post.id} post={post} user={user} onLike={handleLike} onOpen={setSelectedPost} onDelete={handleDelete} />)}
          </div>
          <div className="hidden md:block flex-1 min-w-0 mt-10">
            {col3.map(post => <PostCard key={post.id} post={post} user={user} onLike={handleLike} onOpen={setSelectedPost} onDelete={handleDelete} />)}
          </div>
        </div>
      )}

      {showUpload && user && (
        <UploadForm user={user} onSubmit={(p) => { setPosts(prev => [p, ...prev]); setShowUpload(false); }} onCancel={() => setShowUpload(false)} />
      )}

      {selectedPost && (
        <PostModal post={selectedPost} user={user} onClose={() => setSelectedPost(null)}
          onLike={handleLike} onComment={handleComment} onDelete={handleDelete} onAuthRequired={onAuthRequired} />
      )}

      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
};

export default UGCGallery;

