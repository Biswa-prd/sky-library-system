import { db } from '@/lib/db';
import { getSystemPolicy } from '@/lib/policy';
import { createAuditLog } from './audit.service';
import { createNotification } from './notification.service';
import { updateBookCopyCounts } from './book.service';

export interface LoanFilterParams {
  memberId?: string;
  bookId?: string;
  status?: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  page?: number;
  limit?: number;
}

export async function getLoans(params: LoanFilterParams) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.memberId) {
    where.memberId = params.memberId;
  }

  if (params.bookId) {
    where.bookId = params.bookId;
  }

  if (params.status) {
    where.status = params.status;
  }

  const [total, loans] = await Promise.all([
    db.loan.count({ where }),
    db.loan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { issueDate: 'desc' },
      include: {
        member: {
          select: {
            id: true,
            memberId: true,
            name: true,
            memberType: true,
            user: { select: { email: true } },
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            isbn: true,
          },
        },
        bookCopy: {
          select: {
            id: true,
            copyCode: true,
            shelfLocation: true,
          },
        },
        issuedByUser: {
          select: { email: true },
        },
        returnedByUser: {
          select: { email: true },
        },
        fine: true,
      },
    }),
  ]);

  return {
    data: loans,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function issueBook(
  data: {
    memberId: string;
    bookCopyId: string;
    loanDurationDays?: number;
  },
  librarianUserId: string
) {
  const policy = await getSystemPolicy();

  // 1. Member validation
  const member = await db.memberProfile.findUnique({
    where: { id: data.memberId },
    include: {
      user: true,
      loans: { where: { status: 'ACTIVE' } },
    },
  });

  if (!member || member.user.status !== 'ACTIVE') {
    throw new Error('Member is not active or does not exist.');
  }

  const maxAllowedLoans = member.memberType === 'FACULTY' ? policy.maxLoansFaculty : policy.maxLoansStudent;
  if (member.loans.length >= maxAllowedLoans) {
    throw new Error(`Member has reached the maximum allowed active loans (${maxAllowedLoans}).`);
  }

  // 2. Book copy validation
  const bookCopy = await db.bookCopy.findUnique({
    where: { id: data.bookCopyId },
    include: { book: true },
  });

  if (!bookCopy) {
    throw new Error('Book copy not found.');
  }

  if (bookCopy.status !== 'AVAILABLE') {
    throw new Error(`Book copy is currently ${bookCopy.status} and cannot be issued.`);
  }

  const durationDays = data.loanDurationDays || policy.loanDurationDays;
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(issueDate.getDate() + durationDays);

  const loan = await db.$transaction(async (tx) => {
    // Create loan
    const newLoan = await tx.loan.create({
      data: {
        memberId: member.id,
        bookId: bookCopy.bookId,
        bookCopyId: bookCopy.id,
        issueDate,
        dueDate,
        status: 'ACTIVE',
        issuedByUserId: librarianUserId,
      },
    });

    // Mark copy as ISSUED
    await tx.bookCopy.update({
      where: { id: bookCopy.id },
      data: { status: 'ISSUED' },
    });

    // Recalculate book availability
    await updateBookCopyCounts(tx, bookCopy.bookId);

    return newLoan;
  });

  // Notifications & Audit
  await createNotification(
    member.userId,
    'Book Issued',
    `You have borrowed "${bookCopy.book.title}". Due date is ${dueDate.toDateString()}.`,
    'SYSTEM'
  );

  await createAuditLog(librarianUserId, 'ISSUE_BOOK', 'Loan', loan.id, {
    memberId: member.memberId,
    copyCode: bookCopy.copyCode,
    bookTitle: bookCopy.book.title,
  });

  return loan;
}

export async function returnBook(loanId: string, librarianUserId: string) {
  const loan = await db.loan.findUnique({
    where: { id: loanId },
    include: {
      bookCopy: true,
      book: true,
      member: { include: { user: true } },
      fine: true,
    },
  });

  if (!loan) {
    throw new Error('Loan record not found.');
  }

  if (loan.status === 'RETURNED') {
    throw new Error('This loan has already been returned.');
  }

  const policy = await getSystemPolicy();
  const returnDate = new Date();
  const dueDate = new Date(loan.dueDate);

  // Check if overdue
  let overdueDays = 0;
  let fineAmount = 0;

  if (returnDate > dueDate) {
    const diffTime = Math.abs(returnDate.getTime() - dueDate.getTime());
    overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    fineAmount = overdueDays * policy.finePerDay;
  }

  const result = await db.$transaction(async (tx) => {
    // 1. Update loan status
    const updatedLoan = await tx.loan.update({
      where: { id: loanId },
      data: {
        returnDate,
        returnedByUserId: librarianUserId,
        status: 'RETURNED',
      },
    });

    // 2. Mark copy as AVAILABLE
    await tx.bookCopy.update({
      where: { id: loan.bookCopyId },
      data: { status: 'AVAILABLE' },
    });

    // 3. Recalculate book availability
    await updateBookCopyCounts(tx, loan.bookId);

    // 4. Create fine if overdue
    let createdFine = null;
    if (fineAmount > 0) {
      createdFine = await tx.fine.create({
        data: {
          loanId: loan.id,
          memberId: loan.memberId,
          amount: fineAmount,
          overdueDays,
          status: 'UNPAID',
        },
      });
    }

    return { updatedLoan, createdFine, fineAmount, overdueDays };
  });

  // Notifications & Audit
  if (result.fineAmount > 0) {
    await createNotification(
      loan.member.userId,
      'Book Overdue Fine Generated',
      `"${loan.book.title}" was returned ${result.overdueDays} days late. Fine of ₹${result.fineAmount} accrued.`,
      'FINE_GENERATED'
    );
  } else {
    await createNotification(
      loan.member.userId,
      'Book Returned',
      `"${loan.book.title}" has been successfully returned.`,
      'RETURN_CONFIRMED'
    );
  }

  await createAuditLog(librarianUserId, 'RETURN_BOOK', 'Loan', loanId, {
    memberId: loan.member.memberId,
    fineAmount: result.fineAmount,
  });

  return result;
}

export async function renewBook(loanId: string, userId: string) {
  const policy = await getSystemPolicy();

  const loan = await db.loan.findUnique({
    where: { id: loanId },
    include: {
      book: true,
      member: { include: { user: true } },
    },
  });

  if (!loan) {
    throw new Error('Loan record not found.');
  }

  if (loan.status !== 'ACTIVE') {
    throw new Error('Only active loans can be renewed.');
  }

  const today = new Date();
  if (today > new Date(loan.dueDate)) {
    throw new Error('Overdue loans cannot be renewed. Please return the book and pay any accrued fine.');
  }

  if (loan.renewalCount >= policy.maxRenewals) {
    throw new Error(`Maximum renewal limit (${policy.maxRenewals}) reached for this loan.`);
  }

  const newDueDate = new Date(loan.dueDate);
  newDueDate.setDate(newDueDate.getDate() + policy.loanDurationDays);

  const updatedLoan = await db.loan.update({
    where: { id: loanId },
    data: {
      dueDate: newDueDate,
      renewalCount: { increment: 1 },
    },
  });

  await createNotification(
    loan.member.userId,
    'Loan Renewed',
    `Loan for "${loan.book.title}" renewed. New due date is ${newDueDate.toDateString()}.`,
    'RENEWAL_CONFIRMED'
  );

  await createAuditLog(userId, 'RENEW_LOAN', 'Loan', loanId, {
    newDueDate: newDueDate.toISOString(),
    renewalCount: updatedLoan.renewalCount,
  });

  return updatedLoan;
}
