import type { SalesFunnelMetaObjective, SalesFunnelNetwork, SalesFunnelService } from '../types/salesFunnel'

/** Benchmarks de mercado para o funil comercial (limpeza), usados só para
 *  colorir os indicadores visuais — nunca bloqueiam o preenchimento.
 *
 *  Fonte: parâmetros de referência do playbook comercial (CTR/conversão de
 *  página/qualificação/fechamento por rede). "Visita técnica" (qualificado →
 *  visita realizada) não tem uma faixa de mercado publicada — usamos uma
 *  estimativa conservadora (40%–70%) igual para todas as redes, ajustada
 *  pelo mesmo fator de intensidade do serviço que as demais etapas. */

export type BenchmarkLevel = 'green' | 'yellow' | 'red' | null

interface Range {
  min: number
  max: number
}

interface StageBenchmarks {
  ctr: Range
  conversao: Range
  qualificacao: Range
  visita: Range
  fechamento: Range
}

const DEFAULT_DOWNSTREAM = {
  qualificacao: { min: 30, max: 60 },
  visita: { min: 40, max: 70 },
  fechamento: { min: 20, max: 40 },
}

type BenchmarkKey = 'google_search' | 'google_display' | 'meta_leads' | 'meta_trafego' | 'meta_conversoes' | 'meta_engajamento'

const NETWORK_BENCHMARKS: Record<BenchmarkKey, StageBenchmarks> = {
  google_search: { ctr: { min: 3, max: 7 }, conversao: { min: 5, max: 15 }, ...DEFAULT_DOWNSTREAM },
  google_display: { ctr: { min: 0.5, max: 2 }, conversao: { min: 5, max: 15 }, ...DEFAULT_DOWNSTREAM },
  meta_leads: { ctr: { min: 1, max: 3 }, conversao: { min: 5, max: 10 }, ...DEFAULT_DOWNSTREAM },
  meta_trafego: { ctr: { min: 2, max: 5 }, conversao: { min: 5, max: 15 }, ...DEFAULT_DOWNSTREAM },
  meta_conversoes: { ctr: { min: 1, max: 3 }, conversao: { min: 5, max: 15 }, ...DEFAULT_DOWNSTREAM },
  meta_engajamento: { ctr: { min: 1, max: 3 }, conversao: { min: 5, max: 15 }, ...DEFAULT_DOWNSTREAM },
}

function benchmarkKey(rede?: SalesFunnelNetwork, metaObjetivo?: SalesFunnelMetaObjective): BenchmarkKey | undefined {
  if (rede === 'google_search') return 'google_search'
  if (rede === 'google_display') return 'google_display'
  if (rede === 'meta_ads') {
    if (metaObjetivo === 'trafego') return 'meta_trafego'
    if (metaObjetivo === 'conversoes') return 'meta_conversoes'
    if (metaObjetivo === 'engajamento') return 'meta_engajamento'
    return 'meta_leads' // "Geração de Leads" e fallback até o objetivo ser escolhido
  }
  return undefined
}

/** Ajuste fino por serviço: quanto maior a intenção de compra, mais alta é a
 *  faixa considerada "esperada" (verde só a partir da metade superior da
 *  faixa de mercado); ciclos mais longos (predial/condomínio) toleram uma
 *  faixa mais baixa como normal. */
type ServiceIntensity = 'alta' | 'media' | 'baixa'

const SERVICE_INTENSITY: Record<SalesFunnelService, ServiceIntensity> = {
  limpeza_pos_obra: 'alta',
  trafego_quente: 'alta',
  limpeza_residencial: 'media',
  limpeza_pisos: 'media',
  limpeza_estofados: 'media',
  tratamento_piso: 'media',
  geracao_leads: 'media',
  limpeza_predial: 'baixa',
}

function adjustedThreshold(range: Range, intensity: ServiceIntensity): number {
  if (intensity === 'alta') return range.min + (range.max - range.min) * 0.5
  if (intensity === 'baixa') return range.min * 0.7
  return range.min
}

export type FunnelStage = 'ctr' | 'conversao' | 'qualificacao' | 'visita' | 'fechamento'

/** Piso (mínimo esperado) para a etapa, já ajustado pelo serviço. `null`
 *  quando não há rede/objetivo suficiente selecionado para calcular. */
export function getStageThreshold(
  stage: FunnelStage,
  rede?: SalesFunnelNetwork,
  servico?: SalesFunnelService,
  metaObjetivo?: SalesFunnelMetaObjective
): number | null {
  const key = benchmarkKey(rede, metaObjetivo)
  if (!key) return null
  const range = NETWORK_BENCHMARKS[key][stage]
  const intensity = servico ? SERVICE_INTENSITY[servico] : 'media'
  return adjustedThreshold(range, intensity)
}

/** Verde: dentro/acima do esperado. Amarelo: abaixo do esperado, mas não
 *  muito. Vermelho: muito abaixo (menos de 60% do piso esperado). */
export function getBenchmarkLevel(value: number | undefined, threshold: number | null): BenchmarkLevel {
  if (value == null || Number.isNaN(value) || threshold == null) return null
  if (value >= threshold) return 'green'
  if (value >= threshold * 0.6) return 'yellow'
  return 'red'
}

/** Percentual de `numerator` sobre `denominator`, ou `undefined` quando não
 *  dá para calcular (denominador vazio/zero) — o painel mostra "—" nesse caso. */
export function percentOf(numerator?: number, denominator?: number): number | undefined {
  if (!numerator || !denominator) return undefined
  return (numerator / denominator) * 100
}

export function divide(numerator?: number, denominator?: number): number | undefined {
  if (!numerator || !denominator) return undefined
  return numerator / denominator
}
