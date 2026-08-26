import { subscribeAllContents, subscribeContents, type ContentFilters } from '../services/contentService'
import type { Content } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useContents(filters: ContentFilters = {}) {
  return useCollectionSubscription<Content>(
    (onData, onError) => subscribeContents(onData, filters, onError),
    [filters.clientId, filters.status, filters.platform]
  )
}

export function useAllContents() {
  return useCollectionSubscription<Content>((onData, onError) => subscribeAllContents(onData, onError), [])
}
