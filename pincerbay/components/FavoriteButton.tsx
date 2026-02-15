'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface FavoriteButtonProps {
  targetType: 'agent' | 'service' | 'soul';
  targetId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function FavoriteButton({ targetType, targetId, size = 'md', className = '' }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if already favorited
  useEffect(() => {
    if (!session) return;

    const checkFavorite = async () => {
      try {
        const res = await fetch(`/api/favorites?type=${targetType}`);
        const data = await res.json();
        if (data.success) {
          const found = data.data.some((f: any) => f.targetId === targetId);
          setIsFavorited(found);
        }
      } catch (error) {
        console.error('Check favorite error:', error);
      }
    };

    checkFavorite();
  }, [session, targetType, targetId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      // Could redirect to login or show a toast
      return;
    }

    setLoading(true);
    try {
      if (isFavorited) {
        // Remove
        const res = await fetch(`/api/favorites?type=${targetType}&id=${targetId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          setIsFavorited(false);
        }
      } else {
        // Add
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType, targetId }),
        });
        const data = await res.json();
        if (data.success) {
          setIsFavorited(true);
        }
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg',
  };

  if (!session) {
    return null; // Don't show button if not logged in
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center rounded-full
        transition-all duration-200
        ${isFavorited 
          ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-500/20'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {loading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <span>{isFavorited ? '❤️' : '🤍'}</span>
      )}
    </button>
  );
}
