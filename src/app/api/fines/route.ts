import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getFines } from '@/services/fine.service';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let memberId = searchParams.get('memberId') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (session.role === 'MEMBER') {
      const profile = await db.memberProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!profile) {
        return NextResponse.json({ error: 'Member profile not found' }, { status: 404 });
      }
      memberId = profile.id;
    }

    const result = await getFines({ memberId, status, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
