import type { Timestamp } from 'firebase/firestore'

/** Base fields every top-level Firestore document carries. */
export interface BaseDoc {
  id: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'client'

/** Generic entity kinds that comments/files/activities can attach to.
 *  Extend this union when new modules (googleAds, metaAds, leads...) land —
 *  nothing else about the comment/file/activity architecture needs to change. */
export type EntityType =
  | 'client'
  | 'task'
  | 'content'
  | 'project'
  | 'googleAdsCampaign'
  | 'metaAdsCampaign'
  | 'lead'
  | 'report'

export interface EntityRef {
  entityType: EntityType
  entityId: string
  /** Denormalized for fast filtering/UI without extra reads. Always store the id too. */
  clientId?: string
}
