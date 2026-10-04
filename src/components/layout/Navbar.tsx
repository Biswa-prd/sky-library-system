'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Bell, LogOut, User } from '@/components/ui/Icons';
import { UserSession } from '@/types';
import { Badge } from '../ui/Badge';

interface NavbarProps {
  user: UserSession | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = () => {
    if (!user) return;
    setLoading(true);
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) {
          setNotifications(data.notifications);
          const count = data.notifications.filter((n: any) => !n.isRead).length;
          setUnreadCount(count);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(
      unread.map((n) => fetch(`/api/notifications/${n.id}/read`, { method: 'PUT' }))
    );
    loadNotifications();
  };

  // User initials helper
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-xl shadow-xs transform transition-transform hover:scale-105">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
            Sky Library
          </span>
          <span className="text-[11px] text-teal-700 font-semibold ml-2.5 hidden sm:inline-block px-2.5 py-0.5 bg-teal-50/80 border border-teal-200/60 rounded-full">
            Library Management System
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-3">
          {/* Notification Menu Container */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 bg-slate-100/70 hover:bg-teal-50/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl transition-all shadow-2xs group"
              title="Notifications"
            >
              <Bell className="w-4 h-4 transition-transform group-hover:rotate-12" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-bold text-white bg-teal-600 rounded-full border-2 border-white dark:border-slate-900 shadow-2xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Minimal Popover Dropdown */}
            {isOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                <div className="absolute right-0 mt-2.5 w-80 sm:w-88 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl z-50 overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-teal-700 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/50 dark:border-teal-800/50 rounded-full">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {loading ? (
                      <div className="p-4 text-center text-xs text-slate-400">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors flex items-start space-x-2.5 ${
                            !n.isRead
                              ? 'bg-teal-50/30 dark:bg-teal-950/20'
                              : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40 opacity-75'
                          }`}
                        >
                          <div
                            className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                              !n.isRead ? 'bg-teal-500 ring-2 ring-teal-200 dark:ring-teal-900' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">{n.title}</p>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {user.role === 'MEMBER' && (
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 text-center">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          router.push('/member/notifications');
                        }}
                        className="text-[11px] font-semibold text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors"
                      >
                        View all notifications →
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User Profile Card */}
          <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200/70 dark:border-slate-800/80">
            <div className="flex items-center space-x-2 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 p-1 pr-3 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-[11px] shadow-2xs">
                {getInitials(user.name)}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-bold text-slate-800 dark:text-white max-w-[110px] truncate">
                  {user.name}
                </span>
                <Badge variant={user.role} className="text-[8px] py-0 px-1 mt-0.5 font-bold uppercase tracking-wider">
                  {user.role}
                </Badge>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/60 hover:bg-rose-100/80 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-800/50 rounded-xl transition-all shadow-2xs flex items-center space-x-1"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
