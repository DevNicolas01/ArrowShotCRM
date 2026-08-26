import { collection, addDoc, doc, updateDoc, where, serverTimestamp, type FirestoreError } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { AppNotification, EntityType, NotificationType } from '../types'
import { collectionService } from './firestore'

const COLLECTION = 'notifications'
const base = collectionService<AppNotification>(COLLECTION)

export async function createNotification(params: {
  userId: string
  type: NotificationType
  message: string
  entityType?: EntityType
  entityId?: string
}) {
  await addDoc(collection(db, COLLECTION), {
    userId: params.userId,
    type: params.type,
    message: params.message,
    entityType: params.entityType ?? null,
    entityId: params.entityId ?? null,
    read: false,
    createdAt: serverTimestamp(),
  })
}

/** No orderBy on purpose — a single equality filter needs no composite
 *  index. The hook sorts newest-first client-side instead. */
export function subscribeMyNotifications(
  userId: string,
  onData: (items: AppNotification[]) => void,
  onError?: (err: FirestoreError) => void
) {
  return base.subscribe([where('userId', '==', userId)], onData, onError)
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(db, COLLECTION, id), { read: true })
}

export async function markAllNotificationsRead(notifications: AppNotification[]) {
  await Promise.all(notifications.filter((n) => !n.read).map((n) => markNotificationRead(n.id)))
}
