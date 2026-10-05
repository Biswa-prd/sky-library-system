'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCircle } from '@/components/ui/Icons';
import { UserSession } from '@/types';
import { formatDate } from '@/lib/utils';

export default function MemberNotificationsPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = () => {
    setIsLoading(true);
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setSession(data.user));

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    fetchNotifications();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar user={session} />
      <div className="flex flex-1 min-w-0">
        <Sidebar role="MEMBER" />
        <main className="flex-1 min-w-0 p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full overflow-x-hidden">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-sm text-slate-500">View automated reminders for book due dates, fine alerts, and returns.</p>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 && !isLoading && (
              <Card className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm font-medium">You have no notifications right now.</p>
              </Card>
            )}

            {notifications.map((n) => (
              <Card
                key={n.id}
                className={`transition-all ${
                  !n.isRead
                    ? 'border-teal-300/80 dark:border-teal-800 bg-teal-50/20 dark:bg-teal-950/10 shadow-xs'
                    : 'border-slate-200/60 dark:border-slate-800 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        !n.isRead
                          ? 'bg-teal-100/70 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-teal-500 inline-block animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] font-medium text-slate-400 mt-2 block">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                  </div>

                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                      icon={<CheckCircle className="w-3.5 h-3.5 text-teal-600" />}
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
