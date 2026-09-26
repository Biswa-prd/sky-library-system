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
      <div className="flex flex-1">
        <Sidebar role="MEMBER" />
        <main className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-sm text-slate-500">View automated reminders for book due dates, fine alerts, and returns.</p>
          </div>

          <div className="space-y-3">
            {notifications.map((n) => (
              <Card key={n.id} className={n.isRead ? 'opacity-70' : 'border-indigo-200 dark:border-indigo-800'}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 rounded-lg">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{n.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                      <span className="text-[11px] text-slate-400 mt-2 block">{formatDate(n.createdAt)}</span>
                    </div>
                  </div>

                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      Mark as Read
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
