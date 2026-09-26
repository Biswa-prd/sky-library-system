import { db } from './db';
import { SystemPolicy } from '@/types';

export const DEFAULT_POLICY: SystemPolicy = {
  maxLoansStudent: 3,
  maxLoansFaculty: 5,
  loanDurationDays: 14,
  finePerDay: 5.0,
  maxRenewals: 2,
  libraryName: 'Sky Central Library',
  contactEmail: 'support@skylibrary.com',
};

export async function getSystemPolicy(): Promise<SystemPolicy> {
  try {
    const settings = await db.systemSetting.findMany();
    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    return {
      maxLoansStudent: parseInt(settingsMap.get('max_loans_student') || String(DEFAULT_POLICY.maxLoansStudent)),
      maxLoansFaculty: parseInt(settingsMap.get('max_loans_faculty') || String(DEFAULT_POLICY.maxLoansFaculty)),
      loanDurationDays: parseInt(settingsMap.get('loan_duration_days') || String(DEFAULT_POLICY.loanDurationDays)),
      finePerDay: parseFloat(settingsMap.get('fine_per_day') || String(DEFAULT_POLICY.finePerDay)),
      maxRenewals: parseInt(settingsMap.get('max_renewals') || String(DEFAULT_POLICY.maxRenewals)),
      libraryName: settingsMap.get('library_name') || DEFAULT_POLICY.libraryName,
      contactEmail: settingsMap.get('contact_email') || DEFAULT_POLICY.contactEmail,
    };
  } catch (error) {
    return DEFAULT_POLICY;
  }
}
