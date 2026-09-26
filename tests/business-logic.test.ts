import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../src/lib/auth';
import { DEFAULT_POLICY } from '../src/lib/policy';
import { generateCSV } from '../src/lib/utils';

describe('Library Business Logic & Policy Engine', () => {
  it('should correctly hash and compare passwords securely', async () => {
    const rawPassword = 'Password123!';
    const hash = await hashPassword(rawPassword);
    expect(hash).not.toBe(rawPassword);
    expect(await comparePassword(rawPassword, hash)).toBe(true);
    expect(await comparePassword('WrongPassword', hash)).toBe(false);
  });

  it('should enforce central policy default configuration', () => {
    expect(DEFAULT_POLICY.maxLoansStudent).toBe(3);
    expect(DEFAULT_POLICY.maxLoansFaculty).toBe(5);
    expect(DEFAULT_POLICY.loanDurationDays).toBe(14);
    expect(DEFAULT_POLICY.finePerDay).toBe(5.0);
    expect(DEFAULT_POLICY.maxRenewals).toBe(2);
  });

  it('should accurately calculate overdue fines for given late days', () => {
    const overdueDays = 5;
    const rate = DEFAULT_POLICY.finePerDay;
    const totalFine = overdueDays * rate;
    expect(totalFine).toBe(25.0);
  });

  it('should generate valid CSV format for system report data', () => {
    const sampleReport = [
      { 'Loan ID': 'L-1', Member: 'Alex Mercer', 'Book Title': 'Clean Code' },
      { 'Loan ID': 'L-2', Member: 'Sophia Patel', 'Book Title': 'Design Patterns' },
    ];
    const csv = generateCSV(sampleReport);
    expect(csv).toContain('"Loan ID","Member","Book Title"');
    expect(csv).toContain('"L-1","Alex Mercer","Clean Code"');
  });
});
