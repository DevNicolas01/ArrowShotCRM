import { subscribeFilesByClient, subscribeFilesByRelated } from '../services/fileService'
import type { EntityType, FileMeta } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useClientFiles(clientId: string | undefined) {
  return useCollectionSubscription<FileMeta>(
    (onData, onError) => subscribeFilesByClient(clientId ?? '__none__', onData, onError),
    [clientId]
  )
}

export function useRelatedFiles(relatedType: EntityType, relatedId: string | undefined) {
  return useCollectionSubscription<FileMeta>(
    (onData, onError) => subscribeFilesByRelated(relatedType, relatedId ?? '__none__', onData, onError),
    [relatedType, relatedId]
  )
}
