import { useEffect, useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Save } from 'lucide-react'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { updateClient } from '../../services/clientService'
import {
  EMPTY_CAMPAIGN_PLANNING,
  MARKETING_OBJECTIVE_LABEL,
  AD_PLATFORM_LABEL,
  PRICE_COMPARISON_LABEL,
  type Client,
  type CampaignPlanning,
  type AdPlatform,
  type MarketingObjective,
  type PriceComparison,
} from '../../types'

function toNumberOrUndefined(v: string) {
  return v === '' ? undefined : Number(v)
}

function SectionTitle({ children }: { children: string }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{children}</p>
}

export function ClientCampaignPlanningPanel({ client }: { client: Client }) {
  const { profile } = useAuth()
  const [form, setForm] = useState<CampaignPlanning>(client.campaignPlanning ?? EMPTY_CAMPAIGN_PLANNING)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(client.campaignPlanning ?? EMPTY_CAMPAIGN_PLANNING)
  }, [client.id, client.campaignPlanning])

  const set = <K extends keyof CampaignPlanning>(key: K, value: CampaignPlanning[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const togglePlatform = (platform: AdPlatform) =>
    setForm((f) => ({
      ...f,
      plataformas: f.plataformas.includes(platform)
        ? f.plataformas.filter((p) => p !== platform)
        : [...f.plataformas, platform],
    }))

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const payload: CampaignPlanning = { ...form, preenchidoPor: profile.name, filledAt: Timestamp.now() }
      await updateClient(client.id, { campaignPlanning: payload }, profile.id, profile.name)
      toast.success('Planejamento salvo')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar planejamento')
    } finally {
      setSaving(false)
    }
  }

  const lastFilled = client.campaignPlanning?.filledAt

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-slate-400">
        Preenchido pelos gestores da conta.
        {lastFilled && (
          <>
            {' '}
            Última vez salvo por <strong>{client.campaignPlanning?.preenchidoPor}</strong> em{' '}
            {format(lastFilled.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.
          </>
        )}
      </p>

      <div>
        <SectionTitle>1. Palavras-chave</SectionTitle>
        <Textarea
          rows={3}
          value={form.palavrasChave ?? ''}
          onChange={(e) => set('palavrasChave', e.target.value)}
          placeholder="Liste as principais palavras-chave, separadas por vírgula"
        />
      </div>

      <div>
        <SectionTitle>2. Estratégia</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Objetivo principal da campanha">
            <Select
              value={form.objetivoPrincipal ?? ''}
              onChange={(e) => set('objetivoPrincipal', e.target.value as MarketingObjective)}
            >
              <option value="">Selecione...</option>
              {(Object.entries(MARKETING_OBJECTIVE_LABEL) as [MarketingObjective, string][]).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <div>
            <span className="mb-1 block text-xs font-medium text-slate-500">Plataformas utilizadas</span>
            <div className="flex flex-wrap gap-3 pt-2">
              {(Object.entries(AD_PLATFORM_LABEL) as [AdPlatform, string][]).map(([value, label]) => (
                <label key={value} className="flex items-center gap-1.5 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.plataformas.includes(value)}
                    onChange={() => togglePlatform(value)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
          <Field label="Regiões de segmentação">
            <Input value={form.regioesSegmentacao ?? ''} onChange={(e) => set('regioesSegmentacao', e.target.value)} />
          </Field>
          <Field label="Produtos/serviços a anunciar">
            <Input value={form.produtosServicos ?? ''} onChange={(e) => set('produtosServicos', e.target.value)} />
          </Field>
          <Field label="Orçamento mensal de anúncios (R$)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.orcamentoMensalAnuncios ?? ''}
              onChange={(e) => set('orcamentoMensalAnuncios', toNumberOrUndefined(e.target.value))}
            />
          </Field>
          <Field label="Posicionamento de preço">
            <Select
              value={form.posicionamentoPreco ?? ''}
              onChange={(e) => set('posicionamentoPreco', e.target.value as PriceComparison)}
            >
              <option value="">Selecione...</option>
              {(Object.entries(PRICE_COMPARISON_LABEL) as [PriceComparison, string][]).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>3. Público-alvo</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Descrição do público principal">
              <Textarea rows={2} value={form.descricaoPublico ?? ''} onChange={(e) => set('descricaoPublico', e.target.value)} />
            </Field>
          </div>
          <Field label="Faixa etária">
            <Input value={form.faixaEtaria ?? ''} onChange={(e) => set('faixaEtaria', e.target.value)} />
          </Field>
          <Field label="Gênero">
            <Input value={form.genero ?? ''} onChange={(e) => set('genero', e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Interesses relevantes">
              <Textarea rows={2} value={form.interesses ?? ''} onChange={(e) => set('interesses', e.target.value)} />
            </Field>
          </div>
          <Field label="Público B2B?">
            <Select
              value={form.publicoB2B === undefined ? '' : form.publicoB2B ? 'sim' : 'nao'}
              onChange={(e) => set('publicoB2B', e.target.value === '' ? undefined : e.target.value === 'sim')}
            >
              <option value="">Selecione...</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </Select>
          </Field>
          <div />
          {form.publicoB2B && (
            <>
              <Field label="Setor">
                <Input value={form.b2bSetor ?? ''} onChange={(e) => set('b2bSetor', e.target.value)} />
              </Field>
              <Field label="Cargo do decisor">
                <Input value={form.b2bCargoDecisor ?? ''} onChange={(e) => set('b2bCargoDecisor', e.target.value)} />
              </Field>
              <Field label="Faturamento mínimo">
                <Input value={form.b2bFaturamentoMinimo ?? ''} onChange={(e) => set('b2bFaturamentoMinimo', e.target.value)} />
              </Field>
            </>
          )}
        </div>
      </div>

      <div>
        <SectionTitle>4. Concorrentes</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Concorrente 1">
            <Input value={form.concorrente1 ?? ''} onChange={(e) => set('concorrente1', e.target.value)} />
          </Field>
          <Field label="Concorrente 2">
            <Input value={form.concorrente2 ?? ''} onChange={(e) => set('concorrente2', e.target.value)} />
          </Field>
          <Field label="Concorrente 3">
            <Input value={form.concorrente3 ?? ''} onChange={(e) => set('concorrente3', e.target.value)} />
          </Field>
          <div />
          <div className="sm:col-span-2">
            <Field label="O que oferece que os concorrentes não oferecem">
              <Textarea
                rows={2}
                value={form.diferencialVsConcorrentes ?? ''}
                onChange={(e) => set('diferencialVsConcorrentes', e.target.value)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Diferenciais para usar nos anúncios">
              <Textarea
                rows={2}
                value={form.diferenciaisParaAnuncios ?? ''}
                onChange={(e) => set('diferenciaisParaAnuncios', e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>5. Benchmarking</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Link da pesquisa salva no Drive">
              <Input value={form.linkPesquisaDrive ?? ''} onChange={(e) => set('linkPesquisaDrive', e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Observações do benchmarking">
              <Textarea rows={2} value={form.observacoesBenchmarking ?? ''} onChange={(e) => set('observacoesBenchmarking', e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>6. Criativos e direcionamento</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Endereço de destino dos anúncios (URL da LP ou WhatsApp)">
              <Input value={form.enderecoDestino ?? ''} onChange={(e) => set('enderecoDestino', e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Observações sobre criativos">
              <Textarea rows={2} value={form.observacoesCriativos ?? ''} onChange={(e) => set('observacoesCriativos', e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>7. Observações gerais</SectionTitle>
        <Textarea rows={3} value={form.observacoesGerais ?? ''} onChange={(e) => set('observacoesGerais', e.target.value)} />
      </div>

      <Button icon={<Save size={14} />} onClick={handleSave} loading={saving} className="self-start">
        Salvar planejamento
      </Button>
    </div>
  )
}
