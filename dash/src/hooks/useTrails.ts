import { subscribeTrails } from '../services/trailService'
import type { Trail } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useTrails() {
  return useCollectionSubscription<Trail>((onData, onError) => subscribeTrails(onData, onError), [])
}
