import type { Timestamp } from 'firebase/firestore'

/** A Sim/Não access checkbox that also takes a link when checked (só
 *  Instagram e Facebook têm link — os demais são só Sim/Não). */
export interface AccessItem {
  checked: boolean
  link?: string
}

/** Aba "Acessos" da ficha do cliente — preenchida pelos gestores (Ciane e
 *  Nicolas), separada do Briefing de Tráfego Pago (que é preenchido pelo CS). */
export interface ClientAccess {
  agenciaNasContasDeAnuncios: boolean
  instagram: AccessItem
  facebookPagina: AccessItem
  analytics: boolean
  gtm: boolean
  googleMeuNegocio: boolean
  linkDrive?: string
  whatsappCampanhas?: string
  telefoneFixo?: string
  /** Who last saved it — set automatically from the logged-in user. */
  preenchidoPor?: string
  filledAt?: Timestamp | null
}

export const EMPTY_CLIENT_ACCESS: ClientAccess = {
  agenciaNasContasDeAnuncios: false,
  instagram: { checked: false },
  facebookPagina: { checked: false },
  analytics: false,
  gtm: false,
  googleMeuNegocio: false,
}
