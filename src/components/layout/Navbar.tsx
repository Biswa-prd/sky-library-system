'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Bell,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  ArrowRightLeft,
  Receipt,
  FileBarChart,
  History,
  Settings,
  UserCheck,
} from '@/components/ui/Icons';
import { UserSession } from '@/types';
import { Badge } from '../ui/Badge';

interface NavbarProps {
  user: UserSession | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const adminNav = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', href: '/admin/users', icon: UserCheck },
    { label: 'Members', href: '/admin/members', icon: Users },
    { label: 'Book Catalog', href: '/admin/books', icon: BookOpen },
    { label: 'Circulation Loans', href: '/admin/loans', icon: ArrowRightLeft },
    { label: 'Fines & Payments', href: '/admin/fines', icon: Receipt },
    { label: 'System Reports', href: '/admin/reports', icon: FileBarChart },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: History },
    { label: 'Policy Settings', href: '/admin/settings', icon: Settings },
  ];

  const librarianNav = [
    { label: 'Dashboard', href: '/librarian/dashboard', icon: LayoutDashboard },
    { label: 'Members', href: '/librarian/members', icon: Users },
    { label: 'Book Catalog', href: '/librarian/books', icon: BookOpen },
    { label: 'Circulation Loans', href: '/librarian/loans', icon: ArrowRightLeft },
    { label: 'Fines Management', href: '/librarian/fines', icon: Receipt },
    { label: 'Reports', href: '/librarian/reports', icon: FileBarChart },
  ];

  const memberNav = [
    { label: 'Dashboard', href: '/member/dashboard', icon: LayoutDashboard },
    { label: 'Browse Catalog', href: '/member/books', icon: BookOpen },
    { label: 'My Loans', href: '/member/loans', icon: ArrowRightLeft },
    { label: 'My Fines', href: '/member/fines', icon: Receipt },
    { label: 'Notifications', href: '/member/notifications', icon: Bell },
  ];

  const navItems = user
    ? user.role === 'ADMIN'
      ? adminNav
      : user.role === 'LIBRARIAN'
      ? librarianNav
      : memberNav
    : [];

  return (
    <header className="h-16 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Drawer Hamburger Button */}
        {user && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="p-1.5 sm:p-2 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-xl shadow-xs transform transition-transform hover:scale-105">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
            Sky Library
          </span>
          <span className="text-[11px] text-teal-700 font-semibold ml-2 hidden sm:inline-block px-2.5 py-0.5 bg-teal-50/80 border border-teal-200/60 rounded-full">
            Library Management System
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Notification Menu Container */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Minimal Dropdown */}
            {isOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl z-50 overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in slide-in-from-top-1">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold text-teal-700 bg-teal-50 dark:bg-teal-950/60 rounded-full">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {loading ? (
                      <div className="p-4 text-center text-xs text-slate-400">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors flex items-start space-x-2.5 ${
                            !n.isRead
                              ? 'bg-teal-50/20 dark:bg-teal-950/20'
                              : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40 opacity-70'
                          }`}
                        >
                          <div
                            className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                              !n.isRead ? 'bg-teal-500' : 'bg-transparent'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate">{n.title}</p>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 text-[11px] leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {user.role === 'MEMBER' && (
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          router.push('/member/notifications');
                        }}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        View all
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User Profile Info & Avatar */}
          <div className="flex items-center space-x-2 pl-1 sm:pl-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-teal-500/20">
                {getInitials(user.name)}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-semibold text-slate-900 dark:text-white max-w-[110px] truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium capitalize">
                  {user.role.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Frameless Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl p-5 overflow-y-auto md:hidden flex flex-col justify-between animate-in slide-in-from-left">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-xl shadow-xs">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    Sky Library
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {user && (
                <div className="flex items-center space-x-3 p-2.5 mb-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase">{user.role}</p>
                  </div>
                </div>
              )}

              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Navigation
              </p>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {user && (
              <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};
