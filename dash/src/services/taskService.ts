import { orderBy, where, type QueryConstraint, type FirestoreError } from 'firebase/firestore'
import type { Task, TaskStatus } from '../types'
import { collectionService } from './firestore'
import { logActivity } from './activityService'
import { createNotification } from './notificationService'
import { TASK_STATUS_LABEL } from '../types/task'

const COLLECTION = 'tasks'
const base = collectionService<Task>(COLLECTION)

export async function createTask(
  data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
  userId: string,
  userName: string
) {
  const id = await base.create(data, userId)
  await logActivity({
    entityType: 'task',
    entityId: id,
    clientId: data.clientId,
    action: 'created',
    message: `criou a tarefa "${data.title}"`,
    userId,
    userName,
  })
  if (data.assignedTo && data.assignedTo !== userId) {
    await createNotification({
      userId: data.assignedTo,
      type: 'task_assigned',
      message: `${userName} atribuiu a tarefa "${data.title}" a você`,
      entityType: 'task',
      entityId: id,
    })
  }
  return id
}

export async function updateTask(id: string, data: Partial<Task>, userId: string, userName: string) {
  await base.update(id, data, userId)
  await logActivity({
    entityType: 'task',
    entityId: id,
    clientId: data.clientId,
    action: 'updated',
    message: 'atualizou a tarefa',
    userId,
    userName,
  })
  if (data.assignedTo && data.assignedTo !== userId) {
    await createNotification({
      userId: data.assignedTo,
      type: 'task_assigned',
      message: data.title
        ? `${userName} atribuiu a tarefa "${data.title}" a você`
        : `${userName} atribuiu uma tarefa a você`,
      entityType: 'task',
      entityId: id,
    })
  }
}

/** Called on kanban drag-and-drop. Persists immediately and logs a focused
 *  status-change activity instead of a generic "updated" one. */
export async function moveTaskStatus(
  task: Task,
  newStatus: TaskStatus,
  newOrder: number,
  userId: string,
  userName: string
) {
  await base.update(task.id, { status: newStatus, order: newOrder }, userId)
  if (newStatus !== task.status) {
    await logActivity({
      entityType: 'task',
      entityId: task.id,
      clientId: task.clientId,
      action: 'status_changed',
      message: `moveu de "${TASK_STATUS_LABEL[task.status]}" para "${TASK_STATUS_LABEL[newStatus]}"`,
      userId,
      userName,
    })
  }
}

export async function deleteTask(task: Task, userId: string, userName: string) {
  await base.remove(task.id)
  await logActivity({
    entityType: 'task',
    entityId: task.id,
    clientId: task.clientId,
    action: 'deleted',
    message: `excluiu a tarefa "${task.title}"`,
    userId,
    userName,
  })
}

export function getTask(id: string) {
  return base.getById(id)
}

export interface TaskFilters {
  clientId?: string
  assignedTo?: string
  status?: TaskStatus
}

export function subscribeTasks(
  onData: (items: Task[]) => void,
  filters: TaskFilters = {},
  onError?: (err: FirestoreError) => void
) {
  const constraints: QueryConstraint[] = []
  if (filters.clientId) constraints.push(where('clientId', '==', filters.clientId))
  if (filters.assignedTo) constraints.push(where('assignedTo', '==', filters.assignedTo))
  if (filters.status) constraints.push(where('status', '==', filters.status))
  constraints.push(orderBy('order', 'asc'))
  return base.subscribe(constraints, onData, onError)
}

/** All tasks, for the dashboard which buckets today/overdue/upcoming client-side
 *  (avoids a composite range-query index just for a summary view). */
export function subscribeAllTasks(onData: (items: Task[]) => void, onError?: (err: FirestoreError) => void) {
  return base.subscribe([orderBy('dueDate', 'asc')], onData, onError)
}
