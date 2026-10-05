'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { ArrowRightLeft, RotateCw, CheckCircle } from '@/components/ui/Icons';
import { UserSession } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminLoansPage() {
  const { toast } = useToast();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [availableCopies, setAvailableCopies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [issueForm, setIssueForm] = useState({
    memberId: '',
    bookCopyId: '',
  });

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

  const openIssueModal = async () => {
    setIsIssueModalOpen(true);
    const [membersRes, booksRes] = await Promise.all([
      fetch('/api/members?limit=100').then((r) => r.json()),
      fetch('/api/books?availability=AVAILABLE&limit=100').then((r) => r.json()),
    ]);

    setMembers(membersRes.data || []);

    const copiesList: any[] = [];
    (booksRes.data || []).forEach((b: any) => {
      (b.copies || []).forEach((c: any) => {
        if (c.status === 'AVAILABLE') {
          copiesList.push({
            id: c.id,
            label: `[${c.copyCode}] ${b.title} (${c.shelfLocation})`,
          });
        }
      });
    });

    setAvailableCopies(copiesList);
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueForm),
      });

      const data = await res.json();
      if (!res.ok) {
        toast('Issue Failed', data.error || 'Check member limit or copy availability', 'error');
        return;
      }

      toast('Book Issued', 'Loan record created successfully.', 'success');
      setIsIssueModalOpen(false);
      setIssueForm({ memberId: '', bookCopyId: '' });
      fetchLoans(page);
    } catch (err) {
      toast('Error', 'Failed to issue book', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnBook = async (loanId: string) => {
    try {
      const res = await fetch(`/api/loans/${loanId}/return`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        toast('Return Failed', data.error || 'Failed to return book', 'error');
        return;
      }

      const fine = data.result?.fineAmount;
      if (fine > 0) {
        toast('Book Returned (Overdue)', `Book returned with an overdue fine of ₹${fine}`, 'warning');
      } else {
        toast('Book Returned', 'Book successfully returned to shelf.', 'success');
      }

      fetchLoans(page);
    } catch (err) {
      toast('Error', 'Failed to return book', 'error');
    }
  };

  const handleRenewBook = async (loanId: string) => {
    try {
      const res = await fetch(`/api/loans/${loanId}/renew`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        toast('Renewal Failed', data.error || 'Cannot renew loan', 'error');
        return;
      }

      toast('Loan Renewed', `Due date extended to ${formatDate(data.loan.dueDate)}`, 'success');
      fetchLoans(page);
    } catch (err) {
      toast('Error', 'Failed to renew loan', 'error');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Member',
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.member?.name}</p>
          <span className="text-xs font-mono text-slate-500">{item.member?.memberId}</span>
        </div>
      ),
    },
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
      header: 'Issue / Due Date',
      cell: (item) => (
        <div className="text-xs">
          <p className="text-slate-500">Issued: {formatDate(item.issueDate)}</p>
          <p className="font-bold text-indigo-600 dark:text-indigo-400">Due: {formatDate(item.dueDate)}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (item) => <Badge variant={item.status}>{item.status}</Badge>,
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className="flex items-center space-x-2">
          {item.status === 'ACTIVE' && (
            <>
              <Button
                size="sm"
                variant="primary"
                icon={<CheckCircle className="w-3.5 h-3.5" />}
                onClick={() => handleReturnBook(item.id)}
              >
                Return
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<RotateCw className="w-3.5 h-3.5" />}
                onClick={() => handleRenewBook(item.id)}
              >
                Renew
              </Button>
            </>
          )}
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
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Circulation Loans</h1>
              <p className="text-sm text-slate-500">Issue books to members, manage returns, and process renewals.</p>
            </div>
            <Button icon={<ArrowRightLeft className="w-4 h-4" />} onClick={openIssueModal}>
              Issue Book to Member
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={loans}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

          {/* Issue Book Modal */}
          <Modal
            isOpen={isIssueModalOpen}
            onClose={() => setIsIssueModalOpen(false)}
            title="Issue Book to Member"
            description="Select an active member and an available physical copy barcode."
          >
            <form onSubmit={handleIssueBook} className="space-y-4">
              <Select
                label="Select Member"
                value={issueForm.memberId}
                onChange={(e) => setIssueForm({ ...issueForm, memberId: e.target.value })}
                options={[
                  { label: '-- Select Active Member --', value: '' },
                  ...members.map((m) => ({ label: `${m.name} (${m.memberId} - ${m.memberType})`, value: m.id })),
                ]}
                required
              />

              <Select
                label="Select Available Book Copy (Barcode)"
                value={issueForm.bookCopyId}
                onChange={(e) => setIssueForm({ ...issueForm, bookCopyId: e.target.value })}
                options={[
                  { label: '-- Select Copy Barcode --', value: '' },
                  ...availableCopies.map((c) => ({ label: c.label, value: c.id })),
                ]}
                required
              />

              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsIssueModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Confirm Issue
                </Button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
