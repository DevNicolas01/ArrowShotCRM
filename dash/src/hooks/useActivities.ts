import { subscribeActivities, subscribeClientActivities } from '../services/activityService'
import type { Activity, EntityType } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useActivities(entityType: EntityType, entityId: string | undefined) {
  return useCollectionSubscription<Activity>(
    (onData, onError) => subscribeActivities(entityType, entityId ?? '__none__', onData, onError),
    [entityType, entityId]
  )
}

export function useClientActivities(clientId: string | undefined) {
  return useCollectionSubscription<Activity>(
    (onData, onError) => subscribeClientActivities(clientId ?? '__none__', onData, onError),
    [clientId]
  )
}
