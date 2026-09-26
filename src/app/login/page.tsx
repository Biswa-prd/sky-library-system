'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, KeyRound, Mail, ArrowRight, ShieldCheck, UserCheck, GraduationCap } from '@/components/ui/Icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        toast('Login Failed', data.error || 'Invalid credentials', 'error');
        return;
      }

      toast('Welcome Back!', `Logged in as ${data.user.name}`, 'success');

      if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'LIBRARIAN') {
        router.push('/librarian/dashboard');
      } else {
        router.push('/member/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-400/30 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="inline-flex p-3.5 bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-2xl shadow-xl mb-4">
          <BookOpen className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sky Library Management System</h2>
        <p className="mt-2 text-sm text-slate-600 font-medium">Sign in to your library account to continue</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white/90 backdrop-blur-2xl py-8 px-6 shadow-2xl border border-teal-500/20 sm:rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@library.local"
              required
              className="bg-white border-slate-300 text-slate-900"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-white border-slate-300 text-slate-900"
            />

            <Button type="submit" isLoading={isLoading} className="w-full py-3 text-sm font-bold" icon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </Button>
          </form>

          {/* Quick Fill Demo Credentials */}
          <div className="mt-8 border-t border-slate-200/80 pt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@library.local')}
                className="flex flex-col items-center p-2.5 bg-rose-50/80 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-rose-600 mb-1" />
                <span className="text-[11px] font-bold text-rose-900">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('librarian@library.local')}
                className="flex flex-col items-center p-2.5 bg-teal-50/80 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all shadow-xs"
              >
                <UserCheck className="w-4 h-4 text-teal-600 mb-1" />
                <span className="text-[11px] font-bold text-teal-900">Librarian</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('student@library.local')}
                className="flex flex-col items-center p-2.5 bg-amber-50/80 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all shadow-xs"
              >
                <GraduationCap className="w-4 h-4 text-amber-600 mb-1" />
                <span className="text-[11px] font-bold text-amber-900">Student</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
