'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { UserSession } from '@/types';

export default function MemberBooksPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBooks = (query = '', p = 1) => {
    setIsLoading(true);
    fetch(`/api/books?query=${encodeURIComponent(query)}&page=${p}`)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setSession(data.user));

    fetchBooks(search, page);
  }, [page]);

  const columns: Column<any>[] = [
    {
      header: 'ISBN',
      accessorKey: 'isbn',
      cell: (item) => <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{item.isbn}</span>,
    },
    {
      header: 'Title & Category',
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{item.category?.name}</span>
        </div>
      ),
    },
    {
      header: 'Authors',
      cell: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {item.bookAuthors?.map((ba: any) => ba.author.name).join(', ') || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Availability',
      cell: (item) => (
        <Badge variant={item.availableCopies > 0 ? 'AVAILABLE' : 'LOST'}>
          {item.availableCopies > 0 ? `${item.availableCopies} Available` : 'All Copies Borrowed'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar user={session} />
      <div className="flex flex-1 min-w-0">
        <Sidebar role="MEMBER" />
        <main className="flex-1 min-w-0 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Browse Catalog</h1>
            <p className="text-sm text-slate-500">Search available books, check shelf availability, and view catalog details.</p>
          </div>

          <DataTable
            columns={columns}
            data={books}
            isLoading={isLoading}
            searchPlaceholder="Search catalog by title, ISBN, or author..."
            onSearch={(term) => {
              setSearch(term);
              setPage(1);
              fetchBooks(term, 1);
            }}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </main>
      </div>
    </div>
  );
}
