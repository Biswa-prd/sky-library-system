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

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          if (data.notifications) {
            const count = data.notifications.filter((n: any) => !n.isRead).length;
            setUnreadCount(count);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // User initials helper
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b border-teal-500/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-xl shadow-md transform transition-transform hover:scale-105">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Sky Library</span>
          <span className="text-xs text-teal-700 font-semibold ml-2.5 hidden sm:inline-block px-2.5 py-0.5 bg-teal-50 border border-teal-200/80 rounded-full">
            Library Management System
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Notification Button */}
          <button
            onClick={() => router.push(user.role === 'MEMBER' ? '/member/notifications' : '/admin/dashboard')}
            className="relative p-2.5 text-slate-600 hover:text-teal-700 bg-slate-100/80 hover:bg-teal-50 border border-slate-200/80 hover:border-teal-200 rounded-xl transition-all shadow-xs"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md animate-pulse border border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Card */}
          <div className="flex items-center space-x-3 pl-3 sm:pl-4 border-l border-slate-200/80">
            <div className="flex items-center space-x-2.5 bg-white/80 border border-slate-200/80 p-1.5 pr-3 rounded-2xl shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {getInitials(user.name)}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white max-w-[120px] truncate">
                  {user.name}
                </span>
                <Badge variant={user.role} className="text-[9px] py-0 px-1.5 mt-0.5 font-bold uppercase tracking-wider">
                  {user.role}
                </Badge>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/80 hover:border-rose-300 rounded-xl transition-all shadow-xs"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
