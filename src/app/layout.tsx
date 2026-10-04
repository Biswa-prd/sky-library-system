import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { SidebarProvider } from '@/components/layout/SidebarContext';

export const metadata: Metadata = {
  title: 'Sky Library - Library Management System',
  description: 'Enterprise digital library system for managing catalog, members, circulation, and fines.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <ToastProvider>{children}</ToastProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
