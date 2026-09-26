import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      memberProfile: true,
    },
  });

  if (!user || user.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Account inactive or not found' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.memberProfile?.name || (user.role === 'ADMIN' ? 'System Administrator' : 'Librarian'),
      memberId: user.memberProfile?.memberId,
      profile: user.memberProfile,
    },
  });
}
