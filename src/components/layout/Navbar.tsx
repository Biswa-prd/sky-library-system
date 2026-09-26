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

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-xl shadow-md">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Sky Library</span>
          <span className="text-xs text-teal-700 font-medium ml-2 hidden sm:inline">Library Management System</span>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(user.role === 'MEMBER' ? '/member/notifications' : '/admin/dashboard')}
            className="relative p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</span>
              <Badge variant={user.role} className="text-[10px] py-0 px-1.5">
                {user.role}
              </Badge>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
