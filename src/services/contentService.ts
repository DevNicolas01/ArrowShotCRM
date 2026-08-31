import { orderBy, where, getDocs, query, type QueryConstraint, type FirestoreError } from 'firebase/firestore'
import type { Content, ContentStatus } from '../types'
import { collectionService } from './firestore'
import { logActivity } from './activityService'
import { CONTENT_STATUS_LABEL } from '../types/content'

const COLLECTION = 'contents'
const base = collectionService<Content>(COLLECTION)

export async function createContent(
  data: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
  userId: string,
  userName: string
) {
  const id = await base.create(data, userId)
  await logActivity({
    entityType: 'content',
    entityId: id,
    clientId: data.clientId,
    action: 'created',
    message: `criou o conteúdo "${data.title}"`,
    userId,
    userName,
  })
  return id
}

export async function updateContent(id: string, data: Partial<Content>, userId: string, userName: string) {
  await base.update(id, data, userId)
  await logActivity({
    entityType: 'content',
    entityId: id,
    clientId: data.clientId,
    action: 'updated',
    message: 'atualizou o conteúdo',
    userId,
    userName,
  })
}

export async function moveContentStatus(
  content: Content,
  newStatus: ContentStatus,
  newOrder: number,
  userId: string,
  userName: string
) {
  await base.update(content.id, { status: newStatus, order: newOrder }, userId)
  if (newStatus !== content.status) {
    await logActivity({
      entityType: 'content',
      entityId: content.id,
      clientId: content.clientId,
      action: 'status_changed',
      message: `moveu de "${CONTENT_STATUS_LABEL[content.status]}" para "${CONTENT_STATUS_LABEL[newStatus]}"`,
      userId,
      userName,
    })
  }
}

export async function deleteContent(content: Content, userId: string, userName: string) {
  await base.remove(content.id)
  await logActivity({
    entityType: 'content',
    entityId: content.id,
    clientId: content.clientId,
    action: 'deleted',
    message: `excluiu o conteúdo "${content.title}"`,
    userId,
    userName,
  })
}

export function getContent(id: string) {
  return base.getById(id)
}

export interface ContentFilters {
  clientId?: string
  status?: ContentStatus
  platform?: string
}

export function subscribeContents(
  onData: (items: Content[]) => void,
  filters: ContentFilters = {},
  onError?: (err: FirestoreError) => void
) {
  const constraints: QueryConstraint[] = []
  if (filters.clientId) constraints.push(where('clientId', '==', filters.clientId))
  if (filters.status) constraints.push(where('status', '==', filters.status))
  if (filters.platform) constraints.push(where('platform', '==', filters.platform))
  constraints.push(orderBy('order', 'asc'))
  return base.subscribe(constraints, onData, onError)
}

// Ordered by createdAt, not scheduledDate: Firestore's orderBy silently drops
// documents that don't have the sorted field at all, and freshly created
// content has no scheduledDate yet — it would vanish from every "all contents"
// view (Social Media board, Dashboard, Calendar) until someone set a date.
export function subscribeAllContents(onData: (items: Content[]) => void, onError?: (err: FirestoreError) => void) {
  return base.subscribe([orderBy('createdAt', 'asc')], onData, onError)
}

/** One-shot fetch (not a live listener) — used by side-effects like the
 *  client-deletion cascade, which needs a snapshot to batch-delete. */
export async function getClientContents(clientId: string): Promise<Content[]> {
  const snap = await getDocs(query(base.colRef, where('clientId', '==', clientId)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as Content)
}
