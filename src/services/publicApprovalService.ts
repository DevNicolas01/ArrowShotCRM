import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Content } from '../types/content'

const PORTAL_ACTOR = 'client-portal'

/** Fetches a content piece for the public approval page. Firestore only
 *  allows this `get` because `approvalToken` is non-null on the doc (see
 *  firestore.rules) — the token comparison here is a client-side belt-and-
 *  suspenders check on top of that, not the actual security boundary. */
export async function getShareableContent(contentId: string, token: string): Promise<Content | null> {
  const snap = await getDoc(doc(db, 'contents', contentId))
  if (!snap.exists()) return null
  const content = { id: snap.id, ...snap.data() } as Content
  if (!content.approvalToken || content.approvalToken !== token) return null
  return content
}

/** Anonymous writes are scoped tightly in firestore.rules: only the `status`
 *  field on an already-shareable content doc, plus a matching `approvals`
 *  record authored by the fixed "client-portal" actor. No activity log entry
 *  — that collection requires auth, and the `approvals` record is itself the
 *  audit trail for this action. */
async function notifyAssignee(content: Content, message: string, type: 'content_approved' | 'change_requested') {
  if (!content.assignedTo) return
  await addDoc(collection(db, 'notifications'), {
    userId: content.assignedTo,
    type,
    message,
    entityType: 'content',
    entityId: content.id,
    read: false,
    createdAt: serverTimestamp(),
  })
}

export async function submitPublicApproval(content: Content, comment?: string) {
  await updateDoc(doc(db, 'contents', content.id), { status: 'approved', updatedAt: serverTimestamp(), updatedBy: PORTAL_ACTOR })
  await addDoc(collection(db, 'approvals'), {
    contentId: content.id,
    clientId: content.clientId,
    action: 'approved',
    comment: comment ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: PORTAL_ACTOR,
    updatedBy: PORTAL_ACTOR,
  })
  await notifyAssignee(
    content,
    `${content.clientNameSnapshot || 'O cliente'} aprovou o conteúdo "${content.title}"`,
    'content_approved'
  )
}

export async function submitPublicChangeRequest(content: Content, comment: string) {
  await updateDoc(doc(db, 'contents', content.id), { status: 'production', updatedAt: serverTimestamp(), updatedBy: PORTAL_ACTOR })
  await addDoc(collection(db, 'approvals'), {
    contentId: content.id,
    clientId: content.clientId,
    action: 'change_requested',
    comment,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: PORTAL_ACTOR,
    updatedBy: PORTAL_ACTOR,
  })
  await notifyAssignee(
    content,
    `${content.clientNameSnapshot || 'O cliente'} pediu alteração em "${content.title}"`,
    'change_requested'
  )
}
