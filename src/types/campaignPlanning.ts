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

/** Seção 1 — Acessos das contas. Por segurança, nunca guarda login/senha —
 *  só status de acesso (confirmado ou não) e links. Antes vivia numa aba
 *  "Acessos" separada; agora é a primeira seção do Planejamento de Campanha. */
export interface CampaignPlanningAccess {
  siteUrl?: string
  siteAcessoConfirmado?: boolean

  facebookLink?: string
  facebookGerenciadorConfirmado?: boolean
  facebookContaPrincipalId?: string
  facebookContaReservaId?: string

  instagramLink?: string
  instagramEditorConfirmado?: boolean

  googleAdsId?: string
  googleAdsAcessoConfirmado?: boolean
  googleAdsPagamentoConfigurado?: boolean

  gtmContainerId?: string
  gtmAcessoConfirmado?: boolean
  gtmCodigoInstalado?: boolean
  gtmTagRemarketingInstalada?: boolean
  gtmTagsConversaoInstaladas?: boolean

  gmbLink?: string
  gmbAcessoConfirmado?: boolean

  analyticsPropertyId?: string
  analyticsAcessoConfirmado?: boolean

  /** Máscara (00) 00000-0000, ver utils/masks.ts. */
  whatsappNumero?: string
  whatsappLink?: string

  linkDrive?: string
}

export const EMPTY_CAMPAIGN_PLANNING_ACCESS: CampaignPlanningAccess = {}

export type MetaFunnelStage = 'topo' | 'meio' | 'fundo'

export const META_FUNNEL_STAGE_LABEL: Record<MetaFunnelStage, string> = {
  topo: 'Topo (Frio)',
  meio: 'Meio (Morno)',
  fundo: 'Fundo (Quente)',
}

export type MetaObjective =
  | 'alcance'
  | 'video_view'
  | 'envolvimento'
  | 'trafego'
  | 'mensagens'
  | 'conversao'
  | 'geracao_cadastro'

export const META_OBJECTIVE_LABEL: Record<MetaObjective, string> = {
  alcance: 'Alcance',
  video_view: 'Video View',
  envolvimento: 'Envolvimento',
  trafego: 'Tráfego',
  mensagens: 'Mensagens',
  conversao: 'Conversão',
  geracao_cadastro: 'Geração de Cadastro',
}

export interface MetaCampaignItem {
  id: string
  etapaFunil?: MetaFunnelStage
  ideia?: string
  objetivo?: MetaObjective
  publicos?: string
  verbaDiaria?: number
  dataCriacao?: Timestamp | null
  observacoes?: string
}

/** Seção 2 — Planejamento Meta Ads, baseado na planilha de planejamento
 *  Facebook da agência. Verba diária e verba por etapa do funil são sempre
 *  calculadas a partir de verbaMensal/diasDoMes/percentuais — nunca
 *  persistidas, para nunca ficarem dessincronizadas. */
export interface MetaAdsPlanning {
  verbaMensal?: number
  diasDoMes?: number
  distribuicaoTopoPercent?: number
  distribuicaoMeioPercent?: number
  distribuicaoFundoPercent?: number
  campanhas: MetaCampaignItem[]
  maxConjuntosAnuncios?: number
}

export const EMPTY_META_ADS_PLANNING: MetaAdsPlanning = { diasDoMes: 30, campanhas: [] }

export type GoogleAdsNetwork = 'search' | 'display' | 'performance_max' | 'youtube'

export const GOOGLE_ADS_NETWORK_LABEL: Record<GoogleAdsNetwork, string> = {
  search: 'Search',
  display: 'Display',
  performance_max: 'Performance Max',
  youtube: 'YouTube',
}

export type GoogleBidType = 'auto_cliques' | 'auto_conversoes' | 'auto_valor_conversao' | 'manual_cpc'

export const GOOGLE_BID_TYPE_LABEL: Record<GoogleBidType, string> = {
  auto_cliques: 'Automático — Cliques',
  auto_conversoes: 'Automático — Conversões',
  auto_valor_conversao: 'Automático — Valor da conversão',
  manual_cpc: 'Manual CPC',
}

export interface GoogleCampaignItem {
  id: string
  rede?: GoogleAdsNetwork
  nomeCampanha?: string
  gruposAnuncios?: string
  tipoLance?: GoogleBidType
  verbaDiaria?: number
  observacoes?: string
}

/** Seção 3 — Planejamento Google Ads, baseado na planilha de planejamento
 *  Google da agência. */
export interface GoogleAdsPlanning {
  verbaMensal?: number
  diasDoMes?: number
  campanhas: GoogleCampaignItem[]
  /** Uma palavra-chave por linha. */
  palavrasChavePositivas?: string
  palavrasChaveNegativas?: string
  localizacaoSegmentacao?: string
}

export const EMPTY_GOOGLE_ADS_PLANNING: GoogleAdsPlanning = { diasDoMes: 30, campanhas: [] }

/** Aba "Planejamento de Campanha" — preenchida pelos gestores (Ciane e
 *  Nicolas), separada do Briefing de Tráfego Pago (preenchido pelo CS). */
export interface CampaignPlanning {
  /** Who last saved it — set automatically from the logged-in user. */
  preenchidoPor?: string
  filledAt?: Timestamp | null

  // Seção 1 — Acessos das contas
  acessos: CampaignPlanningAccess

  // Seção 2 — Planejamento Meta Ads
  metaAds: MetaAdsPlanning

  // Seção 3 — Planejamento Google Ads
  googleAds: GoogleAdsPlanning

  // Seção 4 — Estratégia geral
  objetivoPrincipal?: MarketingObjective
  plataformas: AdPlatform[]
  regioesSegmentacao?: string
  produtosServicos?: string
  orcamentoMensalAnuncios?: number
  posicionamentoPreco?: PriceComparison

  descricaoPublico?: string
  faixaEtaria?: string
  genero?: string
  interesses?: string
  publicoB2B?: boolean
  b2bSetor?: string
  b2bCargoDecisor?: string
  b2bFaturamentoMinimo?: string

  concorrente1?: string
  concorrente2?: string
  concorrente3?: string
  diferencialVsConcorrentes?: string
  diferenciaisParaAnuncios?: string

  linkPesquisaDrive?: string
  observacoesBenchmarking?: string

  enderecoDestino?: string
  observacoesCriativos?: string

  observacoesGerais?: string
}

export const EMPTY_CAMPAIGN_PLANNING: CampaignPlanning = {
  acessos: EMPTY_CAMPAIGN_PLANNING_ACCESS,
  metaAds: EMPTY_META_ADS_PLANNING,
  googleAds: EMPTY_GOOGLE_ADS_PLANNING,
  plataformas: [],
}
