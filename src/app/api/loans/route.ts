import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';
import { getLoans, issueBook } from '@/services/loan.service';
import { issueLoanSchema } from '@/validations/loan.schema';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let memberId = searchParams.get('memberId') || undefined;
    const bookId = searchParams.get('bookId') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // If role is MEMBER, restrict search to their own memberId
    if (session.role === 'MEMBER') {
      const memberProfile = await db.memberProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!memberProfile) {
        return NextResponse.json({ error: 'Member profile not found' }, { status: 404 });
      }
      memberId = memberProfile.id;
    }

    const result = await getLoans({ memberId, bookId, status, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    if (!session || !authorizeRoles(session, ['ADMIN', 'LIBRARIAN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validated = issueLoanSchema.parse(body);

    const loan = await issueBook(validated, session.userId);
    return NextResponse.json({ success: true, loan }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 });
  }
}
