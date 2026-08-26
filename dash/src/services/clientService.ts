import { orderBy, where, type QueryConstraint, type FirestoreError } from 'firebase/firestore'
import type { Client } from '../types'
import { collectionService } from './firestore'
import { logActivity } from './activityService'

const COLLECTION = 'clients'
const base = collectionService<Client>(COLLECTION)

export async function createClient(
  data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
  userId: string,
  userName: string
) {
  const id = await base.create(data, userId)
  await logActivity({
    entityType: 'client',
    entityId: id,
    clientId: id,
    action: 'created',
    message: `criou o cliente "${data.companyName}"`,
    userId,
    userName,
  })
  return id
}

export async function updateClient(
  id: string,
  data: Partial<Client>,
  userId: string,
  userName: string
) {
  await base.update(id, data, userId)
  await logActivity({
    entityType: 'client',
    entityId: id,
    clientId: id,
    action: 'updated',
    message: 'atualizou os dados do cliente',
    userId,
    userName,
  })
}

export async function deleteClient(id: string) {
  await base.remove(id)
}

export function getClient(id: string) {
  return base.getById(id)
}

export function subscribeClients(
  onData: (items: Client[]) => void,
  filters?: { status?: string },
  onError?: (err: FirestoreError) => void
) {
  const constraints: QueryConstraint[] = [orderBy('companyName', 'asc')]
  if (filters?.status) constraints.unshift(where('status', '==', filters.status))
  return base.subscribe(constraints, onData, onError)
}
