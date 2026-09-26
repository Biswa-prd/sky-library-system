'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { RotateCw } from '@/components/ui/Icons';
import { UserSession } from '@/types';
import { formatDate } from '@/lib/utils';

export default function MemberLoansPage() {
  const { toast } = useToast();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLoans = (p = 1) => {
    setIsLoading(true);
    fetch(`/api/loans?page=${p}`)
      .then((res) => res.json())
      .then((data) => {
        setLoans(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setSession(data.user));

    fetchLoans(page);
  }, [page]);

  const handleRenewBook = async (loanId: string) => {
    try {
      const res = await fetch(`/api/loans/${loanId}/renew`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast('Renewal Failed', data.error || 'Cannot renew loan', 'error');
        return;
      }

      toast('Loan Renewed', `New due date is ${formatDate(data.loan.dueDate)}`, 'success');
      fetchLoans(page);
    } catch (err) {
      toast('Error', 'Failed to renew loan', 'error');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Book Title & Barcode',
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.book?.title}</p>
          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{item.bookCopy?.copyCode}</span>
        </div>
      ),
    },
    {
      header: 'Issued Date',
      cell: (item) => <span className="text-xs text-slate-500">{formatDate(item.issueDate)}</span>,
    },
    {
      header: 'Due Date',
      cell: (item) => (
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{formatDate(item.dueDate)}</span>
      ),
    },
    {
      header: 'Status',
      cell: (item) => <Badge variant={item.status}>{item.status}</Badge>,
    },
    {
      header: 'Renewals Used',
      cell: (item) => <span className="text-xs font-medium text-slate-600">{item.renewalCount} / 2</span>,
    },
    {
      header: 'Action',
      cell: (item) => (
        <div>
          {item.status === 'ACTIVE' && (
            <Button
              size="sm"
              variant="outline"
              icon={<RotateCw className="w-3.5 h-3.5" />}
              onClick={() => handleRenewBook(item.id)}
            >
              Renew Loan
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar user={session} />
      <div className="flex flex-1">
        <Sidebar role="MEMBER" />
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Borrowed Books</h1>
            <p className="text-sm text-slate-500">View active loans, due dates, and renew eligible books online.</p>
          </div>

          <DataTable
            columns={columns}
            data={loans}
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
