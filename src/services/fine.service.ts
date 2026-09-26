import { db } from '@/lib/db';
import { FineStatus } from '@/types';
import { createAuditLog } from './audit.service';
import { createNotification } from './notification.service';

export interface FineFilterParams {
  memberId?: string;
  status?: FineStatus;
  page?: number;
  limit?: number;
}

export async function getFines(params: FineFilterParams) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.memberId) {
    where.memberId = params.memberId;
  }

  if (params.status) {
    where.status = params.status;
  }

  const [total, fines] = await Promise.all([
    db.fine.count({ where }),
    db.fine.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        member: {
          select: {
            id: true,
            memberId: true,
            name: true,
            user: { select: { email: true } },
          },
        },
        loan: {
          include: {
            book: {
              select: { title: true, isbn: true },
            },
          },
        },
        payments: true,
        processedByUser: { select: { email: true } },
      },
    }),
  ]);

  return {
    data: fines,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function payFine(
  fineId: string,
  amountPaid: number,
  paymentMethod: string,
  processedByUserId: string
) {
  const fine = await db.fine.findUnique({
    where: { id: fineId },
    include: {
      member: { include: { user: true } },
      loan: { include: { book: true } },
    },
  });

  if (!fine) {
    throw new Error('Fine record not found.');
  }

  if (fine.status === 'PAID') {
    throw new Error('Fine has already been paid.');
  }

  const result = await db.$transaction(async (tx) => {
    const payment = await tx.finePayment.create({
      data: {
        fineId: fine.id,
        amountPaid,
        paymentMethod: paymentMethod || 'CASH',
        processedByUserId,
      },
    });

    const updatedFine = await tx.fine.update({
      where: { id: fine.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        processedByUserId,
      },
    });

    return { payment, updatedFine };
  });

  await createNotification(
    fine.member.userId,
    'Fine Payment Received',
    `Receipt confirmed for fine payment of ₹${amountPaid} for "${fine.loan.book.title}".`,
    'SYSTEM'
  );

  await createAuditLog(processedByUserId, 'PAY_FINE', 'Fine', fine.id, {
    amountPaid,
    paymentMethod,
    memberId: fine.member.memberId,
  });

  return result;
}
