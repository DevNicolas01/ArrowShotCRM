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

export type RecurrenceFrequency = 'weekly' | 'monthly'

export interface TaskRecurrence {
  frequency: RecurrenceFrequency
  /** 0=domingo … 6=sábado — only for 'weekly' */
  weekday?: number
  /** 1-31 — only for 'monthly' */
  dayOfMonth?: number
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
  /** Marks this task as recurring. There's no backend scheduler in this project
   *  (Firestore + client only, no Cloud Functions) — recurrence is informational:
   *  the drawer offers a "duplicate next occurrence" action instead of an
   *  automatic job. */
  recurrence?: TaskRecurrence | null
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

const WEEKDAY_LABEL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

export function formatRecurrence(recurrence: TaskRecurrence): string {
  if (recurrence.frequency === 'weekly') {
    return `Semanal — toda ${WEEKDAY_LABEL[recurrence.weekday ?? 1]}`
  }
  return `Mensal — todo dia ${recurrence.dayOfMonth ?? 1}`
}

/** Next date matching the recurrence rule, on or after `after`. Used both to
 *  seed the first occurrence at client creation and, later, by the drawer's
 *  "duplicate next occurrence" action (see recurrence comment on Task). */
export function nextRecurrenceDate(recurrence: TaskRecurrence, after: Date = new Date()): Date {
  const start = new Date(after.getFullYear(), after.getMonth(), after.getDate())

  if (recurrence.frequency === 'weekly') {
    const weekday = recurrence.weekday ?? 1
    const diff = (weekday - start.getDay() + 7) % 7
    start.setDate(start.getDate() + diff)
    return start
  }

  const day = recurrence.dayOfMonth ?? 1
  const candidate = new Date(start.getFullYear(), start.getMonth(), day)
  if (candidate < start) candidate.setMonth(candidate.getMonth() + 1)
  return candidate
}
