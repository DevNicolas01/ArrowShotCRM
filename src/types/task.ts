import type { Timestamp } from 'firebase/firestore'
import type { BaseDoc } from './common'

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'waiting_client'
  | 'done'

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Task extends BaseDoc {
  title: string
  description?: string
  clientId?: string
  assignedTo?: string
  dueDate?: Timestamp | null
  priority: TaskPriority
  status: TaskStatus
  checklist: ChecklistItem[]
  /** manual sort order within a kanban column */
  order: number
  /** links a task to a content piece when it belongs to a social media production flow */
  contentId?: string
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'A Fazer',
  in_progress: 'Em Andamento',
  review: 'Revisão',
  waiting_client: 'Aguardando Cliente',
  done: 'Concluído',
}

export const TASK_STATUS_ORDER: TaskStatus[] = [
  'todo',
  'in_progress',
  'review',
  'waiting_client',
  'done',
]

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
}

export const TASK_PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
}
