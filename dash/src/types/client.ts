import type { Timestamp } from 'firebase/firestore'
import type { BaseDoc } from './common'

export type ClientStatus = 'active' | 'paused' | 'churned' | 'prospect'

/** Social Media service tier — drives which content cadence template applies. */
export type ClientPackage = 'weekly' | 'monthly'

/** Fixed visual style catalogs clients pick at contract time (Arrow Shot's
 *  standardized Social Media offering). Chosen once, applies to all production. */
export type StyleCatalog = 1 | 2 | 3

export type ClientAudience = 'residencial' | 'comercial' | 'ambos'

export type ApprovalChannel = 'whatsapp' | 'email' | 'drive' | 'outro'

/** Onboarding briefing — filled once in the kickoff meeting (playbook section
 *  7). Deliberately kept off the quick client-create form and off the base
 *  Client fields it would otherwise duplicate (empresa/responsável/whatsapp/
 *  cidade/pacote/catálogo already exist on Client). */
export interface ClientBriefing {
  tempoMercado?: string
  numeroObras?: string
  servicos?: string
  atendeTipo?: ClientAudience
  ticketMedio?: string
  diferencial?: string
  naoAssociar?: string
  clienteIdeal?: string
  atendeB2B?: boolean
  dorPrincipal?: string
  objecaoComum?: string
  tomVoz?: string
  coresMarca?: string
  referenciaPerfil?: string
  naoQuerVer?: string
  dataInicio?: Timestamp | null
  canalAprovacao?: ApprovalChannel
  prazoAprovacao?: string
}

export interface Client extends BaseDoc {
  companyName: string
  contactName: string
  whatsapp?: string
  email?: string
  instagram?: string
  facebook?: string
  website?: string
  city?: string
  segment?: string
  status: ClientStatus
  package?: ClientPackage
  styleCatalog?: StyleCatalog
  /** uid of the internal team member who owns this account */
  ownerId?: string
  notes?: string
  logoUrl?: string
  briefing?: ClientBriefing
  /** Reserved for future modules — presence here means "this client has data in that module". */
  modules?: {
    socialMedia?: boolean
    googleAds?: boolean
    metaAds?: boolean
    leads?: boolean
    reports?: boolean
    finance?: boolean
  }
}

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  active: 'Ativo',
  paused: 'Pausado',
  churned: 'Encerrado',
  prospect: 'Prospecto',
}

export const CLIENT_PACKAGE_LABEL: Record<ClientPackage, string> = {
  weekly: 'Semanal',
  monthly: 'Mensal (30 dias)',
}

export const STYLE_CATALOG_LABEL: Record<StyleCatalog, string> = {
  1: 'Catálogo 1 — Profissional / Sóbrio',
  2: 'Catálogo 2 — Moderno / Vibrante',
  3: 'Catálogo 3 — Premium / Alto Padrão',
}

export const STYLE_CATALOG_DESCRIPTION: Record<StyleCatalog, string> = {
  1: 'Cores neutras, tipografia limpa, tom corporativo. Ideal para B2B, facilities, condomínios.',
  2: 'Cores vivas, dinâmico, forte uso de vídeo. Ideal para limpeza residencial, pós-obra, público jovem.',
  3: 'Visual minimalista, fotografia de qualidade, tom aspiracional. Ideal para alto padrão e tickets elevados.',
}

export const CLIENT_AUDIENCE_LABEL: Record<ClientAudience, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  ambos: 'Ambos',
}

export const APPROVAL_CHANNEL_LABEL: Record<ApprovalChannel, string> = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  drive: 'Google Drive',
  outro: 'Outro',
}
