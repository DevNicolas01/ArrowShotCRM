import { orderBy, type FirestoreError } from 'firebase/firestore'
import type { Trail } from '../types'
import { collectionService } from './firestore'

const COLLECTION = 'trails'
const base = collectionService<Trail>(COLLECTION)

export async function createTrail(
  data: Omit<Trail, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
  userId: string
) {
  return base.create(data, userId)
}

export async function updateTrail(id: string, data: Partial<Trail>, userId: string) {
  await base.update(id, data, userId)
}

export async function deleteTrail(id: string) {
  await base.remove(id)
}

export function getTrail(id: string) {
  return base.getById(id)
}

export function subscribeTrails(onData: (items: Trail[]) => void, onError?: (err: FirestoreError) => void) {
  return base.subscribe([orderBy('order', 'asc')], onData, onError)
}
