import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSystemPolicy } from '@/lib/policy';
import { createAuditLog } from '@/services/audit.service';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const policy = await getSystemPolicy();
    return NextResponse.json(policy);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    if (!session || !authorizeRoles(session, ['ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const body = await req.json();

    const updates = [
      { key: 'max_loans_student', value: String(body.maxLoansStudent) },
      { key: 'max_loans_faculty', value: String(body.maxLoansFaculty) },
      { key: 'loan_duration_days', value: String(body.loanDurationDays) },
      { key: 'fine_per_day', value: String(body.finePerDay) },
      { key: 'max_renewals', value: String(body.maxRenewals) },
      { key: 'library_name', value: String(body.libraryName) },
      { key: 'contact_email', value: String(body.contactEmail) },
    ];

    for (const item of updates) {
      if (item.value !== undefined && item.value !== 'undefined') {
        await db.systemSetting.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { key: item.key, value: item.value },
        });
      }
    }

    await createAuditLog(session.userId, 'UPDATE_SYSTEM_SETTINGS', 'SystemSetting', 'GLOBAL', body);

    const updatedPolicy = await getSystemPolicy();
    return NextResponse.json({ success: true, policy: updatedPolicy });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 });
  }
}
