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
import { UserPlus } from '@/components/ui/Icons';
import { UserSession } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [session, setSession] = useState<UserSession | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER',
    memberType: 'STUDENT',
    department: '',
    studentId: '',
  });

  const fetchMembers = (query = '', p = 1) => {
    setIsLoading(true);
    fetch(`/api/members?query=${encodeURIComponent(query)}&page=${p}`)
      .then((res) => res.json())
      .then((data) => {
        setMembers(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setSession(data.user));

    fetchMembers(search, page);
  }, [page]);

  const handleSearch = (term: string) => {
    setSearch(term);
    setPage(1);
    fetchMembers(term, 1);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast('Registration Failed', data.error || 'Failed to create user', 'error');
        return;
      }

      toast('User Created', `User ${formData.name} was successfully registered.`, 'success');
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'MEMBER',
        memberType: 'STUDENT',
        department: '',
        studentId: '',
      });
      fetchMembers(search, page);
    } catch (err) {
      toast('Error', 'An error occurred during submission', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast('Status Updated', `User status changed to ${newStatus}`, 'success');
        fetchMembers(search, page);
      }
    } catch (err) {
      toast('Error', 'Failed to update user status', 'error');
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Member ID',
      accessorKey: 'memberId',
      cell: (item) => <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{item.memberId}</span>,
    },
    {
      header: 'Name & Email',
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
          <p className="text-xs text-slate-500">{item.user?.email}</p>
        </div>
      ),
    },
    {
      header: 'Type / Role',
      cell: (item) => (
        <div className="flex items-center space-x-1.5">
          <Badge variant={item.memberType}>{item.memberType}</Badge>
          <Badge variant={item.user?.role}>{item.user?.role}</Badge>
        </div>
      ),
    },
    {
      header: 'Department / ID',
      cell: (item) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {item.department || 'N/A'} {item.studentId ? `(${item.studentId})` : ''}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (item) => <Badge variant={item.user?.status}>{item.user?.status}</Badge>,
    },
    {
      header: 'Actions',
      cell: (item) => (
        <Button
          size="sm"
          variant={item.user?.status === 'ACTIVE' ? 'danger' : 'outline'}
          onClick={() => handleToggleStatus(item.id, item.user?.status)}
        >
          {item.user?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        </Button>
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
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">User Management</h1>
              <p className="text-sm text-slate-500">Provision user accounts, assign roles, and manage system access.</p>
            </div>
            <Button icon={<UserPlus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
              Add New User
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={members}
            isLoading={isLoading}
            searchPlaceholder="Search by name, member ID, or email..."
            onSearch={handleSearch}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

          {/* Create User Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Register New Account"
            description="Add a librarian or member profile to the library system."
          >
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Initial Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank for default: Library@123"
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="System Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  options={[
                    { label: 'Member', value: 'MEMBER' },
                    { label: 'Librarian', value: 'LIBRARIAN' },
                  ]}
                />
                <Select
                  label="Member Type"
                  value={formData.memberType}
                  onChange={(e) => setFormData({ ...formData, memberType: e.target.value })}
                  options={[
                    { label: 'Student', value: 'STUDENT' },
                    { label: 'Faculty', value: 'FACULTY' },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                />
                <Input
                  label="Student / Staff ID"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="e.g. CS-2026-09"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Create Account
                </Button>
              </div>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
