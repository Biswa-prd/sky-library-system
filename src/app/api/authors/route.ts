import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, authorizeRoles } from '@/lib/auth';

export async function GET() {
  const authors = await db.author.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(authors);
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    if (!session || !authorizeRoles(session, ['ADMIN', 'LIBRARIAN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Author name is required' }, { status: 400 });
    }

    const author = await db.author.create({
      data: {
        name: body.name,
        bio: body.bio,
      },
    });

    return NextResponse.json(author, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 400 });
  }
}
