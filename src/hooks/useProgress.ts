import { subscribeAllProgress, subscribeUserProgress } from '../services/progressService'
import type { ModuleProgress } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useMyProgress(userId: string | undefined) {
  return useCollectionSubscription<ModuleProgress>(
    (onData, onError) => {
      if (!userId) return () => {}
      return subscribeUserProgress(userId, onData, onError)
    },
    [userId]
  )
}

/** Admin-only: every employee's progress. */
export function useAllProgress() {
  return useCollectionSubscription<ModuleProgress>((onData, onError) => subscribeAllProgress(onData, onError), [])
}
