import type { Timestamp } from 'firebase/firestore'

export type MarketingObjective = 'vendas' | 'leads' | 'trafego' | 'seguidores'

export const MARKETING_OBJECTIVE_LABEL: Record<MarketingObjective, string> = {
  vendas: 'Vendas',
  leads: 'Leads',
  trafego: 'Tráfego',
  seguidores: 'Seguidores',
}

export type AdPlatform = 'meta_ads' | 'google_ads'

export const AD_PLATFORM_LABEL: Record<AdPlatform, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
}

export type PriceComparison = 'mais_caro' | 'na_media' | 'mais_barato'

export const PRICE_COMPARISON_LABEL: Record<PriceComparison, string> = {
  mais_caro: 'Mais caro',
  na_media: 'Na média',
  mais_barato: 'Mais barato',
}

/** Aba "Planejamento de Campanha" — preenchida pelos gestores (Ciane e
 *  Nicolas), separada do Briefing de Tráfego Pago (preenchido pelo CS). */
export interface CampaignPlanning {
  /** Who last saved it — set automatically from the logged-in user. */
  preenchidoPor?: string
  filledAt?: Timestamp | null

  // Seção 1 — Palavras-chave
  palavrasChave?: string

  // Seção 2 — Estratégia
  objetivoPrincipal?: MarketingObjective
  plataformas: AdPlatform[]
  regioesSegmentacao?: string
  produtosServicos?: string
  orcamentoMensalAnuncios?: number
  posicionamentoPreco?: PriceComparison

  // Seção 3 — Público-alvo
  descricaoPublico?: string
  faixaEtaria?: string
  genero?: string
  interesses?: string
  publicoB2B?: boolean
  b2bSetor?: string
  b2bCargoDecisor?: string
  b2bFaturamentoMinimo?: string

  // Seção 4 — Concorrentes
  concorrente1?: string
  concorrente2?: string
  concorrente3?: string
  diferencialVsConcorrentes?: string
  diferenciaisParaAnuncios?: string

  // Seção 5 — Benchmarking
  linkPesquisaDrive?: string
  observacoesBenchmarking?: string

  // Seção 6 — Criativos e direcionamento
  enderecoDestino?: string
  observacoesCriativos?: string

  // Seção 7 — Observações gerais
  observacoesGerais?: string
}

export const EMPTY_CAMPAIGN_PLANNING: CampaignPlanning = {
  plataformas: [],
}
