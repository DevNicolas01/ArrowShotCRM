import type { Timestamp } from 'firebase/firestore'
import type { BaseDoc } from './common'

export type ContentType = 'post' | 'carousel' | 'reels' | 'story' | 'video' | 'other'

export type ContentPlatform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'other'

/** Social Media production pipeline, ClickUp-style. */
export type ContentStatus =
  | 'ideas'
  | 'production'
  | 'review'
  | 'waiting_client'
  | 'approved'
  | 'scheduled'
  | 'published'

/** Recurring content themes used to plan and balance the weekly/monthly
 *  editorial grade (see the Social Media playbook — Roteiro Semanal/Mensal). */
export type ContentPillar = 'dor_solucao' | 'autoridade' | 'prova_social' | 'educativo' | 'bastidores'

export interface Content extends BaseDoc {
  clientId: string
  title: string
  type: ContentType
  platform: ContentPlatform
  pillar?: ContentPillar
  objective?: string
  /** Shot-by-shot breakdown for reels (hook / development / close), free text. */
  script?: string
  caption?: string
  cta?: string
  hashtags?: string[]
  scheduledDate?: Timestamp | null
  scheduledTime?: string // "HH:mm", kept separate from date for quick editing
  assignedTo?: string
  status: ContentStatus
  order: number
  /** Set when an internal user generates a public approval link. Non-null =
   *  this content is fetchable (get-by-id only, never listable) without auth
   *  at /aprovar/{id}/{approvalToken}. Cleared to revoke the link. */
  approvalToken?: string | null
  /** Client company name captured when the approval link was generated —
   *  purely for display on the public page, never used as a relational key
   *  (the public page has no read access to the clients collection). */
  clientNameSnapshot?: string
}

export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  ideas: 'Ideias',
  production: 'Produção',
  review: 'Revisão',
  waiting_client: 'Aguardando Cliente',
  approved: 'Aprovado',
  scheduled: 'Agendado',
  published: 'Publicado',
}

export const CONTENT_STATUS_ORDER: ContentStatus[] = [
  'ideas',
  'production',
  'review',
  'waiting_client',
  'approved',
  'scheduled',
  'published',
]

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  post: 'Post',
  carousel: 'Carrossel',
  reels: 'Reels',
  story: 'Story',
  video: 'Vídeo',
  other: 'Outro',
}

export const CONTENT_PLATFORM_LABEL: Record<ContentPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  other: 'Outra',
}

export const CONTENT_PILLAR_LABEL: Record<ContentPillar, string> = {
  dor_solucao: 'Dor / Solução',
  autoridade: 'Autoridade',
  prova_social: 'Prova Social',
  educativo: 'Educativo',
  bastidores: 'Bastidores',
}
