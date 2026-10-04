'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, Users, ArrowRightLeft, AlertTriangle, Receipt, History } from '@/components/ui/Icons';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DashboardStats, UserSession } from '@/types';

export default function AdminDashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setSession(data.user))
      .catch(() => {});

    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar user={session} />
      <div className="flex flex-1">
        <Sidebar role="ADMIN" />
        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Admin Overview</h1>
            <p className="text-xs sm:text-sm text-slate-500">Real-time stats and circulation activity across the library branch.</p>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="Total Books" icon={<BookOpen className="w-5 h-5" />}>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? '...' : stats?.totalBooks}
                </span>
                <span className="text-xs text-slate-500 ml-2">({stats?.availableCopies} available copies)</span>
              </div>
            </Card>

            <Card title="Total Members" icon={<Users className="w-5 h-5 text-emerald-500" />}>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? '...' : stats?.totalMembers}
                </span>
                <span className="text-xs text-slate-500 ml-2">Registered Accounts</span>
              </div>
            </Card>

            <Card title="Active Loans" icon={<ArrowRightLeft className="w-5 h-5 text-indigo-500" />}>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? '...' : stats?.activeLoans}
                </span>
                <span className="text-xs text-rose-500 font-semibold ml-2">
                  ({stats?.overdueLoans} Overdue)
                </span>
              </div>
            </Card>

            <Card title="Outstanding Fines" icon={<Receipt className="w-5 h-5 text-amber-500" />}>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? '...' : formatCurrency(stats?.outstandingFines)}
                </span>
                <span className="text-xs text-slate-500 ml-2">Unpaid Fines</span>
              </div>
            </Card>
          </div>

          {/* Activity Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Loans */}
            <Card title="Recent Book Issues" icon={<ArrowRightLeft className="w-5 h-5" />}>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Member</th>
                      <th className="p-2.5">Book</th>
                      <th className="p-2.5">Issue Date</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats?.recentLoans?.map((loan: any) => (
                      <tr key={loan.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-medium text-slate-900 dark:text-white">{loan.member.name}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                          {loan.book.title}
                        </td>
                        <td className="p-2.5 text-slate-500">{formatDate(loan.issueDate)}</td>
                        <td className="p-2.5">
                          <Badge variant={loan.status}>{loan.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Audit Logs Preview */}
            <Card title="Recent System Activity" icon={<History className="w-5 h-5" />}>
              <div className="space-y-3 mt-2">
                {stats?.recentActivity?.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{log.action}</span>
                      <span className="text-slate-500 ml-2">by {log.user?.email || 'System'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{formatDate(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
