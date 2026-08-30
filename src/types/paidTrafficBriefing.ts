import type { Timestamp } from 'firebase/firestore'

/** One person tied to a responsibility role (seção 1). A role can have more
 *  than one contact (ex: dois sócios) — the first one is always shown, extra
 *  ones only appear via "Adicionar outro". */
export interface BriefingContact {
  id: string
  name: string
  email: string
  birthday?: Timestamp | null
}

function emptyContact(): BriefingContact {
  return { id: crypto.randomUUID(), name: '', email: '', birthday: null }
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

/** Briefing de Tráfego Pago — filled by CS during or right after the kickoff
 *  call. Empresa/CNPJ/site/redes já ficam no cadastro do cliente (Client) e
 *  Acessos vive na própria aba "Acessos" (preenchida pelos gestores), então
 *  nenhum dos dois se repete aqui. */
export interface PaidTrafficBriefing {
  /** Who last saved it — set automatically from the logged-in user, not a
   *  field the person filling it out picks. */
  preenchidoPor?: string
  filledAt?: Timestamp | null

  // Seção 1 — Responsáveis
  socios: BriefingContact[]
  decisores: BriefingContact[]
  aprovadoresCampanhas: BriefingContact[]
  financeiro: BriefingContact[]
  marketing: BriefingContact[]
  comercial: BriefingContact[]

  // Seção 2 — Comercial
  estruturaTime?: string
  processoVendas?: string
  sistemaGestaoLeads?: string
  cicloVenda?: string
  canalQueMaisVende?: string
  tempoDeMercado?: string
  percepcaoMercado?: string
  desafiosAtuais?: string

  // Seção 3 — Marketing
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

  // Seção 4 — ICP B2C
  b2cGenero?: string
  b2cEstadoCivilFilhos?: string
  b2cFaixaEtaria?: string
  b2cEscolaridadeProfissao?: string
  b2cRegiao?: string
  b2cDorPrincipal?: string
  b2cSolucoesTentadas?: string

  // Seção 5 — ICP B2B
  b2bSetor?: string
  b2bFaturamentoMinimo?: number
  b2bQuantidadeFuncionarios?: string
  b2bCargoDecisor?: string
  b2bLocalizacao?: string

  // Seção 6 — Palavras-chave
  palavrasChave?: string

  // Seção 7 — Observações gerais
  observacoes?: string
}

export const EMPTY_PAID_TRAFFIC_BRIEFING: PaidTrafficBriefing = {
  socios: [emptyContact()],
  decisores: [emptyContact()],
  aprovadoresCampanhas: [emptyContact()],
  financeiro: [emptyContact()],
  marketing: [emptyContact()],
  comercial: [emptyContact()],
  objetivos: [],
}
