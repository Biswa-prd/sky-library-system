import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';
import { getBooks, createBook } from '@/services/book.service';
import { bookSchema } from '@/validations/book.schema';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const authorId = searchParams.get('authorId') || undefined;
    const publisherId = searchParams.get('publisherId') || undefined;
    const availability = (searchParams.get('availability') as any) || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = (searchParams.get('sortBy') as any) || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as any) || 'desc';

    const result = await getBooks({
      query,
      categoryId,
      authorId,
      publisherId,
      availability,
      page,
      limit,
      sortBy,
      sortOrder,
    });

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
    const validated = bookSchema.parse(body);

    const book = await createBook(
      {
        ...validated,
        initialCopies: body.initialCopies,
      },
      session.userId
    );

    return NextResponse.json({ success: true, book }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 });
  }
}
