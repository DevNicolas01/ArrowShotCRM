import { subscribeComments } from '../services/commentService'
import type { Comment, EntityType } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useComments(entityType: EntityType, entityId: string | undefined) {
  return useCollectionSubscription<Comment>(
    (onData, onError) => subscribeComments(entityType, entityId ?? '__none__', onData, onError),
    [entityType, entityId]
  )
}
