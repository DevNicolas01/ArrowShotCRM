import type { Timestamp } from 'firebase/firestore'
import type { EntityType } from './common'

export type NotificationType =
  | 'task_assigned'
  | 'mention'
  | 'approval_requested'
  | 'content_approved'
  | 'change_requested'
  | 'due_soon'
  | 'briefing_scheduled'

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  message: string
  entityType?: EntityType
  entityId?: string
  read: boolean
  createdAt: Timestamp
}
