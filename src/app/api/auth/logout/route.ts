import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, authenticateRequest } from '@/lib/auth';
import { createAuditLog } from '@/services/audit.service';

export async function POST(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (session) {
    await createAuditLog(session.userId, 'USER_LOGOUT', 'User', session.userId);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  clearSessionCookie(response);
  return response;
}
