import { db } from '@/lib/db';

export async function createAuditLog(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  details?: Record<string, any>,
  ipAddress?: string
) {
  try {
    await db.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
}
