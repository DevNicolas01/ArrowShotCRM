import { orderBy, type FirestoreError } from 'firebase/firestore'
import type { Invite } from '../types'
import { collectionService } from './firestore'

const COLLECTION = 'invites'
const base = collectionService<Invite>(COLLECTION)

export async function createInvite(email: string, userId: string) {
  return base.create({ email, status: 'pending' }, userId)
}

export async function markInviteDone(id: string, userId: string) {
  await base.update(id, { status: 'done' }, userId)
}

export async function deleteInvite(id: string) {
  await base.remove(id)
}

export function subscribeInvites(onData: (items: Invite[]) => void, onError?: (err: FirestoreError) => void) {
  return base.subscribe([orderBy('createdAt', 'desc')], onData, onError)
}
