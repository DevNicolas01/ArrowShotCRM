import { subscribeAllTasks, subscribeTasks, type TaskFilters } from '../services/taskService'
import type { Task } from '../types'
import { useCollectionSubscription } from './useCollectionSubscription'

export function useTasks(filters: TaskFilters = {}) {
  return useCollectionSubscription<Task>(
    (onData, onError) => subscribeTasks(onData, filters, onError),
    [filters.clientId, filters.assignedTo, filters.status]
  )
}

export function useAllTasks() {
  return useCollectionSubscription<Task>((onData, onError) => subscribeAllTasks(onData, onError), [])
}
