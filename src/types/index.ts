export type Role = 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type MemberType = 'STUDENT' | 'FACULTY';
export type CopyStatus = 'AVAILABLE' | 'ISSUED' | 'RESERVED' | 'LOST' | 'DAMAGED' | 'MAINTENANCE';
export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST';
export type FineStatus = 'UNPAID' | 'PAID' | 'WAIVED';

export interface UserSession {
  userId: string;
  email: string;
  role: Role;
  name: string;
  memberId?: string;
}

export interface SystemPolicy {
  maxLoansStudent: number;
  maxLoansFaculty: number;
  loanDurationDays: number;
  finePerDay: number;
  maxRenewals: number;
  libraryName: string;
  contactEmail: string;
}

export interface DashboardStats {
  totalBooks: number;
  availableCopies: number;
  totalMembers: number;
  activeLoans: number;
  overdueLoans: number;
  outstandingFines: number;
  recentLoans: any[];
  recentActivity?: any[];
}
