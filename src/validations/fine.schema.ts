import { z } from 'zod';

export const payFineSchema = z.object({
  fineId: z.string().min(1, 'Fine ID is required'),
  amountPaid: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'CARD', 'ONLINE', 'UPI']).default('CASH'),
});
