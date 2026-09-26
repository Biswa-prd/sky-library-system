import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { renewBook } from '@/services/loan.service';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If role is MEMBER, verify loan belongs to member
    if (session.role === 'MEMBER') {
      const loan = await db.loan.findUnique({
        where: { id: params.id },
        include: { member: true },
      });
      if (!loan || loan.member.userId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const loan = await renewBook(params.id, session.userId);
    return NextResponse.json({ success: true, loan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 });
  }
}
