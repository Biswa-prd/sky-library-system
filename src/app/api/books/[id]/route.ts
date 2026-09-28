import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';
import { getBookById, updateBook, deleteBook } from '@/services/book.service';
import { bookSchema } from '@/validations/book.schema';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const book = await getBookById(params.id);
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    return NextResponse.json(book);
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
    const validated = bookSchema.partial().parse(body);

    const book = await updateBook(params.id, validated, session.userId);
    return NextResponse.json({ success: true, book });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await authenticateRequest(req);
    if (!session || !authorizeRoles(session, ['ADMIN', 'LIBRARIAN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteBook(params.id, session.userId);
    return NextResponse.json({ success: true, message: 'Book deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 });
  }
}
