'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Save, Settings } from '@/components/ui/Icons';
import { UserSession } from '@/types';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [policy, setPolicy] = useState({
    maxLoansStudent: 3,
    maxLoansFaculty: 5,
    loanDurationDays: 14,
    finePerDay: 5.0,
    maxRenewals: 2,
    libraryName: 'Central University Library',
    contactEmail: 'library@university.edu',
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setSession(data.user));

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setPolicy(data))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });

      if (!res.ok) {
        toast('Save Failed', 'Failed to update system settings', 'error');
        return;
      }

      toast('Settings Saved', 'Library policy settings updated successfully.', 'success');
    } catch (err) {
      toast('Error', 'Failed to save settings', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar user={session} />
      <div className="flex flex-1 min-w-0">
        <Sidebar role="ADMIN" />
        <main className="flex-1 min-w-0 p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full overflow-x-hidden">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Policy Settings</h1>
            <p className="text-sm text-slate-500">Configure central borrowing limits, loan duration, and overdue fine rates.</p>
          </div>

          <Card title="Central Policy Configuration" icon={<Settings className="w-5 h-5" />}>
            <form onSubmit={handleSaveSettings} className="space-y-5 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Student Borrowing Limit (Books)"
                  type="number"
                  value={policy.maxLoansStudent}
                  onChange={(e) => setPolicy({ ...policy, maxLoansStudent: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Faculty Borrowing Limit (Books)"
                  type="number"
                  value={policy.maxLoansFaculty}
                  onChange={(e) => setPolicy({ ...policy, maxLoansFaculty: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Default Loan Duration (Days)"
                  type="number"
                  value={policy.loanDurationDays}
                  onChange={(e) => setPolicy({ ...policy, loanDurationDays: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Overdue Fine Rate (₹ / Day)"
                  type="number"
                  step="0.5"
                  value={policy.finePerDay}
                  onChange={(e) => setPolicy({ ...policy, finePerDay: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Maximum Renewals Allowed"
                  type="number"
                  value={policy.maxRenewals}
                  onChange={(e) => setPolicy({ ...policy, maxRenewals: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Library System Name"
                  value={policy.libraryName}
                  onChange={(e) => setPolicy({ ...policy, libraryName: e.target.value })}
                  required
                />
                <Input
                  label="Contact Email Address"
                  type="email"
                  value={policy.contactEmail}
                  onChange={(e) => setPolicy({ ...policy, contactEmail: e.target.value })}
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={isSubmitting} icon={<Save className="w-4 h-4" />}>
                  Save Policy Configuration
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
    </div>
  );
}
