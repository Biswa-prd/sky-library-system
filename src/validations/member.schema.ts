import { z } from 'zod';

export const memberSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  studentId: z.string().optional(),
  department: z.string().optional(),
  memberType: z.enum(['STUDENT', 'FACULTY']),
  address: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});
