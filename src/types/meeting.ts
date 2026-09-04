import type { Timestamp } from 'firebase/firestore'
import type { BaseDoc } from './common'

export type MeetingType = 'daily' | 'partnership' | 'one_on_one' | 'client' | 'monthly_team' | 'other'

export const MEETING_TYPE_LABEL: Record<MeetingType, string> = {
  daily: 'Reunião Diária',
  partnership: 'Reunião de Sociedade',
  one_on_one: 'One-a-One',
  client: 'Reunião com Cliente',
  monthly_team: 'Reunião Mensal da Equipe',
  other: 'Outra',
}

/** Cor do badge por tipo — ver spec do módulo de Reuniões. */
export const MEETING_TYPE_BADGE: Record<MeetingType, string> = {
  daily: 'bg-blue-50 text-blue-600',
  partnership: 'bg-violet-50 text-violet-600',
  one_on_one: 'bg-emerald-50 text-emerald-600',
  client: 'bg-amber-50 text-amber-600',
  monthly_team: 'bg-slate-100 text-slate-600',
  other: 'bg-slate-100 text-slate-600',
}

/** Participantes marcados por padrão ao escolher cada tipo — nomes
 *  resolvidos contra a equipe real via utils/userLookup.findUserIdByName
 *  (mesma convenção usada em clientWorkflowTemplates/notificações). Tipos
 *  fora deste mapa começam sem ninguém pré-marcado. */
export const MEETING_DEFAULT_PARTICIPANT_NAMES: Partial<Record<MeetingType, string[]>> = {
  daily: ['Bruno', 'Jamilson', 'Ciane', 'Nicolas'],
  monthly_team: ['Bruno', 'Jamilson', 'Ciane', 'Nicolas'],
  partnership: ['Bruno', 'Ciane'],
}

export interface MeetingActionItem {
  id: string
  description: string
  assignedTo?: string
  dueDate?: Timestamp | null
  /** Preenchido automaticamente ao salvar a reunião (ver meetingService) —
   *  liga esta ação à tarefa real criada a partir dela. Nunca setado pelo
   *  formulário diretamente. */
  taskId?: string
}

export interface Meeting extends BaseDoc {
  type: MeetingType
  date: Timestamp
  /** "HH:mm", opcional. */
  time?: string
  /** uids da equipe interna presentes. */
  participantIds: string[]
  /** Só relevante quando type === 'client'. */
  clientId?: string
  /** Pauta — o que foi discutido. */
  agenda?: string
  /** Decisões e encaminhamentos definidos. */
  decisions?: string
  actionItems: MeetingActionItem[]
  /** Link do Google Drive com a gravação. */
  recordingLink?: string
  notes?: string
}

/** Payload editável (form) — tudo que create/updateMeeting recebem. */
export type MeetingInput = Omit<Meeting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
