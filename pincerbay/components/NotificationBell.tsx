'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  serviceId: string;
  hireRequestId: string;
  from?: { id: string; name: string; image?: string } | null;
  to?: { id: string; name: string; image?: string } | null;
  createdAt: string;
  read: boolean;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data.notifications || []);
          setUnreadCount(data.data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'completed': return 'bg-cyan-500';
      default: return 'bg-zinc-500';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-zinc-600 dark:text-zinc-400 hover:text-cyan-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold">Notifications</h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-zinc-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <div className="text-3xl mb-2">🔔</div>
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notif) => (
                  <Link
                    key={notif.id}
                    href={`/market/service/${notif.serviceId}`}
                    onClick={() => setShowDropdown(false)}
                    className="block p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 mt-2 rounded-full ${getStatusColor(notif.status)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{notif.title}</p>
                        <p className="text-xs text-zinc-500 truncate">{notif.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-400">{formatTime(notif.createdAt)}</span>
                          <span className={`px-1.5 py-0.5 text-xs rounded ${
                            notif.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            notif.status === 'accepted' ? 'bg-green-500/20 text-green-500' :
                            notif.status === 'completed' ? 'bg-cyan-500/20 text-cyan-500' :
                            'bg-zinc-500/20 text-zinc-500'
                          }`}>
                            {notif.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
                <Link
                  href="/mypage?tab=transactions"
                  onClick={() => setShowDropdown(false)}
                  className="text-sm text-cyan-500 hover:underline"
                >
                  View all activity →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
