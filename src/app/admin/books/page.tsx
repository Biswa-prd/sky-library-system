'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { BookPlus, PlusCircle, Eye } from '@/components/ui/Icons';
import { UserSession } from '@/types';

export default function AdminBooksPage() {
  const { toast } = useToast();
  const [session, setSession] = useState<UserSession | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isAddCopyModalOpen, setIsAddCopyModalOpen] = useState(false);
  const [selectedBookForCopy, setSelectedBookForCopy] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const [bookForm, setBookForm] = useState({
    isbn: '',
    title: '',
    description: '',
    language: 'English',
    pubYear: new Date().getFullYear(),
    categoryId: '',
    authorIds: [] as string[],
    initialBarcode: '',
    shelfLocation: '',
  });

  const [copyForm, setCopyForm] = useState({
    copyCode: '',
    shelfLocation: '',
    status: 'AVAILABLE',
  });

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

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data || []));

    fetch('/api/authors')
      .then((res) => res.json())
      .then((data) => setAuthors(data || []));

    fetchBooks(search, page);
  }, [page]);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        isbn: bookForm.isbn,
        title: bookForm.title,
        description: bookForm.description,
        language: bookForm.language,
        pubYear: Number(bookForm.pubYear),
        categoryId: bookForm.categoryId,
        authorIds: bookForm.authorIds.length > 0 ? bookForm.authorIds : [authors[0]?.id],
      };

      if (bookForm.initialBarcode && bookForm.shelfLocation) {
        payload.initialCopies = [
          { copyCode: bookForm.initialBarcode, shelfLocation: bookForm.shelfLocation },
        ];
      }

      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast('Failed to Add Book', data.error || 'Validation error', 'error');
        return;
      }

      toast('Book Added', `"${bookForm.title}" has been added to catalog.`, 'success');
      setIsAddBookModalOpen(false);
      fetchBooks(search, page);
    } catch (err) {
      toast('Error', 'Failed to create book', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForCopy) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/books/${selectedBookForCopy.id}/copies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copyForm),
      });

      const data = await res.json();
      if (!res.ok) {
        toast('Failed to Add Copy', data.error || 'Barcode error', 'error');
        return;
      }

      toast('Copy Added', `Barcode ${copyForm.copyCode} added to "${selectedBookForCopy.title}".`, 'success');
      setIsAddCopyModalOpen(false);
      fetchBooks(search, page);
    } catch (err) {
      toast('Error', 'Failed to add physical copy', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      header: 'Copies (Avail / Total)',
      cell: (item) => (
        <div className="flex items-center space-x-2">
          <Badge variant={item.availableCopies > 0 ? 'AVAILABLE' : 'LOST'}>
            {item.availableCopies} / {item.totalCopies} Available
          </Badge>
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            icon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => {
              setSelectedBookForCopy(item);
              setIsAddCopyModalOpen(true);
            }}
          >
            Add Copy
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar user={session} />
      <div className="flex flex-1 min-w-0">
        <Sidebar role="ADMIN" />
        <main className="flex-1 min-w-0 p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Book Catalog</h1>
              <p className="text-sm text-slate-500">Manage catalog titles, categories, authors, and physical barcodes.</p>
            </div>
            <Button icon={<BookPlus className="w-4 h-4" />} onClick={() => setIsAddBookModalOpen(true)}>
              Add New Book Title
            </Button>
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

          {/* Add Book Title Modal */}
          <Modal
            isOpen={isAddBookModalOpen}
            onClose={() => setIsAddBookModalOpen(false)}
            title="Add New Book Title"
            description="Create a new entry in the library catalog."
          >
            <form onSubmit={handleCreateBook} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ISBN"
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  placeholder="e.g. 978-0131103627"
                  required
                />
                <Input
                  label="Publication Year"
                  type="number"
                  value={bookForm.pubYear}
                  onChange={(e) => setBookForm({ ...bookForm, pubYear: Number(e.target.value) })}
                  required
                />
              </div>

              <Input
                label="Book Title"
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Category"
                  value={bookForm.categoryId}
                  onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })}
                  options={[
                    { label: '-- Select Category --', value: '' },
                    ...categories.map((c) => ({ label: c.name, value: c.id })),
                  ]}
                  required
                />
                <Select
                  label="Primary Author"
                  value={bookForm.authorIds[0] || ''}
                  onChange={(e) => setBookForm({ ...bookForm, authorIds: [e.target.value] })}
                  options={[
                    { label: '-- Select Author --', value: '' },
                    ...authors.map((a) => ({ label: a.name, value: a.id })),
                  ]}
                />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Initial Physical Copy (Optional)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Barcode / Copy Code"
                    value={bookForm.initialBarcode}
                    onChange={(e) => setBookForm({ ...bookForm, initialBarcode: e.target.value })}
                    placeholder="e.g. BC-1001-1"
                  />
                  <Input
                    label="Shelf Location"
                    value={bookForm.shelfLocation}
                    onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                    placeholder="e.g. Shelf A-3"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsAddBookModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Save Book
                </Button>
              </div>
            </form>
          </Modal>

          {/* Add Physical Copy Modal */}
          <Modal
            isOpen={isAddCopyModalOpen}
            onClose={() => setIsAddCopyModalOpen(false)}
            title={`Add Copy for "${selectedBookForCopy?.title}"`}
            description="Register a unique barcode and shelf location for a physical book copy."
          >
            <form onSubmit={handleAddCopy} className="space-y-4">
              <Input
                label="Barcode / Copy Code"
                value={copyForm.copyCode}
                onChange={(e) => setCopyForm({ ...copyForm, copyCode: e.target.value })}
                placeholder="e.g. BC-2026-99"
                required
              />
              <Input
                label="Shelf Location"
                value={copyForm.shelfLocation}
                onChange={(e) => setCopyForm({ ...copyForm, shelfLocation: e.target.value })}
                placeholder="e.g. Floor 2, Rack 4B"
                required
              />
              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsAddCopyModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Add Physical Copy
                </Button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
