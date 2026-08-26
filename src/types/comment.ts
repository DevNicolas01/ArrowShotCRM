import type { Timestamp } from 'firebase/firestore'
import type { EntityType } from './common'

export interface Comment {
  id: string
  entityType: EntityType
  entityId: string
  clientId?: string
  text: string
  userId: string
  userName: string
  userPhotoURL?: string
  createdAt: Timestamp
}
