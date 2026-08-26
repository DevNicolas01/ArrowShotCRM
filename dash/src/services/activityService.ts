import { collection, addDoc, where, orderBy, limit, serverTimestamp, type FirestoreError } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Activity, ActivityAction, EntityType } from '../types'
import { collectionService } from './firestore'

const COLLECTION = 'activities'
const base = collectionService<Activity>(COLLECTION)

export async function logActivity(params: {
  entityType: EntityType
  entityId: string
  clientId?: string
  action: ActivityAction
  message: string
  userId: string
  userName: string
}) {
  await addDoc(collection(db, COLLECTION), {
    entityType: params.entityType,
    entityId: params.entityId,
    clientId: params.clientId ?? null,
    action: params.action,
    message: params.message,
    userId: params.userId,
    userName: params.userName,
    createdAt: serverTimestamp(),
  })
}

export function subscribeActivities(
  entityType: EntityType,
  entityId: string,
  onData: (items: Activity[]) => void,
  onError?: (err: FirestoreError) => void
) {
  return base.subscribe(
    [where('entityType', '==', entityType), where('entityId', '==', entityId), orderBy('createdAt', 'desc')],
    onData,
    onError
  )
}

export function subscribeClientActivities(
  clientId: string,
  onData: (items: Activity[]) => void,
  onError?: (err: FirestoreError) => void
) {
  return base.subscribe(
    [where('clientId', '==', clientId), orderBy('createdAt', 'desc'), limit(50)],
    onData,
    onError
  )
}
