import { useEffect, useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Save } from 'lucide-react'
import { Field, Input, Select } from '../ui/Field'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { updateClient } from '../../services/clientService'
import { maskCurrencyInput, parseCurrencyToNumber } from '../../utils/masks'
import { getBenchmarkLevel, getStageThreshold, percentOf, divide, type BenchmarkLevel } from '../../utils/salesFunnelCalc'
import {
  SALES_FUNNEL_NETWORK_LABEL,
  SALES_FUNNEL_SERVICE_LABEL,
  SALES_FUNNEL_META_OBJECTIVE_LABEL,
  type Client,
  type SalesFunnel,
  type SalesFunnelCaptacao,
  type SalesFunnelNetwork,
  type SalesFunnelService,
  type SalesFunnelMetaObjective,
} from '../../types'

function toPositiveInt(v: string): number | undefined {
  if (v === '') return undefined
  const n = Math.floor(Number(v))
  if (Number.isNaN(n) || n < 0) return undefined
  return n
}

function moneyToMasked(v?: number): string {
  if (v == null) return ''
  return maskCurrencyInput(String(Math.round(v * 100)))
}

function fmtBRLorDash(v?: number): string {
  if (v == null || v === 0 || Number.isNaN(v)) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtPercentOrDash(v?: number): string {
  if (v == null || Number.isNaN(v)) return '—'
  return `${v.toFixed(1)}%`
}

function fmtIntOrDash(v?: number): string {
  if (v == null || Number.isNaN(v)) return '—'
  return v.toLocaleString('pt-BR')
}

function fmtDaysOrDash(v?: number): string {
  if (v == null || v === 0 || Number.isNaN(v)) return '—'
  return `${v.toLocaleString('pt-BR')} dia${v === 1 ? '' : 's'}`
}

interface FormState {
  rede?: SalesFunnelNetwork
  servico?: SalesFunnelService
  metaObjetivo?: SalesFunnelMetaObjective
  captacao: SalesFunnelCaptacao
  investimentoAdsStr: string
  faturamentoTotalStr: string
  custoOperacionalStr: string
  metaFaturamentoStr: string
  metaFechamentos?: number
  metaLeads?: number
}

function buildInitialForm(client: Client): FormState {
  const sf = client.salesFunnel
  return {
    rede: sf?.rede,
    servico: sf?.servico,
    metaObjetivo: sf?.metaObjetivo,
    captacao: { ...sf?.captacao },
    investimentoAdsStr: moneyToMasked(sf?.financeiro?.investimentoAds),
    faturamentoTotalStr: moneyToMasked(sf?.financeiro?.faturamentoTotal),
    custoOperacionalStr: moneyToMasked(sf?.financeiro?.custoOperacional),
    metaFaturamentoStr: moneyToMasked(sf?.metas?.metaFaturamento),
    metaFechamentos: sf?.metas?.metaFechamentos,
    metaLeads: sf?.metas?.metaLeads,
  }
}

function SectionTitle({ children }: { children: string }) {
  return <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-slate-500">{children}</p>
}

function SubTitle({ children }: { children: string }) {
  return <p className="mb-1.5 text-sm font-semibold text-slate-700">{children}</p>
}

function BenchmarkDot({ level }: { level: BenchmarkLevel }) {
  if (!level) return <span className="inline-block h-2 w-2 rounded-full bg-slate-200" />
  const color = level === 'green' ? 'bg-emerald-500' : level === 'yellow' ? 'bg-amber-400' : 'bg-red-500'
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
}

function JourneyRow({
  label,
  value,
  percent,
  level,
}: {
  label: string
  value?: number
  percent?: number
  level?: BenchmarkLevel
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 py-2 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-900">{fmtIntOrDash(value)}</span>
        <span className="w-14 text-right text-xs text-slate-400">{fmtPercentOrDash(percent)}</span>
        {level !== undefined && <BenchmarkDot level={level} />}
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function GoalRow({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{text}</span>
    </div>
  )
}

export function ClientSalesFunnelPanel({ client }: { client: Client }) {
  const { profile } = useAuth()
  const [form, setForm] = useState<FormState>(buildInitialForm(client))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(buildInitialForm(client))
  }, [client.id, client.salesFunnel])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  const setCaptacao = <K extends keyof SalesFunnelCaptacao>(key: K, value: SalesFunnelCaptacao[K]) =>
    setForm((f) => ({ ...f, captacao: { ...f.captacao, [key]: value } }))

  const c = form.captacao
  const investimentoAds = parseCurrencyToNumber(form.investimentoAdsStr)
  const faturamentoTotal = parseCurrencyToNumber(form.faturamentoTotalStr)
  const custoOperacional = parseCurrencyToNumber(form.custoOperacionalStr)
  const metaFaturamento = parseCurrencyToNumber(form.metaFaturamentoStr)

  // Jornada do cliente — % sempre em relação à etapa anterior.
  const ctrPercent = percentOf(c.cliques, c.impressoes)
  const conversaoPercent = percentOf(c.conversoes, c.cliques)
  const qualificacaoPercent = percentOf(c.qualificados, c.conversoes)
  const visitaPercent = percentOf(c.visitasRealizadas, c.qualificados)
  const fechamentoPercent = percentOf(c.fechamentos, c.visitasRealizadas)

  const ctrThreshold = getStageThreshold('ctr', form.rede, form.servico, form.metaObjetivo)
  const conversaoThreshold = getStageThreshold('conversao', form.rede, form.servico, form.metaObjetivo)
  const qualificacaoThreshold = getStageThreshold('qualificacao', form.rede, form.servico, form.metaObjetivo)
  const visitaThreshold = getStageThreshold('visita', form.rede, form.servico, form.metaObjetivo)
  const fechamentoThreshold = getStageThreshold('fechamento', form.rede, form.servico, form.metaObjetivo)

  // Métricas financeiras
  const lucroLiquido = faturamentoTotal ? faturamentoTotal - (investimentoAds ?? 0) - (custoOperacional ?? 0) : undefined
  const roi = investimentoAds && lucroLiquido != null ? (lucroLiquido / investimentoAds) * 100 : undefined
  const ticketMedio = divide(faturamentoTotal, c.fechamentos)
  const custoPorLead = divide(investimentoAds, c.cliques)
  const custoPorContrato = divide(investimentoAds, c.fechamentos)
  const conversaoLeadVenda = percentOf(c.fechamentos, c.cliques)
  const comparecimentoVisita = percentOf(c.visitasRealizadas, c.visitasAgendadas)

  const metaFechamentosText =
    c.fechamentos && form.metaFechamentos
      ? `${c.fechamentos.toLocaleString('pt-BR')} / ${form.metaFechamentos.toLocaleString('pt-BR')} (${((c.fechamentos / form.metaFechamentos) * 100).toFixed(0)}%)`
      : '—'
  const metaFaturamentoText =
    faturamentoTotal && metaFaturamento
      ? `${fmtBRLorDash(faturamentoTotal)} / ${fmtBRLorDash(metaFaturamento)} (${((faturamentoTotal / metaFaturamento) * 100).toFixed(0)}%)`
      : '—'
  const metaLeadsText =
    c.cliques && form.metaLeads
      ? `${c.cliques.toLocaleString('pt-BR')} / ${form.metaLeads.toLocaleString('pt-BR')} (${((c.cliques / form.metaLeads) * 100).toFixed(0)}%)`
      : '—'

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const payload: SalesFunnel = {
        rede: form.rede,
        servico: form.servico,
        metaObjetivo: form.rede === 'meta_ads' ? form.metaObjetivo : undefined,
        captacao: form.captacao,
        financeiro: {
          investimentoAds,
          faturamentoTotal,
          custoOperacional,
        },
        metas: {
          metaFaturamento,
          metaFechamentos: form.metaFechamentos,
          metaLeads: form.metaLeads,
        },
        preenchidoPor: profile.name,
        filledAt: Timestamp.now(),
      }
      await updateClient(client.id, { salesFunnel: payload }, profile.id, profile.name)
      toast.success('Funil comercial salvo')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar funil comercial')
    } finally {
      setSaving(false)
    }
  }

  const lastFilled = client.salesFunnel?.filledAt

  return (
    <div className="flex flex-col gap-6 bg-white text-[#0F172A]">
      <p className="text-xs text-slate-400">
        Cálculos em tempo real — nada é salvo automaticamente.
        {lastFilled && (
          <>
            {' '}
            Última vez salvo por <strong>{client.salesFunnel?.preenchidoPor}</strong> em{' '}
            {format(lastFilled.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.
          </>
        )}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* COLUNA ESQUERDA — CAMPOS */}
        <div className="flex flex-col gap-6">
          {/* SEÇÃO 1 — PARÂMETROS DE MERCADO */}
          <div>
            <SectionTitle>1. Parâmetros de mercado</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Rede de anúncios">
                <Select
                  value={form.rede ?? ''}
                  onChange={(e) => set('rede', (e.target.value || undefined) as SalesFunnelNetwork)}
                >
                  <option value="">Selecione...</option>
                  {(Object.entries(SALES_FUNNEL_NETWORK_LABEL) as [SalesFunnelNetwork, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Tipo de oferta / serviço">
                <Select
                  value={form.servico ?? ''}
                  onChange={(e) => set('servico', (e.target.value || undefined) as SalesFunnelService)}
                >
                  <option value="">Selecione...</option>
                  {(Object.entries(SALES_FUNNEL_SERVICE_LABEL) as [SalesFunnelService, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Select>
              </Field>
              {form.rede === 'meta_ads' && (
                <Field label="Objetivo da campanha">
                  <Select
                    value={form.metaObjetivo ?? ''}
                    onChange={(e) => set('metaObjetivo', (e.target.value || undefined) as SalesFunnelMetaObjective)}
                  >
                    <option value="">Selecione...</option>
                    {(Object.entries(SALES_FUNNEL_META_OBJECTIVE_LABEL) as [SalesFunnelMetaObjective, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>
          </div>

          {/* SEÇÃO 2 — FUNIL DE CAPTAÇÃO */}
          <div>
            <SectionTitle>2. Funil de captação</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Impressões / Visitantes">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={c.impressoes ?? ''}
                  onChange={(e) => setCaptacao('impressoes', toPositiveInt(e.target.value))}
                />
              </Field>
              <Field label="Cliques / Leads">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={c.cliques ?? ''}
                  onChange={(e) => setCaptacao('cliques', toPositiveInt(e.target.value))}
                />
              </Field>
              <Field label="Conversões (abordagens)">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={c.conversoes ?? ''}
                  onChange={(e) => setCaptacao('conversoes', toPositiveInt(e.target.value))}
                />
              </Field>
              <Field label="Qualificados">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={c.qualificados ?? ''}
                  onChange={(e) => setCaptacao('qualificados', toPositiveInt(e.target.value))}
                />
              </Field>
            </div>

            <div className="mt-4">
              <SubTitle>Visita técnica</SubTitle>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Visitas agendadas">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={c.visitasAgendadas ?? ''}
                    onChange={(e) => setCaptacao('visitasAgendadas', toPositiveInt(e.target.value))}
                  />
                </Field>
                <div>
                  <Field label="Visitas realizadas">
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={c.visitasRealizadas ?? ''}
                      onChange={(e) => setCaptacao('visitasRealizadas', toPositiveInt(e.target.value))}
                    />
                  </Field>
                  <p className="mt-1 text-xs text-slate-400">Separar do agendado revela o no-show.</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <SubTitle>Fechamento</SubTitle>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Fechamentos (contratos assinados após a visita técnica)">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={c.fechamentos ?? ''}
                    onChange={(e) => setCaptacao('fechamentos', toPositiveInt(e.target.value))}
                  />
                </Field>
                <Field label="Tempo médio de resposta da proposta (dias)">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={c.tempoMedioRespostaDias ?? ''}
                    onChange={(e) => setCaptacao('tempoMedioRespostaDias', toPositiveInt(e.target.value))}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* SEÇÃO 3 — FINANCEIRO */}
          <div>
            <SectionTitle>3. Financeiro</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Investimento em ADS (R$)">
                <Input
                  value={form.investimentoAdsStr}
                  onChange={(e) => set('investimentoAdsStr', maskCurrencyInput(e.target.value))}
                  placeholder="R$ 0,00"
                />
              </Field>
              <Field label="Faturamento total (R$)">
                <Input
                  value={form.faturamentoTotalStr}
                  onChange={(e) => set('faturamentoTotalStr', maskCurrencyInput(e.target.value))}
                  placeholder="R$ 0,00"
                />
              </Field>
              <Field label="Custo operacional (R$)">
                <Input
                  value={form.custoOperacionalStr}
                  onChange={(e) => set('custoOperacionalStr', maskCurrencyInput(e.target.value))}
                  placeholder="R$ 0,00"
                />
              </Field>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Custo operacional: custos além do investimento em ADS.</p>
          </div>

          {/* SEÇÃO 4 — METAS DO PERÍODO */}
          <div>
            <SectionTitle>4. Metas do período</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Meta de faturamento (R$)">
                <Input
                  value={form.metaFaturamentoStr}
                  onChange={(e) => set('metaFaturamentoStr', maskCurrencyInput(e.target.value))}
                  placeholder="R$ 0,00"
                />
              </Field>
              <Field label="Meta de fechamentos">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={form.metaFechamentos ?? ''}
                  onChange={(e) => set('metaFechamentos', toPositiveInt(e.target.value))}
                />
              </Field>
              <Field label="Meta de leads / cliques">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={form.metaLeads ?? ''}
                  onChange={(e) => set('metaLeads', toPositiveInt(e.target.value))}
                />
              </Field>
            </div>
          </div>

          <Button icon={<Save size={14} />} onClick={handleSave} loading={saving} className="self-start">
            Salvar funil
          </Button>
        </div>

        {/* COLUNA DIREITA — PAINEL DE RESULTADOS */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <SectionTitle>Jornada do cliente</SectionTitle>
            <div>
              <JourneyRow label="Impressões" value={c.impressoes} />
              <JourneyRow label="Cliques" value={c.cliques} percent={ctrPercent} level={getBenchmarkLevel(ctrPercent, ctrThreshold)} />
              <JourneyRow
                label="Conversões"
                value={c.conversoes}
                percent={conversaoPercent}
                level={getBenchmarkLevel(conversaoPercent, conversaoThreshold)}
              />
              <JourneyRow
                label="Qualificados"
                value={c.qualificados}
                percent={qualificacaoPercent}
                level={getBenchmarkLevel(qualificacaoPercent, qualificacaoThreshold)}
              />
              <JourneyRow
                label="Visita técnica"
                value={c.visitasRealizadas}
                percent={visitaPercent}
                level={getBenchmarkLevel(visitaPercent, visitaThreshold)}
              />
              <JourneyRow
                label="Fechamento"
                value={c.fechamentos}
                percent={fechamentoPercent}
                level={getBenchmarkLevel(fechamentoPercent, fechamentoThreshold)}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><BenchmarkDot level="green" /> Dentro do esperado</span>
              <span className="flex items-center gap-1"><BenchmarkDot level="yellow" /> Abaixo</span>
              <span className="flex items-center gap-1"><BenchmarkDot level="red" /> Muito abaixo</span>
            </div>
          </div>

          <div>
            <SectionTitle>Métricas financeiras</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Faturamento" value={fmtBRLorDash(faturamentoTotal)} />
              <MetricCard label="Lucro líquido" value={fmtBRLorDash(lucroLiquido)} />
              <MetricCard label="ROI" value={fmtPercentOrDash(roi)} />
              <MetricCard label="Ticket médio" value={fmtBRLorDash(ticketMedio)} />
              <MetricCard label="Custo por lead" value={fmtBRLorDash(custoPorLead)} />
              <MetricCard label="Custo por contrato" value={fmtBRLorDash(custoPorContrato)} />
              <MetricCard label="Conversão lead → venda" value={fmtPercentOrDash(conversaoLeadVenda)} />
              <MetricCard label="Comparecimento na visita" value={fmtPercentOrDash(comparecimentoVisita)} />
              <MetricCard label="Resposta da proposta" value={fmtDaysOrDash(c.tempoMedioRespostaDias)} />
            </div>
          </div>

          <div>
            <SectionTitle>Metas do período</SectionTitle>
            <div className="flex flex-col gap-2">
              <GoalRow label="Fechamentos" text={metaFechamentosText} />
              <GoalRow label="Faturamento" text={metaFaturamentoText} />
              <GoalRow label="Leads / cliques" text={metaLeadsText} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
