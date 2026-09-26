import { db } from '@/lib/db';
import { DashboardStats } from '@/types';
import { generateCSV } from '@/lib/utils';

export async function getDashboardStats(role: string, memberUserId?: string): Promise<DashboardStats> {
  if (role === 'MEMBER' && memberUserId) {
    const member = await db.memberProfile.findUnique({
      where: { userId: memberUserId },
    });

    if (!member) {
      return {
        totalBooks: 0,
        availableCopies: 0,
        totalMembers: 0,
        activeLoans: 0,
        overdueLoans: 0,
        outstandingFines: 0,
        recentLoans: [],
      };
    }

    const [activeLoans, overdueLoans, fines, recentLoans] = await Promise.all([
      db.loan.count({ where: { memberId: member.id, status: 'ACTIVE' } }),
      db.loan.count({
        where: {
          memberId: member.id,
          status: 'ACTIVE',
          dueDate: { lt: new Date() },
        },
      }),
      db.fine.aggregate({
        where: { memberId: member.id, status: 'UNPAID' },
        _sum: { amount: true },
      }),
      db.loan.findMany({
        where: { memberId: member.id },
        orderBy: { issueDate: 'desc' },
        take: 5,
        include: {
          book: { select: { title: true, isbn: true } },
          bookCopy: { select: { copyCode: true } },
          fine: true,
        },
      }),
    ]);

    return {
      totalBooks: 0,
      availableCopies: 0,
      totalMembers: 0,
      activeLoans,
      overdueLoans,
      outstandingFines: Number(fines._sum.amount || 0),
      recentLoans,
    };
  }

  // Admin & Librarian stats
  const [
    totalBooks,
    availableCopiesAgg,
    totalMembers,
    activeLoans,
    overdueLoans,
    finesAgg,
    recentLoans,
    recentActivity,
  ] = await Promise.all([
    db.book.count(),
    db.bookCopy.count({ where: { status: 'AVAILABLE' } }),
    db.memberProfile.count(),
    db.loan.count({ where: { status: 'ACTIVE' } }),
    db.loan.count({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: new Date() },
      },
    }),
    db.fine.aggregate({
      where: { status: 'UNPAID' },
      _sum: { amount: true },
    }),
    db.loan.findMany({
      orderBy: { issueDate: 'desc' },
      take: 5,
      include: {
        member: { select: { name: true, memberId: true } },
        book: { select: { title: true, isbn: true } },
      },
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { email: true, role: true } },
      },
    }),
  ]);

  return {
    totalBooks,
    availableCopies: availableCopiesAgg,
    totalMembers,
    activeLoans,
    overdueLoans,
    outstandingFines: Number(finesAgg._sum.amount || 0),
    recentLoans,
    recentActivity,
  };
}

export async function getSystemReportData(type: string, startDate?: string, endDate?: string) {
  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);

  switch (type) {
    case 'most_borrowed': {
      const books = await db.book.findMany({
        select: {
          id: true,
          title: true,
          isbn: true,
          totalCopies: true,
          category: { select: { name: true } },
          _count: { select: { loans: true } },
        },
        orderBy: { loans: { _count: 'desc' } },
        take: 20,
      });

      return books.map((b) => ({
        'Book Title': b.title,
        ISBN: b.isbn,
        Category: b.category.name,
        'Total Borrowed Times': b._count.loans,
        'Total Copies': b.totalCopies,
      }));
    }

    case 'fine_collection': {
      const fines = await db.fine.findMany({
        where: startDate || endDate ? { createdAt: dateFilter } : {},
        include: {
          member: { select: { name: true, memberId: true } },
          loan: { include: { book: { select: { title: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return fines.map((f) => ({
        'Member ID': f.member.memberId,
        'Member Name': f.member.name,
        Book: f.loan.book.title,
        'Fine Amount (INR)': Number(f.amount),
        'Overdue Days': f.overdueDays,
        Status: f.status,
        'Issued Date': f.createdAt.toISOString().split('T')[0],
      }));
    }

    case 'borrowing_activity':
    default: {
      const loans = await db.loan.findMany({
        where: startDate || endDate ? { issueDate: dateFilter } : {},
        include: {
          member: { select: { name: true, memberId: true, memberType: true } },
          book: { select: { title: true, isbn: true } },
          bookCopy: { select: { copyCode: true } },
        },
        orderBy: { issueDate: 'desc' },
      });

      return loans.map((l) => ({
        'Loan ID': l.id,
        'Member ID': l.member.memberId,
        'Member Name': l.member.name,
        Type: l.member.memberType,
        'Book Title': l.book.title,
        Barcode: l.bookCopy.copyCode,
        'Issue Date': l.issueDate.toISOString().split('T')[0],
        'Due Date': l.dueDate.toISOString().split('T')[0],
        Status: l.status,
      }));
    }
  }
}

export async function exportReportCSV(type: string, startDate?: string, endDate?: string): Promise<string> {
  const data = await getSystemReportData(type, startDate, endDate);
  return generateCSV(data);
}
