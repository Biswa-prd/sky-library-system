import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { MemberType, UserStatus } from '@/types';
import { createAuditLog } from './audit.service';
import { getSystemPolicy } from '@/lib/policy';

export interface MemberFilterParams {
  query?: string;
  memberType?: MemberType;
  status?: UserStatus;
  page?: number;
  limit?: number;
}

export async function getMembers(params: MemberFilterParams) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.query) {
    const q = params.query.trim();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { memberId: { contains: q, mode: 'insensitive' } },
      { studentId: { contains: q, mode: 'insensitive' } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
    ];
  }

  if (params.memberType) {
    where.memberType = params.memberType;
  }

  if (params.status) {
    where.user = { status: params.status };
  }

  const [total, members] = await Promise.all([
    db.memberProfile.count({ where }),
    db.memberProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            loans: {
              where: { status: 'ACTIVE' },
            },
            fines: {
              where: { status: 'UNPAID' },
            },
          },
        },
      },
    }),
  ]);

  return {
    data: members,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getMemberById(id: string) {
  const profile = await db.memberProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      },
      loans: {
        orderBy: { issueDate: 'desc' },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              isbn: true,
            },
          },
          bookCopy: {
            select: {
              copyCode: true,
              shelfLocation: true,
            },
          },
          fine: true,
        },
      },
      fines: {
        orderBy: { createdAt: 'desc' },
        include: {
          loan: {
            include: {
              book: {
                select: { title: true },
              },
            },
          },
        },
      },
    },
  });

  return profile;
}

export async function createMember(
  data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    studentId?: string;
    department?: string;
    memberType: MemberType;
    address?: string;
  },
  adminUserId?: string
) {
  const existingUser = await db.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new Error(`User with email ${data.email} already exists.`);
  }

  const policy = await getSystemPolicy();
  const maxLoans = data.memberType === 'FACULTY' ? policy.maxLoansFaculty : policy.maxLoansStudent;

  const defaultPassword = data.password || 'Library@123';
  const passwordHash = await hashPassword(defaultPassword);

  const memberId = `MEM-${Date.now().toString().slice(-6)}`;

  const result = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });

    const profile = await tx.memberProfile.create({
      data: {
        userId: user.id,
        memberId,
        name: data.name,
        phone: data.phone,
        studentId: data.studentId,
        department: data.department,
        memberType: data.memberType,
        maxLoans,
        address: data.address,
      },
    });

    return { user, profile };
  });

  if (adminUserId) {
    await createAuditLog(adminUserId, 'CREATE_MEMBER', 'MemberProfile', result.profile.id, {
      email: data.email,
      memberId: result.profile.memberId,
    });
  }

  return result;
}

export async function updateMemberStatus(memberId: string, status: UserStatus, adminUserId?: string) {
  const profile = await db.memberProfile.findUnique({ where: { id: memberId } });
  if (!profile) throw new Error('Member not found');

  const updatedUser = await db.user.update({
    where: { id: profile.userId },
    data: { status },
  });

  if (adminUserId) {
    await createAuditLog(adminUserId, 'UPDATE_MEMBER_STATUS', 'User', profile.userId, { status });
  }

  return updatedUser;
}
