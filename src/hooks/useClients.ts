import { subscribeClients } from '../services/clientService'
import type { Client } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useClients(filters?: { status?: string }) {
  return useCollectionSubscription<Client>(
    (onData, onError) => subscribeClients(onData, filters, onError),
    [filters?.status]
  )
}
