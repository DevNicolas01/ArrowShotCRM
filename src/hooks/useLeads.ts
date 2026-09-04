import { subscribeLeads } from '../services/leadService'
import type { Lead } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useLeads() {
  return useCollectionSubscription<Lead>((onData, onError) => subscribeLeads(onData, onError), [])
}
