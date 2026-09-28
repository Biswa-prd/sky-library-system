import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';
import { getMemberById, updateMemberStatus } from '@/services/member.service';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Members can view their own details; Admin/Librarian can view any
    const member = await getMemberById(params.id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (session.role === 'MEMBER' && member.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(member);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await authenticateRequest(req);
    if (!session || !authorizeRoles(session, ['ADMIN', 'LIBRARIAN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    if (body.status) {
      const updatedUser = await updateMemberStatus(params.id, body.status, session.userId);
      return NextResponse.json({ success: true, user: updatedUser });
    }

    return NextResponse.json({ error: 'Invalid update parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 });
  }
}
