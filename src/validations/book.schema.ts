import { z } from 'zod';

export const bookSchema = z.object({
  isbn: z.string().min(10, 'Valid ISBN is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  language: z.string().default('English'),
  edition: z.string().optional(),
  pubYear: z.coerce.number().int().min(1000).max(new Date().getFullYear() + 1),
  categoryId: z.string().min(1, 'Category is required'),
  publisherId: z.string().optional().nullable(),
  authorIds: z.array(z.string()).min(1, 'At least one author is required'),
});

export const bookCopySchema = z.object({
  copyCode: z.string().min(1, 'Copy Code/Barcode is required'),
  shelfLocation: z.string().min(1, 'Shelf Location is required'),
  status: z.enum(['AVAILABLE', 'ISSUED', 'RESERVED', 'LOST', 'DAMAGED', 'MAINTENANCE']).default('AVAILABLE'),
});
