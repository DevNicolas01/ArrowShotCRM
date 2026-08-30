import type { Timestamp } from 'firebase/firestore'

/** One person tied to a responsibility role (seção 1). A role can have more
 *  than one contact (ex: dois sócios). */
export interface BriefingContact {
  id: string
  name: string
  email: string
  birthday?: Timestamp | null
}

/** A Sim/Não access checkbox that also takes a link when it's checked
 *  (ex: link do perfil do Instagram, do container do GTM). */
export interface BriefingAccessItem {
  checked: boolean
  link?: string
}

function emptyAccessItem(): BriefingAccessItem {
  return { checked: false }
}

export interface BriefingAccess {
  agenciaNasContasDeAnuncios: boolean
  instagram: BriefingAccessItem
  facebookPagina: BriefingAccessItem
  analytics: BriefingAccessItem
  gtm: BriefingAccessItem
  googleMeuNegocio: BriefingAccessItem
  linkDrive?: string
  whatsappCampanhas?: string
  telefoneFixo?: string
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
  boleto: 'Paga por boleto',
}

/** Briefing de Tráfego Pago — filled by CS (default: Janilson) during or
 *  right after the kickoff call. Empresa/CNPJ/site/redes já ficam no
 *  cadastro do cliente (Client), então não se repetem aqui. */
export interface PaidTrafficBriefing {
  preenchidoPor: string
  filledAt?: Timestamp | null

  // Seção 1 — Responsáveis
  socios: BriefingContact[]
  decisores: BriefingContact[]
  aprovadoresCampanhas: BriefingContact[]
  financeiro: BriefingContact[]
  marketing: BriefingContact[]
  comercial: BriefingContact[]

  // Seção 2 — Acessos
  acessos: BriefingAccess

  // Seção 3 — Comercial
  estruturaTime?: string
  processoVendas?: string
  sistemaGestaoLeads?: string
  cicloVenda?: string
  canalQueMaisVende?: string
  tempoDeMercado?: string
  percepcaoMercado?: string
  desafiosAtuais?: string

  // Seção 4 — Marketing
  objetivos: MarketingObjective[]
  resultadoEsperado?: string
  regioesDirecionamento?: string
  principaisProdutos?: string
  mesesMaisFortes?: string
  mesesMaisFracos?: string
  ticketMedio?: number
  faturamentoMensal?: number
  formasPagamento?: string
  orcamentoMensalAnuncios?: number
  cartaoCreditoAnuncios?: CreditCardForAds
  concorrente1?: string
  concorrente2?: string
  concorrente3?: string
  diferencialVsConcorrentes?: string
  pontoForte?: string
  pontoFraco?: string
  precoComparado?: PriceComparison
  motivoComprarMesmoCaro?: string

  // Seção 5 — ICP B2C
  b2cGenero?: string
  b2cEstadoCivilFilhos?: string
  b2cFaixaEtaria?: string
  b2cEscolaridadeProfissao?: string
  b2cRegiao?: string
  b2cDorPrincipal?: string
  b2cSolucoesTentadas?: string

  // Seção 6 — ICP B2B
  b2bSetor?: string
  b2bFaturamentoMinimo?: number
  b2bQuantidadeFuncionarios?: string
  b2bCargoDecisor?: string
  b2bLocalizacao?: string

  // Seção 7 — Palavras-chave
  palavrasChave?: string

  // Seção 8 — Observações gerais
  observacoes?: string
}

export const EMPTY_BRIEFING_ACCESS: BriefingAccess = {
  agenciaNasContasDeAnuncios: false,
  instagram: emptyAccessItem(),
  facebookPagina: emptyAccessItem(),
  analytics: emptyAccessItem(),
  gtm: emptyAccessItem(),
  googleMeuNegocio: emptyAccessItem(),
}

export const EMPTY_PAID_TRAFFIC_BRIEFING: PaidTrafficBriefing = {
  preenchidoPor: 'Janilson',
  socios: [],
  decisores: [],
  aprovadoresCampanhas: [],
  financeiro: [],
  marketing: [],
  comercial: [],
  acessos: EMPTY_BRIEFING_ACCESS,
  objetivos: [],
}
