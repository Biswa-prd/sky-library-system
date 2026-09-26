import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, setSessionCookie } from '@/lib/auth';
import { loginSchema } from '@/validations/auth.schema';
import { createAuditLog } from '@/services/audit.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: validated.email },
      include: { memberProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is inactive. Please contact the administrator.' }, { status: 403 });
    }

    const isValidPassword = await comparePassword(validated.password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const session = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.memberProfile?.name || (user.role === 'ADMIN' ? 'System Administrator' : 'Librarian'),
      memberId: user.memberProfile?.memberId,
    };

    const response = NextResponse.json({
      success: true,
      user: session,
    });

    await setSessionCookie(response, session);
    await createAuditLog(user.id, 'USER_LOGIN', 'User', user.id, { email: user.email });

    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
