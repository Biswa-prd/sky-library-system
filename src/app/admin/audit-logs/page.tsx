'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { DataTable, Column } from '@/components/ui/DataTable';
import { UserSession } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminAuditLogsPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = (p = 1) => {
    setIsLoading(true);
    fetch(`/api/audit-logs?page=${p}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setSession(data.user));

    fetchLogs(page);
  }, [page]);

  const columns: Column<any>[] = [
    {
      header: 'Timestamp',
      cell: (item) => <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>,
    },
    {
      header: 'Action',
      cell: (item) => <span className="font-semibold text-slate-900 dark:text-white">{item.action}</span>,
    },
    {
      header: 'Performed By',
      cell: (item) => (
        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">{item.user?.email || 'System'}</span>
      ),
    },
    {
      header: 'Target Entity',
      cell: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {item.entity} ({item.entityId || 'Global'})
        </span>
      ),
    },
    {
      header: 'Details',
      cell: (item) => (
        <span className="text-xs font-mono text-slate-500 truncate max-w-xs inline-block">
          {item.details || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar user={session} />
      <div className="flex flex-1 min-w-0">
        <Sidebar role="ADMIN" />
        <main className="flex-1 min-w-0 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Audit Trail</h1>
            <p className="text-sm text-slate-500">Immutable event log of administrative actions and circulation transactions.</p>
          </div>

          <DataTable
            columns={columns}
            data={logs}
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
