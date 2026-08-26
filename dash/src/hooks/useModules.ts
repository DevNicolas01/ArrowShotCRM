import { subscribeAllModules, subscribeModulesByTrail } from '../services/moduleService'
import type { Module } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useModules(trailId: string | undefined) {
  return useCollectionSubscription<Module>(
    (onData, onError) => {
      if (!trailId) return () => {}
      return subscribeModulesByTrail(trailId, onData, onError)
    },
    [trailId]
  )
}

export function useAllModules() {
  return useCollectionSubscription<Module>((onData, onError) => subscribeAllModules(onData, onError), [])
}
