import { db } from '@/lib/db';

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'DUE_REMINDER' | 'OVERDUE' | 'FINE_GENERATED' | 'RETURN_CONFIRMED' | 'RENEWAL_CONFIRMED' | 'SYSTEM' = 'SYSTEM'
) {
  try {
    return await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  } catch (error) {
    console.error('Notification creation failed:', error);
  }
}

export async function getUserNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markNotificationAsRead(id: string, userId: string) {
  return db.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}
