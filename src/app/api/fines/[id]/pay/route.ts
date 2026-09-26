import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';
import { payFine } from '@/services/fine.service';
import { payFineSchema } from '@/validations/fine.schema';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await authenticateRequest(req);
    if (!session || !authorizeRoles(session, ['ADMIN', 'LIBRARIAN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validated = payFineSchema.parse({ ...body, fineId: params.id });

    const result = await payFine(params.id, validated.amountPaid, validated.paymentMethod, session.userId);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 });
  }
}
