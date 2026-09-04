import type { Timestamp } from 'firebase/firestore'

/** Aba "Funil Comercial" — funil completo de captação até fechamento,
 *  com benchmarks de mercado por rede de anúncios/serviço. Todos os
 *  percentuais e métricas são calculados em tempo real no frontend (ver
 *  utils/salesFunnelCalc.ts); só os campos abaixo são persistidos. */

export type SalesFunnelNetwork = 'google_search' | 'google_display' | 'meta_ads'

export const SALES_FUNNEL_NETWORK_LABEL: Record<SalesFunnelNetwork, string> = {
  google_search: 'Google Ads — Rede de Pesquisa',
  google_display: 'Google Ads — Rede de Display',
  meta_ads: 'Meta Ads (Instagram/Facebook)',
}

export type SalesFunnelService =
  | 'limpeza_residencial'
  | 'limpeza_pos_obra'
  | 'limpeza_predial'
  | 'limpeza_pisos'
  | 'limpeza_estofados'
  | 'tratamento_piso'
  | 'geracao_leads'
  | 'trafego_quente'

export const SALES_FUNNEL_SERVICE_LABEL: Record<SalesFunnelService, string> = {
  limpeza_residencial: 'Limpeza residencial',
  limpeza_pos_obra: 'Limpeza pós-obra',
  limpeza_predial: 'Limpeza predial / condomínios',
  limpeza_pisos: 'Limpeza de pisos',
  limpeza_estofados: 'Limpeza de estofados',
  tratamento_piso: 'Tratamento de piso',
  geracao_leads: 'Geração de leads (geral)',
  trafego_quente: 'Tráfego quente / base própria',
}

/** Objetivo de campanha — só se aplica (e só aparece no formulário) quando a
 *  rede selecionada é Meta Ads. */
export type SalesFunnelMetaObjective = 'leads' | 'trafego' | 'conversoes' | 'engajamento'

export const SALES_FUNNEL_META_OBJECTIVE_LABEL: Record<SalesFunnelMetaObjective, string> = {
  leads: 'Geração de Leads',
  trafego: 'Tráfego',
  conversoes: 'Conversões / Vendas',
  engajamento: 'Engajamento e Vídeo',
}

/** Seção 2 — Funil de captação. Todos inteiros positivos. */
export interface SalesFunnelCaptacao {
  impressoes?: number
  cliques?: number
  conversoes?: number
  qualificados?: number
  visitasAgendadas?: number
  visitasRealizadas?: number
  fechamentos?: number
  /** Em dias — quanto tempo em média a proposta leva para ter resposta. */
  tempoMedioRespostaDias?: number
}

export const EMPTY_SALES_FUNNEL_CAPTACAO: SalesFunnelCaptacao = {}

/** Seção 3 — Financeiro, em R$. */
export interface SalesFunnelFinanceiro {
  investimentoAds?: number
  faturamentoTotal?: number
  /** Custos além do investimento em ADS. */
  custoOperacional?: number
}

export const EMPTY_SALES_FUNNEL_FINANCEIRO: SalesFunnelFinanceiro = {}

/** Seção 4 — Metas do período. */
export interface SalesFunnelMetas {
  metaFaturamento?: number
  metaFechamentos?: number
  metaLeads?: number
}

export const EMPTY_SALES_FUNNEL_METAS: SalesFunnelMetas = {}

export interface SalesFunnel {
  rede?: SalesFunnelNetwork
  servico?: SalesFunnelService
  metaObjetivo?: SalesFunnelMetaObjective

  captacao: SalesFunnelCaptacao
  financeiro: SalesFunnelFinanceiro
  metas: SalesFunnelMetas

  /** Who last saved it — set automatically from the logged-in user. */
  preenchidoPor?: string
  filledAt?: Timestamp | null
}

export const EMPTY_SALES_FUNNEL: SalesFunnel = {
  captacao: EMPTY_SALES_FUNNEL_CAPTACAO,
  financeiro: EMPTY_SALES_FUNNEL_FINANCEIRO,
  metas: EMPTY_SALES_FUNNEL_METAS,
}
