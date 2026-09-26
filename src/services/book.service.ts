import { db } from '@/lib/db';
import { CopyStatus } from '@/types';
import { createAuditLog } from './audit.service';

export interface BookFilterParams {
  query?: string;
  categoryId?: string;
  authorId?: string;
  publisherId?: string;
  availability?: 'AVAILABLE' | 'ALL';
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'pubYear' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export async function getBooks(params: BookFilterParams) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.query) {
    const q = params.query.trim();
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { isbn: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { bookAuthors: { some: { author: { name: { contains: q, mode: 'insensitive' } } } } },
    ];
  }

  if (params.categoryId) {
    where.categoryId = params.categoryId;
  }

  if (params.publisherId) {
    where.publisherId = params.publisherId;
  }

  if (params.authorId) {
    where.bookAuthors = { some: { authorId: params.authorId } };
  }

  if (params.availability === 'AVAILABLE') {
    where.availableCopies = { gt: 0 };
  }

  const orderBy = {
    [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
  };

  const [total, books] = await Promise.all([
    db.book.count({ where }),
    db.book.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        publisher: true,
        bookAuthors: {
          include: {
            author: true,
          },
        },
        copies: {
          select: {
            id: true,
            copyCode: true,
            shelfLocation: true,
            status: true,
          },
        },
      },
    }),
  ]);

  return {
    data: books,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getBookById(id: string) {
  return db.book.findUnique({
    where: { id },
    include: {
      category: true,
      publisher: true,
      bookAuthors: {
        include: {
          author: true,
        },
      },
      copies: {
        include: {
          loans: {
            where: { status: 'ACTIVE' },
            include: {
              member: {
                select: {
                  name: true,
                  memberId: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function createBook(data: {
  isbn: string;
  title: string;
  description?: string;
  language?: string;
  edition?: string;
  pubYear: number;
  categoryId: string;
  publisherId?: string | null;
  authorIds: string[];
  initialCopies?: { copyCode: string; shelfLocation: string }[];
}, userId?: string) {
  const existingIsbn = await db.book.findUnique({ where: { isbn: data.isbn } });
  if (existingIsbn) {
    throw new Error(`A book with ISBN ${data.isbn} already exists.`);
  }

  const result = await db.$transaction(async (tx) => {
    const book = await tx.book.create({
      data: {
        isbn: data.isbn,
        title: data.title,
        description: data.description,
        language: data.language || 'English',
        edition: data.edition,
        pubYear: data.pubYear,
        categoryId: data.categoryId,
        publisherId: data.publisherId || null,
        bookAuthors: {
          create: data.authorIds.map((authorId) => ({ authorId })),
        },
      },
    });

    if (data.initialCopies && data.initialCopies.length > 0) {
      await tx.bookCopy.createMany({
        data: data.initialCopies.map((copy) => ({
          bookId: book.id,
          copyCode: copy.copyCode,
          shelfLocation: copy.shelfLocation,
          status: 'AVAILABLE' as CopyStatus,
        })),
      });

      const totalCount = data.initialCopies.length;
      await tx.book.update({
        where: { id: book.id },
        data: {
          totalCopies: totalCount,
          availableCopies: totalCount,
        },
      });
    }

    return book;
  });

  if (userId) {
    await createAuditLog(userId, 'CREATE_BOOK', 'Book', result.id, { isbn: result.isbn, title: result.title });
  }

  return result;
}

export async function updateBook(
  id: string,
  data: {
    isbn?: string;
    title?: string;
    description?: string;
    language?: string;
    edition?: string;
    pubYear?: number;
    categoryId?: string;
    publisherId?: string | null;
    authorIds?: string[];
  },
  userId?: string
) {
  const existing = await db.book.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Book not found.');
  }

  if (data.isbn && data.isbn !== existing.isbn) {
    const duplicateIsbn = await db.book.findUnique({ where: { isbn: data.isbn } });
    if (duplicateIsbn) {
      throw new Error(`ISBN ${data.isbn} is already in use by another book.`);
    }
  }

  const result = await db.$transaction(async (tx) => {
    if (data.authorIds) {
      await tx.bookAuthor.deleteMany({ where: { bookId: id } });
      await tx.bookAuthor.createMany({
        data: data.authorIds.map((authorId) => ({ bookId: id, authorId })),
      });
    }

    return tx.book.update({
      where: { id },
      data: {
        isbn: data.isbn,
        title: data.title,
        description: data.description,
        language: data.language,
        edition: data.edition,
        pubYear: data.pubYear,
        categoryId: data.categoryId,
        publisherId: data.publisherId,
      },
    });
  });

  if (userId) {
    await createAuditLog(userId, 'UPDATE_BOOK', 'Book', id, { title: result.title });
  }

  return result;
}

export async function deleteBook(id: string, userId?: string) {
  const activeLoans = await db.loan.count({
    where: { bookId: id, status: 'ACTIVE' },
  });

  if (activeLoans > 0) {
    throw new Error('Cannot delete book with active loans.');
  }

  const result = await db.book.delete({ where: { id } });

  if (userId) {
    await createAuditLog(userId, 'DELETE_BOOK', 'Book', id, { title: result.title });
  }

  return result;
}

export async function addBookCopy(
  bookId: string,
  copyData: { copyCode: string; shelfLocation: string; status?: CopyStatus },
  userId?: string
) {
  const existingCode = await db.bookCopy.findUnique({ where: { copyCode: copyData.copyCode } });
  if (existingCode) {
    throw new Error(`Barcode/Copy code ${copyData.copyCode} already exists.`);
  }

  const status = copyData.status || 'AVAILABLE';

  const copy = await db.$transaction(async (tx) => {
    const newCopy = await tx.bookCopy.create({
      data: {
        bookId,
        copyCode: copyData.copyCode,
        shelfLocation: copyData.shelfLocation,
        status,
      },
    });

    await updateBookCopyCounts(tx, bookId);
    return newCopy;
  });

  if (userId) {
    await createAuditLog(userId, 'ADD_BOOK_COPY', 'BookCopy', copy.id, { copyCode: copy.copyCode });
  }

  return copy;
}

export async function updateBookCopyCounts(tx: any, bookId: string) {
  const total = await tx.bookCopy.count({ where: { bookId } });
  const available = await tx.bookCopy.count({
    where: { bookId, status: 'AVAILABLE' },
  });

  await tx.book.update({
    where: { id: bookId },
    data: {
      totalCopies: total,
      availableCopies: available,
    },
  });
}
