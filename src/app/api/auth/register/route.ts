import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';
import { registerSchema } from '@/validations/auth.schema';
import { createMember } from '@/services/member.service';

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    // Only Admin/Librarian can create accounts
    if (!session || !authorizeRoles(session, ['ADMIN', 'LIBRARIAN'])) {
      return NextResponse.json({ error: 'Forbidden. Admin or Librarian role required.' }, { status: 403 });
    }

    const body = await req.json();
    const validated = registerSchema.parse(body);

    const result = await createMember(
      {
        name: validated.name,
        email: validated.email,
        password: validated.password,
        phone: validated.phone,
        studentId: validated.studentId,
        department: validated.department,
        memberType: validated.memberType,
      },
      session.userId
    );

    return NextResponse.json({ success: true, member: result.profile }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 });
  }
}
