import { collection, addDoc, where, orderBy, serverTimestamp, type FirestoreError } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Comment, EntityType } from '../types'
import { collectionService } from './firestore'
import { logActivity } from './activityService'

const COLLECTION = 'comments'
const base = collectionService<Comment>(COLLECTION)

export async function addComment(params: {
  entityType: EntityType
  entityId: string
  clientId?: string
  text: string
  userId: string
  userName: string
  userPhotoURL?: string
}) {
  await addDoc(collection(db, COLLECTION), {
    entityType: params.entityType,
    entityId: params.entityId,
    clientId: params.clientId ?? null,
    text: params.text,
    userId: params.userId,
    userName: params.userName,
    userPhotoURL: params.userPhotoURL ?? null,
    createdAt: serverTimestamp(),
  })

  await logActivity({
    entityType: params.entityType,
    entityId: params.entityId,
    clientId: params.clientId,
    action: 'comment_added',
    message: `comentou: "${params.text.slice(0, 80)}${params.text.length > 80 ? '…' : ''}"`,
    userId: params.userId,
    userName: params.userName,
  })
}

export function subscribeComments(
  entityType: EntityType,
  entityId: string,
  onData: (items: Comment[]) => void,
  onError?: (err: FirestoreError) => void
) {
  return base.subscribe(
    [where('entityType', '==', entityType), where('entityId', '==', entityId), orderBy('createdAt', 'asc')],
    onData,
    onError
  )
}
