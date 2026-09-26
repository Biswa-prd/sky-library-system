import { z } from 'zod';

export const issueLoanSchema = z.object({
  memberId: z.string().min(1, 'Member selection is required'),
  bookCopyId: z.string().min(1, 'Book copy selection is required'),
  loanDurationDays: z.number().int().min(1).max(90).optional(),
});

export const returnLoanSchema = z.object({
  loanId: z.string().min(1, 'Loan ID is required'),
});

export const renewLoanSchema = z.object({
  loanId: z.string().min(1, 'Loan ID is required'),
});
