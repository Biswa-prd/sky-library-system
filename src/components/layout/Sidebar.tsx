'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowRightLeft,
  Receipt,
  FileBarChart,
  History,
  Settings,
  Bell,
  UserCheck,
  X,
} from '@/components/ui/Icons';
import { Role } from '@/types';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/layout/SidebarContext';

interface SidebarProps {
  role: Role;
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        closeMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, closeMobile]);

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

  const navItems = role === 'ADMIN' ? adminNav : role === 'LIBRARIAN' ? librarianNav : memberNav;

  const renderNavLinks = () => (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Navigation</p>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMobile}
            className={cn(
              'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
              isActive
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Icon className={cn('w-4 h-4', isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400')} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Collapsible) */}
      <aside
        className={cn(
          'w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 flex-col py-6 px-4 transition-all duration-200',
          isCollapsed ? 'hidden' : 'hidden md:flex'
        )}
      >
        {renderNavLinks()}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      {isMobileOpen && (
        <aside
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col py-6 px-4 md:hidden animate-in slide-in-from-left duration-200"
          aria-label="Mobile Navigation"
        >
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">Sky Library Menu</span>
            <button
              onClick={closeMobile}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {renderNavLinks()}
        </aside>
      )}
    </>
  );
};
