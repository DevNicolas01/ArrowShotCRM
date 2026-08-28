import type { Timestamp } from 'firebase/firestore'

/** One person tied to a responsibility role (seção 2). A role can have more
 *  than one contact (ex: dois sócios). */
export interface BriefingContact {
  id: string
  name: string
  email: string
  birthday?: Timestamp | null
}

export interface BriefingAccess {
  agenciaNasContasDeAnuncios: boolean
  instagram: boolean
  facebookPagina: boolean
  analytics: boolean
  gtm: boolean
  googleMeuNegocio: boolean
  linkDrive?: string
  telefoneFixo?: string
  whatsappCampanhas?: string
}

export type MarketingObjective = 'vendas' | 'leads' | 'trafego' | 'seguidores'

export const MARKETING_OBJECTIVE_LABEL: Record<MarketingObjective, string> = {
  vendas: 'Vendas',
  leads: 'Leads',
  trafego: 'Tráfego',
  seguidores: 'Seguidores',
}

export type PriceComparison = 'mais_caro' | 'na_media' | 'mais_barato'

export const PRICE_COMPARISON_LABEL: Record<PriceComparison, string> = {
  mais_caro: 'Mais caro',
  na_media: 'Na média',
  mais_barato: 'Mais barato',
}

export type CreditCardForAds = 'sim' | 'nao' | 'boleto'

export const CREDIT_CARD_FOR_ADS_LABEL: Record<CreditCardForAds, string> = {
  sim: 'Sim',
  nao: 'Não',
  boleto: 'Boleto',
}

/** Full commercial/CS onboarding briefing — filled by CS (default: Jamilson)
 *  during or right after the kickoff call. Distinct from the shorter Social
 *  Media `ClientBriefing` (see client.ts): this one covers comercial,
 *  marketing, acessos and o perfil de cliente ideal (B2C e B2B). */
export interface CommercialBriefing {
  preenchidoPor: string
  filledAt?: Timestamp | null

  // Seção 1 — Dados básicos
  cnpj?: string
  site?: string
  instagram?: string
  facebookPagina?: string
  youtube?: string

  // Seção 2 — Responsáveis
  socios: BriefingContact[]
  decisores: BriefingContact[]
  aprovadoresCampanhas: BriefingContact[]
  financeiro: BriefingContact[]
  marketing: BriefingContact[]
  comercial: BriefingContact[]

  // Seção 3 — Acessos
  acessos: BriefingAccess

  // Seção 4 — Comercial
  estruturaTime?: string
  processoVendas?: string
  sistemaGestaoLeads?: string
  tempoUsoSistema?: string
  cicloVenda?: string
  canalQueMaisVende?: string
  tempoDeMercado?: string
  percepcaoMercado?: string
  desafiosAtuais?: string

  // Seção 5 — Marketing e desenvolvimento
  objetivos: MarketingObjective[]
  resultadoEsperado?: string
  enderecoDirecionamento?: string
  principaisProdutos?: string
  sazonalidade?: string
  ticketMedio?: number
  faturamentoMensal?: number
  faturamentoAnual?: number
  formasPagamento?: string
  concorrente1?: string
  concorrente2?: string
  concorrente3?: string
  diferencialVsConcorrentes?: string
  pontoForte?: string
  pontoFraco?: string
  precoComparado?: PriceComparison
  motivoComprarMesmoCaro?: string
  orcamentoMensalAnuncios?: number
  cartaoCreditoAnuncios?: CreditCardForAds

  // Seção 6 — Perfil do cliente ideal B2C
  b2cGenero?: string
  b2cEstadoCivilFilhos?: string
  b2cIdade?: string
  b2cEscolaridadeProfissao?: string
  b2cRegiao?: string
  b2cDorLatente?: string
  b2cSolucoesTentadas?: string

  // Seção 7 — Perfil do cliente ideal B2B
  b2bSetor?: string
  b2bFaturamentoMinimo?: number
  b2bQuantidadeFuncionarios?: string
  b2bCargoDecisor?: string
  b2bLocalizacao?: string

  // Seção 8 — Palavras-chave
  palavrasChave?: string

  // Seção 9 — Observações gerais
  observacoes?: string
}

export const EMPTY_BRIEFING_ACCESS: BriefingAccess = {
  agenciaNasContasDeAnuncios: false,
  instagram: false,
  facebookPagina: false,
  analytics: false,
  gtm: false,
  googleMeuNegocio: false,
}

export const EMPTY_COMMERCIAL_BRIEFING: CommercialBriefing = {
  preenchidoPor: 'Jamilson',
  socios: [],
  decisores: [],
  aprovadoresCampanhas: [],
  financeiro: [],
  marketing: [],
  comercial: [],
  acessos: EMPTY_BRIEFING_ACCESS,
  objetivos: [],
}
