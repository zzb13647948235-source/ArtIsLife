import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UGCPost, UGCComment, User, ViewState } from '../types';
import { authService } from '../services/authService';
import {
  Upload, Heart, MessageCircle, Trash2, X, Send, Sparkles,
  Plus, Loader2, Eye, Bell, TrendingUp, Flame, Clock, ImageIcon,
  Share2, Bookmark, MoreHorizontal
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

// Avatar colors palette
const AVATAR_COLORS = [
  'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400',
  'bg-teal-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400'
];
const getAvatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

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
        userId: user.id, userName: user.name, userAvatar: user.avatar ?? null,
        imageUrl: preview, title: title.trim(),
        description: description.trim() || null,
        tags, isAIGenerated: isAI,
      });
      onSubmit(post);
    } catch (e: any) { setError(e.message || '发布失败'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-[#FEFCF8] border-2 border-black rounded-t-[28px] md:rounded-[28px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-xl text-black">✏️ 分享你的创作</h2>
            <button onClick={onCancel} className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-black hover:bg-black hover:text-white text-black transition-colors active:scale-90">
              <X size={16} />
            </button>
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl transition-all cursor-pointer mb-4 overflow-hidden flex items-center justify-center
              ${dragging ? 'border-black bg-yellow-50' : 'border-stone-300 hover:border-black'}`}
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
                  <p className="text-sm font-bold">点击或拖拽上传图片</p>
                  <p className="text-xs text-stone-300">JPG / PNG / WebP，最大 5MB</p>
                </div>
            }
          </div>

          <div className="space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="作品标题 *"
              className="w-full px-4 py-2.5 border-2 border-black rounded-xl text-sm font-medium focus:outline-none bg-white" maxLength={60} />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="描述你的创作灵感（可选）"
              className="w-full px-4 py-2.5 border-2 border-black rounded-xl text-sm resize-none focus:outline-none bg-white" rows={2} maxLength={300} />

            <div className="flex gap-2 flex-wrap items-center min-h-[32px]">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-yellow-200 border border-black rounded-full text-xs font-bold text-black">
                  #{t}
                  <button onClick={() => setTags(tags.filter(x => x !== t))} className="ml-1 w-4 h-4 flex items-center justify-center hover:text-red-500 transition-colors leading-none active:scale-90">
                    <X size={10} />
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <div className="flex items-center gap-1">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
                    placeholder="添加标签" className="px-3 py-1 border-2 border-black rounded-full text-xs focus:outline-none bg-white w-24" />
                  <button onClick={addTag} className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-black bg-yellow-300 hover:bg-yellow-400 transition-colors active:scale-90">
                    <Plus size={14} className="text-black" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => setIsAI(v => !v)}>
              <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 border-2 border-black ${isAI ? 'bg-yellow-300' : 'bg-stone-200'}`}>
                <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white border border-black rounded-full shadow transition-transform ${isAI ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs font-bold text-black flex items-center gap-1">
                <Sparkles size={12} className="text-yellow-500" /> AI 生成作品
              </span>
            </div>

            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button onClick={onCancel} className="flex-1 py-2.5 border-2 border-black rounded-xl text-sm font-bold text-black hover:bg-stone-100 transition-colors flex items-center justify-center">
                取消
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-stone-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,200,0,1)]">
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
  <div className="mb-4 animate-pulse bg-white border-2 border-stone-200 rounded-2xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,0.08)]">
    <div className="p-3 flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-stone-200 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 bg-stone-200 rounded-full w-1/3" />
        <div className="h-2 bg-stone-100 rounded-full w-1/4" />
      </div>
    </div>
    <div className="bg-stone-100" style={{ height: `${160 + Math.random() * 100}px` }} />
    <div className="p-3 space-y-2">
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
  const avatarColor = getAvatarColor(post.userName);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    onLike(post.id);
  };

  return (
    <div className="mb-4 cursor-pointer group" onClick={() => onOpen(post)}>
      <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-200">
        {/* Card header */}
        <div className="px-3 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-full ${avatarColor} border-2 border-black flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
              {post.userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-black truncate leading-tight">{post.userName}</p>
              <p className="text-[9px] text-stone-400 leading-tight">{new Date(post.timestamp).toLocaleDateString('zh-CN')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {post.isAIGenerated && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-300 border border-black rounded-full text-[8px] font-black text-black">
                <Sparkles size={7} /> AI
              </span>
            )}
            {isOwner && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                className="w-6 h-6 flex items-center justify-center rounded-full border border-stone-200 text-stone-400 hover:border-red-400 hover:text-red-500 transition-colors active:scale-90"
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="relative overflow-hidden border-y-2 border-black">
          <img src={post.imageUrl} alt={post.title} className="w-full object-cover block transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
        </div>

        {/* Card body */}
        <div className="px-3 pt-2.5 pb-3">
          <p className="text-xs font-black text-black line-clamp-2 leading-snug mb-2">{post.title}</p>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.tags.slice(0, 3).map(t => (
                <span key={t} className="text-[9px] font-bold text-black bg-yellow-200 border border-black px-1.5 py-0.5 rounded-full">#{t}</span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-stone-100">
            <div className="flex items-center gap-3">
              <button onClick={handleLike}
                className={`flex items-center gap-1 text-[10px] font-black transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'text-stone-400 hover:text-red-400'} ${likeAnim ? 'scale-125' : ''}`}>
                <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{post.likedByIds.length}</span>
              </button>
              <span className="flex items-center gap-1 text-[10px] font-bold text-stone-400">
                <MessageCircle size={12} /><span>{post.comments.length}</span>
              </span>
            </div>
            <span className="flex items-center gap-1 text-[9px] text-stone-300">
              <Eye size={10} />{post.viewCount ?? 0}
            </span>
          </div>
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
  const avatarColor = getAvatarColor(post.userName);

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
      className="fixed inset-0 z-[600] flex items-end md:items-center justify-center bg-black/60"
      role="dialog" aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#FEFCF8] border-2 border-black rounded-t-[28px] md:rounded-[28px] w-full max-w-5xl max-h-[95vh] md:max-h-[92vh] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row">

        {/* Image */}
        <div className="md:w-[45%] max-h-[38vh] md:max-h-none bg-stone-950 flex items-center justify-center overflow-hidden flex-shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-black">
          <img src={post.imageUrl} alt={post.title} className="w-full h-full object-contain" />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black flex-shrink-0 bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-full ${avatarColor} border-2 border-black flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                {post.userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-black truncate">{post.userName}</p>
                <p className="text-[10px] text-stone-400">{new Date(post.timestamp).toLocaleDateString('zh-CN')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              {isOwner && (
                <button onClick={() => { onDelete(post.id); onClose(); }}
                  className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-black hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors active:scale-90">
                  <Trash2 size={14} />
                </button>
              )}
              <button onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-black hover:bg-stone-100 text-black transition-colors active:scale-90">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Post info */}
          <div className="px-4 py-3 border-b-2 border-black flex-shrink-0 bg-[#FEFCF8]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-black text-black text-sm leading-snug mb-1">{post.title}</h3>
                {post.description && <p className="text-xs text-stone-500 leading-relaxed">{post.description}</p>}
              </div>
              {post.isAIGenerated && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-300 border border-black text-[9px] font-black rounded-full flex-shrink-0">
                  <Sparkles size={8} /> AI
                </span>
              )}
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {post.tags.map(t => (
                  <span key={t} className="text-[10px] font-bold text-black bg-yellow-200 border border-black px-2 py-0.5 rounded-full">#{t}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 mt-3">
              <button onClick={() => onLike(post.id)}
                className={`flex items-center gap-1.5 text-xs font-black transition-colors active:scale-90 ${isLiked ? 'text-red-500' : 'text-stone-400 hover:text-red-400'}`}>
                <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                <span>{post.likedByIds.length}</span>
              </button>
              <span className="flex items-center gap-1.5 text-xs font-bold text-stone-400">
                <MessageCircle size={14} /><span>{post.comments.length}</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-stone-400">
                <Eye size={14} /><span>{post.viewCount ?? 0}</span>
              </span>
            </div>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 bg-[#FEFCF8]">
            {post.comments.length === 0
              ? <p className="text-xs text-stone-400 text-center py-6 font-bold">暂无评论，来说第一句话吧 💬</p>
              : post.comments.map(c => {
                  const cColor = getAvatarColor(c.userName);
                  return (
                    <div key={c.id} className="flex gap-2 items-start">
                      <div className={`w-6 h-6 rounded-full ${cColor} border-2 border-black flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 mt-0.5`}>
                        {c.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 bg-white border-2 border-black rounded-2xl px-3 py-2 flex-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-xs font-black text-black">{c.userName} </span>
                        <span className="text-xs text-stone-600 break-words">{c.text}</span>
                      </div>
                    </div>
                  );
                })
            }
            <div ref={commentsEndRef} />
          </div>

          {/* Comment input */}
          <div className="px-4 py-3 border-t-2 border-black flex-shrink-0 bg-white">
            {user
              ? <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full ${getAvatarColor(user.name)} border-2 border-black flex items-center justify-center text-white text-[9px] font-black flex-shrink-0`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitComment()}
                    placeholder="说点什么…"
                    className="flex-1 px-3 py-2 bg-stone-50 border-2 border-black rounded-full text-xs focus:outline-none font-medium"
                  />
                  <button
                    onClick={submitComment}
                    disabled={submitting || !commentText.trim()}
                    className="w-9 h-9 flex items-center justify-center bg-black text-white rounded-full disabled:opacity-40 hover:bg-stone-800 transition-colors flex-shrink-0 active:scale-90 border-2 border-black"
                  >
                    {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  </button>
                </div>
              : <button onClick={onAuthRequired}
                  className="w-full py-2 text-xs font-bold text-black bg-yellow-200 border-2 border-black rounded-full hover:bg-yellow-300 transition-colors">
                  登录后参与评论 ✍️
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

  // 2-column masonry on mobile, 3 on desktop
  const col1 = filteredPosts.filter((_, i) => i % 3 === 0);
  const col2 = filteredPosts.filter((_, i) => i % 3 === 1);
  const col3 = filteredPosts.filter((_, i) => i % 3 === 2);

  return (
    <div className="min-h-full pb-16 animate-fade-in" style={{
      background: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)',
      backgroundSize: '24px 24px',
      backgroundColor: '#FDF8F0',
    }}>
      <div className="pt-20 md:pt-28 px-4 md:px-8 max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-black text-4xl md:text-5xl text-black leading-tight tracking-tight">创作广场 🎨</h1>
              <p className="text-xs text-stone-500 mt-2 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block border border-green-600" />
                实时更新 · <span className="text-black">{posts.length}</span> 件作品
              </p>
            </div>
            <button
              onClick={() => user ? setShowUpload(true) : onAuthRequired()}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-yellow-300 text-black rounded-full text-sm font-black hover:bg-yellow-400 transition-all duration-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 flex-shrink-0 mt-1"
            >
              <Plus size={15} /> 发布作品
            </button>
          </div>

          {/* Sort tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button onClick={() => setSortBy('newest')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all border-2 border-black ${sortBy === 'newest' ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(255,200,0,1)]' : 'bg-white text-black hover:bg-stone-100'}`}>
              <Clock size={12} /> 最新
            </button>
            <button onClick={() => setSortBy('hot')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all border-2 border-black ${sortBy === 'hot' ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(255,200,0,1)]' : 'bg-white text-black hover:bg-stone-100'}`}>
              <Flame size={12} /> 最热
            </button>
          </div>
        </div>

        {/* New posts banner */}
        {newPostCount > 0 && (
          <button onClick={() => setNewPostCount(0)}
            className="w-full mb-5 py-3 bg-black text-yellow-300 rounded-2xl text-sm font-black flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,200,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
            <Bell size={14} /> 🎉 {newPostCount} 条新作品，点击查看
          </button>
        )}

        {/* Tag filter */}
        {trendingTags.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide items-center">
            <TrendingUp size={13} className="text-stone-400 flex-shrink-0" />
            <button onClick={() => setActiveTag(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all flex-shrink-0 border-2 border-black ${!activeTag ? 'bg-black text-yellow-300 shadow-[2px_2px_0px_0px_rgba(255,200,0,1)]' : 'bg-white text-black hover:bg-stone-100'}`}>
              全部
            </button>
            {trendingTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all flex-shrink-0 border-2 border-black ${activeTag === tag ? 'bg-black text-yellow-300 shadow-[2px_2px_0px_0px_rgba(255,200,0,1)]' : 'bg-white text-black hover:bg-stone-100'}`}>
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
            <div className="w-20 h-20 rounded-full bg-white border-2 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ImageIcon size={32} className="text-stone-300" />
            </div>
            <p className="font-black text-sm text-black mb-1">{activeTag ? `没有"#${activeTag}"相关作品` : '还没有作品'}</p>
            <p className="text-xs text-stone-400 mb-6 font-bold">{activeTag ? '换个标签试试' : '来发布第一件创作吧 🎨'}</p>
            {!activeTag && (
              <button onClick={() => user ? setShowUpload(true) : onAuthRequired()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-yellow-300 text-black rounded-full text-sm font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 transition-all active:shadow-none active:translate-x-1 active:translate-y-1">
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

        {showUpload && user && createPortal(
          <UploadForm user={user} onSubmit={(p) => { setPosts(prev => [p, ...prev]); setShowUpload(false); }} onCancel={() => setShowUpload(false)} />,
          document.body
        )}

        {selectedPost && createPortal(
          <PostModal post={selectedPost} user={user} onClose={() => setSelectedPost(null)}
            onLike={handleLike} onComment={handleComment} onDelete={handleDelete} onAuthRequired={onAuthRequired} />,
          document.body
        )}

        <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}`}</style>
      </div>
    </div>
  );
};

export default UGCGallery;




