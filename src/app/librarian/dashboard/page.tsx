'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, Users, ArrowRightLeft, Receipt } from '@/components/ui/Icons';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DashboardStats, UserSession } from '@/types';

export default function LibrarianDashboardPage() {
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
        <Sidebar role="LIBRARIAN" />
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Librarian Desk</h1>
            <p className="text-sm text-slate-500">Manage daily circulation operations, book copies, and member requests.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="Available Books" icon={<BookOpen className="w-5 h-5" />}>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? '...' : stats?.availableCopies}
                </span>
                <span className="text-xs text-slate-500 ml-2">Copies Available</span>
              </div>
            </Card>

            <Card title="Currently Issued" icon={<ArrowRightLeft className="w-5 h-5 text-indigo-500" />}>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? '...' : stats?.activeLoans}
                </span>
                <span className="text-xs text-slate-500 ml-2">Active Loans</span>
              </div>
            </Card>

            <Card title="Overdue Books" icon={<ArrowRightLeft className="w-5 h-5 text-rose-500" />}>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                  {isLoading ? '...' : stats?.overdueLoans}
                </span>
                <span className="text-xs text-slate-500 ml-2">Past Due Date</span>
              </div>
            </Card>

            <Card title="Pending Fines" icon={<Receipt className="w-5 h-5 text-amber-500" />}>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isLoading ? '...' : formatCurrency(stats?.outstandingFines)}
                </span>
                <span className="text-xs text-slate-500 ml-2">Uncollected</span>
              </div>
            </Card>
          </div>

          <Card title="Recent Issue Activity" icon={<ArrowRightLeft className="w-5 h-5" />}>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Member</th>
                    <th className="p-2.5">Book Title</th>
                    <th className="p-2.5">Issued Date</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats?.recentLoans?.map((loan: any) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-medium text-slate-900 dark:text-white">{loan.member.name}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-300">{loan.book.title}</td>
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
        </main>
      </div>
    </div>
  );
}
