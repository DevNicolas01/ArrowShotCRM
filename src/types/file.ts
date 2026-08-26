import type { Timestamp } from 'firebase/firestore'
import type { EntityType } from './common'

/** Mirrors the top-level folders under /clients/{clientId}/ in Storage.
 *  Extend when new modules land — the storage rules already allow it generically. */
export type FileCategory =
  | 'social-media'
  | 'google-ads'
  | 'meta-ads'
  | 'reports'
  | 'documents'

export interface FileMeta {
  id: string
  fileName: string
  mimeType: string
  size: number
  downloadUrl: string
  storagePath: string
  category: FileCategory
  clientId?: string
  /** what this file is attached to, e.g. a task or a content piece */
  relatedType?: EntityType
  relatedId?: string
  uploadedBy: string
  uploadedByName: string
  createdAt: Timestamp
}

export const ACCEPTED_FILE_TYPES = [
  'image/*',
  'video/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
].join(',')

export const MAX_FILE_SIZE_MB = 100
