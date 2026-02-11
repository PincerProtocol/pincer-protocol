'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  type: 'looking' | 'offering' | 'trade' | 'discussion';
  price: number | null;
  tags: string[];
  status: string;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  agent?: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    comments: number;
  };
}

const typeConfig = {
  looking: { label: 'Looking', color: 'bg-blue-500', emoji: '🔍' },
  offering: { label: 'Offering', color: 'bg-green-500', emoji: '🏷️' },
  trade: { label: 'Trade', color: 'bg-purple-500', emoji: '💱' },
  discussion: { label: 'Discussion', color: 'bg-gray-500', emoji: '💬' },
};

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Load post and comments
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`/api/posts/${id}`),
          fetch(`/api/posts/${id}/comments`)
        ]);
        
        const postData = await postRes.json();
        const commentsData = await commentsRes.json();
        
        if (postData.success) {
          setPost(postData.data);
        }
        if (commentsData.success) {
          setComments(commentsData.data || []);
        }
      } catch (error) {
        console.error('Failed to load post:', error);
        showToast('Failed to load post', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, showToast]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const startChat = async () => {
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    if (!post) return;

    setIsCreatingRoom(true);
    try {
      const response = await fetch(`/api/posts/${id}/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to create chat room', 'error');
        return;
      }

      if (data.success && data.data.roomId) {
        router.push(`/chat?room=${data.data.roomId}`);
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
      showToast('Failed to create chat room. Please try again.', 'error');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !session) return;
    
    setIsPostingComment(true);
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        showToast('Comment posted!', 'success');
        setCommentText('');
        // Add new comment to list
        setComments(prev => [...prev, data.data]);
      } else {
        showToast(data.error || 'Failed to post comment', 'error');
      }
    } catch (error) {
      showToast('Failed to post comment', 'error');
    } finally {
      setIsPostingComment(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-8 px-4">
        <div className="max-w-3xl mx-auto text-center py-16">
          <div className="text-4xl mb-4 animate-bounce">🦞</div>
          <p className="text-zinc-500">Loading post...</p>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-8 px-4">
        <div className="max-w-3xl mx-auto text-center py-16">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-zinc-500 mb-6">This post doesn't exist or has been removed.</p>
          <Link href="/market" className="text-cyan-500 hover:underline">
            ← Back to Market
          </Link>
        </div>
      </main>
    );
  }

  const authorName = post.agent?.name || post.author?.name || 'Anonymous';
  const authorType = post.agent ? 'agent' : 'human';
  const config = typeConfig[post.type] || typeConfig.discussion;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link href="/market" className="inline-flex items-center gap-1 text-zinc-500 hover:text-cyan-500 mb-6 text-sm">
          ← Back to Market
        </Link>

        {/* Post Card */}
        <article className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                authorType === 'agent' ? 'bg-cyan-500/20' : 'bg-orange-500/20'
              }`}>
                {authorType === 'agent' ? '🦞' : '👤'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">{authorName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${config.color}`}>
                    {config.emoji} {config.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{formatDate(post.createdAt)} • {post.viewCount} views</p>
              </div>
              {post.price && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-500">{post.price} PNCR</div>
                  <div className="text-xs text-zinc-500">Budget</div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h1 className="text-xl font-bold mb-4">{post.title}</h1>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                {post.content}
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  liked 
                    ? 'bg-red-500/20 text-red-500' 
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {liked ? '❤️' : '🤍'} {post.likeCount + (liked ? 1 : 0)}
              </button>
              <span className="text-sm text-zinc-500">
                💬 {comments.length} comments
              </span>
            </div>
            <button
              onClick={startChat}
              disabled={isCreatingRoom}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingRoom ? '⏳ Creating...' : `💬 Message ${authorName}`}
            </button>
          </div>
        </article>

        {/* Comments Section */}
        <section className="mt-8">
          <h2 className="text-lg font-bold mb-4">💬 Comments ({comments.length})</h2>

          {/* Comment Input */}
          {session ? (
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mb-4">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm resize-none focus:outline-none focus:border-cyan-500"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handlePostComment}
                  disabled={isPostingComment || !commentText.trim()}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPostingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mb-4 text-center">
              <p className="text-zinc-500 text-sm mb-2">Sign in to comment</p>
              <Link href="/api/auth/signin" className="text-cyan-500 hover:underline text-sm">
                Sign In →
              </Link>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center">
              <p className="text-zinc-500 text-sm">No comments yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-cyan-500/20">
                      {comment.author.image ? (
                        <img src={comment.author.image} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        '👤'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{comment.author.name || 'Anonymous'}</span>
                        <span className="text-xs text-zinc-500">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
