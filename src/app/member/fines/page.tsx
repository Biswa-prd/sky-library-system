'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { UserSession } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function MemberFinesPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [fines, setFines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFines = (p = 1) => {
    setIsLoading(true);
    fetch(`/api/fines?page=${p}`)
      .then((res) => res.json())
      .then((data) => {
        setFines(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setSession(data.user));

    fetchFines(page);
  }, [page]);

  const columns: Column<any>[] = [
    {
      header: 'Book Title',
      cell: (item) => <span className="font-semibold text-slate-900 dark:text-white">{item.loan?.book?.title}</span>,
    },
    {
      header: 'Overdue Days',
      cell: (item) => <span className="text-xs text-rose-500 font-bold">{item.overdueDays} Days Late</span>,
    },
    {
      header: 'Fine Amount',
      cell: (item) => <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>,
    },
    {
      header: 'Status',
      cell: (item) => <Badge variant={item.status}>{item.status}</Badge>,
    },
    {
      header: 'Payment Date',
      cell: (item) => <span className="text-xs text-slate-500">{formatDate(item.paidAt)}</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar user={session} />
      <div className="flex flex-1">
        <Sidebar role="MEMBER" />
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Fines</h1>
            <p className="text-sm text-slate-500">View accrued overdue fines and receipt history.</p>
          </div>

          <DataTable
            columns={columns}
            data={fines}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </main>
      </div>
    </div>
  );
}
