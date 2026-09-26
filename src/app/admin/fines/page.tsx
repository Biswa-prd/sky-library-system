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
import { Receipt, CreditCard } from '@/components/ui/Icons';
import { UserSession } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminFinesPage() {
  const { toast } = useToast();
  const [session, setSession] = useState<UserSession | null>(null);
  const [fines, setFines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amountPaid: 0,
    paymentMethod: 'CASH',
  });

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

  const openPayModal = (fine: any) => {
    setSelectedFine(fine);
    setPaymentForm({
      amountPaid: Number(fine.amount),
      paymentMethod: 'CASH',
    });
    setIsPayModalOpen(true);
  };

  const handlePayFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFine) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/fines/${selectedFine.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      });

      const data = await res.json();
      if (!res.ok) {
        toast('Payment Failed', data.error || 'Invalid payment amount', 'error');
        return;
      }

      toast('Fine Paid', `Payment of ₹${paymentForm.amountPaid} recorded.`, 'success');
      setIsPayModalOpen(false);
      fetchFines(page);
    } catch (err) {
      toast('Error', 'Failed to record payment', 'error');
    } finally {
      setIsSubmitting(false);
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
      header: 'Book Title',
      cell: (item) => <span className="font-medium text-slate-900 dark:text-white">{item.loan?.book?.title}</span>,
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
      header: 'Actions',
      cell: (item) => (
        <div>
          {item.status === 'UNPAID' && (
            <Button
              size="sm"
              variant="primary"
              icon={<CreditCard className="w-3.5 h-3.5" />}
              onClick={() => openPayModal(item)}
            >
              Collect Fine
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
        <Sidebar role="ADMIN" />
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Fines & Collection</h1>
            <p className="text-sm text-slate-500">Track accrued overdue fines, process payment receipts, and view payment logs.</p>
          </div>

          <DataTable
            columns={columns}
            data={fines}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

          {/* Pay Fine Modal */}
          <Modal
            isOpen={isPayModalOpen}
            onClose={() => setIsPayModalOpen(false)}
            title="Record Fine Payment"
            description={`Member: ${selectedFine?.member?.name} | Book: ${selectedFine?.loan?.book?.title}`}
          >
            <form onSubmit={handlePayFine} className="space-y-4">
              <Input
                label="Amount Paid (INR)"
                type="number"
                step="0.01"
                value={paymentForm.amountPaid}
                onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: Number(e.target.value) })}
                required
              />

              <Select
                label="Payment Method"
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                options={[
                  { label: 'Cash', value: 'CASH' },
                  { label: 'UPI / QR', value: 'UPI' },
                  { label: 'Card / POS', value: 'CARD' },
                  { label: 'Online Transfer', value: 'ONLINE' },
                ]}
              />

              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsPayModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Process Receipt
                </Button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
