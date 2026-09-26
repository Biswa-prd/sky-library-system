'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Download, FileBarChart } from '@/components/ui/Icons';
import { UserSession } from '@/types';

export default function AdminReportsPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [reportType, setReportType] = useState('borrowing_activity');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = () => {
    setIsLoading(true);
    let url = `/api/reports?type=${reportType}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setReportData(data.data || []))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setSession(data.user));

    fetchReport();
  }, [reportType]);

  const handleExportCSV = () => {
    let url = `/api/reports/export?type=${reportType}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    window.location.href = url;
  };

  const headers = reportData.length > 0 ? Object.keys(reportData[0]) : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar user={session} />
      <div className="flex flex-1">
        <Sidebar role="ADMIN" />
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Reports</h1>
              <p className="text-sm text-slate-500">Generate circulation reports and export metrics as CSV.</p>
            </div>
            <Button icon={<Download className="w-4 h-4" />} onClick={handleExportCSV} disabled={reportData.length === 0}>
              Export to CSV
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[
                { label: 'Borrowing Activity Log', value: 'borrowing_activity' },
                { label: 'Fine Collection Summary', value: 'fine_collection' },
                { label: 'Most Borrowed Books', value: 'most_borrowed' },
              ]}
            />
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Button icon={<FileBarChart className="w-4 h-4" />} onClick={fetchReport} isLoading={isLoading}>
              Generate Report
            </Button>
          </div>

          {/* Report Data Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 uppercase font-semibold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    {headers.map((h, i) => (
                      <td key={i} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {'' + (row[h] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
