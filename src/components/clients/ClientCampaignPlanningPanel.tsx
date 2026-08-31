import { useEffect, useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Save, Plus, Trash2 } from 'lucide-react'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { updateClient } from '../../services/clientService'
import { maskPhone } from '../../utils/masks'
import {
  EMPTY_CAMPAIGN_PLANNING,
  EMPTY_CAMPAIGN_PLANNING_ACCESS,
  EMPTY_META_ADS_PLANNING,
  EMPTY_GOOGLE_ADS_PLANNING,
  MARKETING_OBJECTIVE_LABEL,
  AD_PLATFORM_LABEL,
  PRICE_COMPARISON_LABEL,
  META_FUNNEL_STAGE_LABEL,
  META_OBJECTIVE_LABEL,
  GOOGLE_ADS_NETWORK_LABEL,
  GOOGLE_BID_TYPE_LABEL,
  type Client,
  type CampaignPlanning,
  type CampaignPlanningAccess,
  type MetaAdsPlanning,
  type MetaCampaignItem,
  type GoogleAdsPlanning,
  type GoogleCampaignItem,
  type AdPlatform,
  type MarketingObjective,
  type PriceComparison,
  type MetaFunnelStage,
  type MetaObjective,
  type GoogleAdsNetwork,
  type GoogleBidType,
} from '../../types'

function toNumberOrUndefined(v: string) {
  return v === '' ? undefined : Number(v)
}

function toDateInputValue(ts?: Timestamp | null) {
  if (!ts) return ''
  return ts.toDate().toISOString().slice(0, 10)
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function SectionTitle({ children }: { children: string }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{children}</p>
}

function SubTitle({ children }: { children: string }) {
  return <p className="mb-1.5 text-sm font-semibold text-slate-700">{children}</p>
}

function YesNoField({ label, value, onChange }: { label: string; value?: boolean; onChange: (v?: boolean) => void }) {
  return (
    <Field label={label}>
      <Select
        value={value === undefined ? '' : value ? 'sim' : 'nao'}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value === 'sim')}
      >
        <option value="">Selecione...</option>
        <option value="sim">Sim</option>
        <option value="nao">Não</option>
      </Select>
    </Field>
  )
}

function CalculatedField({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <div className="flex h-[38px] items-center rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm text-slate-500">
        {value != null && !Number.isNaN(value) ? formatBRL(value) : '—'}
      </div>
    </div>
  )
}

function mergeCampaignPlanning(saved?: CampaignPlanning): CampaignPlanning {
  return {
    ...EMPTY_CAMPAIGN_PLANNING,
    ...saved,
    acessos: { ...EMPTY_CAMPAIGN_PLANNING_ACCESS, ...saved?.acessos },
    metaAds: { ...EMPTY_META_ADS_PLANNING, ...saved?.metaAds, campanhas: saved?.metaAds?.campanhas ?? [] },
    googleAds: { ...EMPTY_GOOGLE_ADS_PLANNING, ...saved?.googleAds, campanhas: saved?.googleAds?.campanhas ?? [] },
    plataformas: saved?.plataformas ?? [],
  }
}

export function ClientCampaignPlanningPanel({ client }: { client: Client }) {
  const { profile } = useAuth()
  const [form, setForm] = useState<CampaignPlanning>(mergeCampaignPlanning(client.campaignPlanning))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(mergeCampaignPlanning(client.campaignPlanning))
  }, [client.id, client.campaignPlanning])

  const set = <K extends keyof CampaignPlanning>(key: K, value: CampaignPlanning[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setAccess = <K extends keyof CampaignPlanningAccess>(key: K, value: CampaignPlanningAccess[K]) =>
    setForm((f) => ({ ...f, acessos: { ...f.acessos, [key]: value } }))

  const setMeta = <K extends keyof MetaAdsPlanning>(key: K, value: MetaAdsPlanning[K]) =>
    setForm((f) => ({ ...f, metaAds: { ...f.metaAds, [key]: value } }))

  const setGoogle = <K extends keyof GoogleAdsPlanning>(key: K, value: GoogleAdsPlanning[K]) =>
    setForm((f) => ({ ...f, googleAds: { ...f.googleAds, [key]: value } }))

  const addMetaCampaign = () =>
    setMeta('campanhas', [...form.metaAds.campanhas, { id: crypto.randomUUID() }])
  const updateMetaCampaign = (id: string, patch: Partial<MetaCampaignItem>) =>
    setMeta('campanhas', form.metaAds.campanhas.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const removeMetaCampaign = (id: string) =>
    setMeta('campanhas', form.metaAds.campanhas.filter((c) => c.id !== id))

  const addGoogleCampaign = () =>
    setGoogle('campanhas', [...form.googleAds.campanhas, { id: crypto.randomUUID() }])
  const updateGoogleCampaign = (id: string, patch: Partial<GoogleCampaignItem>) =>
    setGoogle('campanhas', form.googleAds.campanhas.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const removeGoogleCampaign = (id: string) =>
    setGoogle('campanhas', form.googleAds.campanhas.filter((c) => c.id !== id))

  const togglePlatform = (platform: AdPlatform) =>
    setForm((f) => ({
      ...f,
      plataformas: f.plataformas.includes(platform)
        ? f.plataformas.filter((p) => p !== platform)
        : [...f.plataformas, platform],
    }))

  const metaVerbaDiaria =
    form.metaAds.verbaMensal && form.metaAds.diasDoMes ? form.metaAds.verbaMensal / form.metaAds.diasDoMes : undefined
  const googleVerbaDiaria =
    form.googleAds.verbaMensal && form.googleAds.diasDoMes ? form.googleAds.verbaMensal / form.googleAds.diasDoMes : undefined

  const funnelPercents = [
    form.metaAds.distribuicaoTopoPercent,
    form.metaAds.distribuicaoMeioPercent,
    form.metaAds.distribuicaoFundoPercent,
  ]
  const funnelTouched = funnelPercents.some((p) => p != null)
  const funnelSum = funnelPercents.reduce((sum: number, p) => sum + (p ?? 0), 0)

  const funnelVerba = (percent?: number) =>
    metaVerbaDiaria != null && percent != null ? (metaVerbaDiaria * percent) / 100 : undefined

  const handleSave = async () => {
    if (!profile) return
    if (funnelTouched && funnelSum !== 100) {
      toast.error('A distribuição por funil (Topo + Meio + Fundo) deve somar 100%.')
      return
    }
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
    <div className="flex flex-col gap-6">
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

      {/* SEÇÃO 1 — ACESSOS DAS CONTAS */}
      <div>
        <SectionTitle>1. Acessos das contas</SectionTitle>
        <p className="mb-3 text-xs text-slate-400">
          Por segurança, login e senha não ficam registrados aqui — apenas o status do acesso e links.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <SubTitle>Site</SubTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="URL do site">
                <Input value={form.acessos.siteUrl ?? ''} onChange={(e) => setAccess('siteUrl', e.target.value)} />
              </Field>
              <YesNoField
                label="Acesso confirmado?"
                value={form.acessos.siteAcessoConfirmado}
                onChange={(v) => setAccess('siteAcessoConfirmado', v)}
              />
            </div>
          </div>

          <div>
            <SubTitle>Facebook / Meta Business</SubTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Link da página do Facebook">
                <Input value={form.acessos.facebookLink ?? ''} onChange={(e) => setAccess('facebookLink', e.target.value)} />
              </Field>
              <YesNoField
                label="Acesso ao Gerenciador de Anúncios confirmado?"
                value={form.acessos.facebookGerenciadorConfirmado}
                onChange={(v) => setAccess('facebookGerenciadorConfirmado', v)}
              />
              <Field label="ID da conta de anúncios principal">
                <Input
                  value={form.acessos.facebookContaPrincipalId ?? ''}
                  onChange={(e) => setAccess('facebookContaPrincipalId', e.target.value)}
                />
              </Field>
              <Field label="ID da conta de anúncios reserva">
                <Input
                  value={form.acessos.facebookContaReservaId ?? ''}
                  onChange={(e) => setAccess('facebookContaReservaId', e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div>
            <SubTitle>Instagram</SubTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Link do perfil do Instagram">
                <Input value={form.acessos.instagramLink ?? ''} onChange={(e) => setAccess('instagramLink', e.target.value)} />
              </Field>
              <YesNoField
                label="Acesso como Editor confirmado?"
                value={form.acessos.instagramEditorConfirmado}
                onChange={(v) => setAccess('instagramEditorConfirmado', v)}
              />
            </div>
          </div>

          <div>
            <SubTitle>Google Ads</SubTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="ID da conta Google Ads">
                <Input value={form.acessos.googleAdsId ?? ''} onChange={(e) => setAccess('googleAdsId', e.target.value)} />
              </Field>
              <YesNoField
                label="Acesso confirmado?"
                value={form.acessos.googleAdsAcessoConfirmado}
                onChange={(v) => setAccess('googleAdsAcessoConfirmado', v)}
              />
              <YesNoField
                label="Forma de pagamento configurada?"
                value={form.acessos.googleAdsPagamentoConfigurado}
                onChange={(v) => setAccess('googleAdsPagamentoConfigurado', v)}
              />
            </div>
          </div>

          <div>
            <SubTitle>Google Tag Manager</SubTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="ID do container GTM">
                <Input value={form.acessos.gtmContainerId ?? ''} onChange={(e) => setAccess('gtmContainerId', e.target.value)} />
              </Field>
              <YesNoField
                label="Acesso confirmado?"
                value={form.acessos.gtmAcessoConfirmado}
                onChange={(v) => setAccess('gtmAcessoConfirmado', v)}
              />
              <YesNoField
                label="Código GTM instalado no site?"
                value={form.acessos.gtmCodigoInstalado}
                onChange={(v) => setAccess('gtmCodigoInstalado', v)}
              />
              <YesNoField
                label="Tag de remarketing instalada?"
                value={form.acessos.gtmTagRemarketingInstalada}
                onChange={(v) => setAccess('gtmTagRemarketingInstalada', v)}
              />
              <YesNoField
                label="Tags de conversão instaladas?"
                value={form.acessos.gtmTagsConversaoInstaladas}
                onChange={(v) => setAccess('gtmTagsConversaoInstaladas', v)}
              />
            </div>
          </div>

          <div>
            <SubTitle>Google Meu Negócio</SubTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Link do perfil GMB">
                <Input value={form.acessos.gmbLink ?? ''} onChange={(e) => setAccess('gmbLink', e.target.value)} />
              </Field>
              <YesNoField
                label="Acesso confirmado?"
                value={form.acessos.gmbAcessoConfirmado}
                onChange={(v) => setAccess('gmbAcessoConfirmado', v)}
              />
            </div>
          </div>

          <div>
            <SubTitle>Google Analytics</SubTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="ID da propriedade">
                <Input
                  value={form.acessos.analyticsPropertyId ?? ''}
                  onChange={(e) => setAccess('analyticsPropertyId', e.target.value)}
                />
              </Field>
              <YesNoField
                label="Acesso confirmado?"
                value={form.acessos.analyticsAcessoConfirmado}
                onChange={(v) => setAccess('analyticsAcessoConfirmado', v)}
              />
            </div>
          </div>

          <div>
            <SubTitle>WhatsApp para campanhas</SubTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Número com DDD">
                <Input
                  value={form.acessos.whatsappNumero ?? ''}
                  onChange={(e) => setAccess('whatsappNumero', maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                />
              </Field>
              <Field label="Link clicável do WhatsApp">
                <Input value={form.acessos.whatsappLink ?? ''} onChange={(e) => setAccess('whatsappLink', e.target.value)} />
              </Field>
            </div>
          </div>

          <Field label="Link da pasta Drive do cliente">
            <Input value={form.acessos.linkDrive ?? ''} onChange={(e) => setAccess('linkDrive', e.target.value)} />
          </Field>
        </div>
      </div>

      {/* SEÇÃO 2 — PLANEJAMENTO META ADS */}
      <div>
        <SectionTitle>2. Planejamento Meta Ads</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Verba mensal Meta Ads (R$)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.metaAds.verbaMensal ?? ''}
              onChange={(e) => setMeta('verbaMensal', toNumberOrUndefined(e.target.value))}
            />
          </Field>
          <Field label="Dias do mês">
            <Input
              type="number"
              min="1"
              max="31"
              value={form.metaAds.diasDoMes ?? 30}
              onChange={(e) => setMeta('diasDoMes', toNumberOrUndefined(e.target.value))}
            />
          </Field>
          <CalculatedField label="Verba diária" value={metaVerbaDiaria} />
        </div>

        <div className="mt-4">
          <SubTitle>Distribuição por funil</SubTitle>
          {funnelTouched && funnelSum !== 100 && (
            <p className="mb-2 text-xs font-medium text-red-500">As três porcentagens devem somar 100% (atual: {funnelSum}%).</p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(
              [
                ['topo', 'distribuicaoTopoPercent'],
                ['meio', 'distribuicaoMeioPercent'],
                ['fundo', 'distribuicaoFundoPercent'],
              ] as [MetaFunnelStage, 'distribuicaoTopoPercent' | 'distribuicaoMeioPercent' | 'distribuicaoFundoPercent'][]
            ).map(([stage, key]) => (
              <div key={stage} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
                <Field label={`${META_FUNNEL_STAGE_LABEL[stage]} — % do orçamento`}>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.metaAds[key] ?? ''}
                    onChange={(e) => setMeta(key, toNumberOrUndefined(e.target.value))}
                  />
                </Field>
                <CalculatedField label="Verba calculada" value={funnelVerba(form.metaAds[key])} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <SubTitle>Campanhas planejadas</SubTitle>
          <div className="flex flex-col gap-3">
            {form.metaAds.campanhas.map((c) => (
              <div key={c.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Field label="Etapa do funil">
                    <Select
                      value={c.etapaFunil ?? ''}
                      onChange={(e) => updateMetaCampaign(c.id, { etapaFunil: (e.target.value || undefined) as MetaFunnelStage })}
                    >
                      <option value="">Selecione...</option>
                      {(Object.entries(META_FUNNEL_STAGE_LABEL) as [MetaFunnelStage, string][]).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Objetivo">
                    <Select
                      value={c.objetivo ?? ''}
                      onChange={(e) => updateMetaCampaign(c.id, { objetivo: (e.target.value || undefined) as MetaObjective })}
                    >
                      <option value="">Selecione...</option>
                      {(Object.entries(META_OBJECTIVE_LABEL) as [MetaObjective, string][]).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </Select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Ideia/descrição da campanha">
                      <Input value={c.ideia ?? ''} onChange={(e) => updateMetaCampaign(c.id, { ideia: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Públicos">
                    <Input value={c.publicos ?? ''} onChange={(e) => updateMetaCampaign(c.id, { publicos: e.target.value })} />
                  </Field>
                  <Field label="Verba diária (R$)">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={c.verbaDiaria ?? ''}
                      onChange={(e) => updateMetaCampaign(c.id, { verbaDiaria: toNumberOrUndefined(e.target.value) })}
                    />
                  </Field>
                  <Field label="Data de criação">
                    <Input
                      type="date"
                      value={toDateInputValue(c.dataCriacao)}
                      onChange={(e) =>
                        updateMetaCampaign(c.id, { dataCriacao: e.target.value ? Timestamp.fromDate(new Date(e.target.value)) : null })
                      }
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Observações">
                      <Input value={c.observacoes ?? ''} onChange={(e) => updateMetaCampaign(c.id, { observacoes: e.target.value })} />
                    </Field>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={13} />}
                  onClick={() => removeMetaCampaign(c.id)}
                  className="self-start text-red-500 hover:bg-red-50"
                >
                  Remover campanha
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={addMetaCampaign} className="self-start">
              Adicionar campanha
            </Button>
          </div>
        </div>

        <div className="mt-4 sm:w-1/3">
          <Field label="Número máximo de conjuntos de anúncios">
            <Input
              type="number"
              min="0"
              value={form.metaAds.maxConjuntosAnuncios ?? ''}
              onChange={(e) => setMeta('maxConjuntosAnuncios', toNumberOrUndefined(e.target.value))}
            />
          </Field>
        </div>
      </div>

      {/* SEÇÃO 3 — PLANEJAMENTO GOOGLE ADS */}
      <div>
        <SectionTitle>3. Planejamento Google Ads</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Verba mensal Google Ads (R$)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.googleAds.verbaMensal ?? ''}
              onChange={(e) => setGoogle('verbaMensal', toNumberOrUndefined(e.target.value))}
            />
          </Field>
          <Field label="Dias do mês">
            <Input
              type="number"
              min="1"
              max="31"
              value={form.googleAds.diasDoMes ?? 30}
              onChange={(e) => setGoogle('diasDoMes', toNumberOrUndefined(e.target.value))}
            />
          </Field>
          <CalculatedField label="Verba diária" value={googleVerbaDiaria} />
        </div>

        <div className="mt-4">
          <SubTitle>Campanhas planejadas</SubTitle>
          <div className="flex flex-col gap-3">
            {form.googleAds.campanhas.map((c) => (
              <div key={c.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Field label="Rede">
                    <Select
                      value={c.rede ?? ''}
                      onChange={(e) => updateGoogleCampaign(c.id, { rede: (e.target.value || undefined) as GoogleAdsNetwork })}
                    >
                      <option value="">Selecione...</option>
                      {(Object.entries(GOOGLE_ADS_NETWORK_LABEL) as [GoogleAdsNetwork, string][]).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Nome da campanha">
                    <Input
                      value={c.nomeCampanha ?? ''}
                      onChange={(e) => updateGoogleCampaign(c.id, { nomeCampanha: e.target.value })}
                      placeholder="Seguir nomenclatura padrão"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Grupos de anúncios">
                      <Input
                        value={c.gruposAnuncios ?? ''}
                        onChange={(e) => updateGoogleCampaign(c.id, { gruposAnuncios: e.target.value })}
                      />
                    </Field>
                  </div>
                  <Field label="Tipo de lance">
                    <Select
                      value={c.tipoLance ?? ''}
                      onChange={(e) => updateGoogleCampaign(c.id, { tipoLance: (e.target.value || undefined) as GoogleBidType })}
                    >
                      <option value="">Selecione...</option>
                      {(Object.entries(GOOGLE_BID_TYPE_LABEL) as [GoogleBidType, string][]).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Verba diária (R$)">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={c.verbaDiaria ?? ''}
                      onChange={(e) => updateGoogleCampaign(c.id, { verbaDiaria: toNumberOrUndefined(e.target.value) })}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Observações">
                      <Input
                        value={c.observacoes ?? ''}
                        onChange={(e) => updateGoogleCampaign(c.id, { observacoes: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={13} />}
                  onClick={() => removeGoogleCampaign(c.id)}
                  className="self-start text-red-500 hover:bg-red-50"
                >
                  Remover campanha
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={addGoogleCampaign} className="self-start">
              Adicionar campanha
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Palavras-chave positivas">
            <Textarea
              rows={4}
              value={form.googleAds.palavrasChavePositivas ?? ''}
              onChange={(e) => setGoogle('palavrasChavePositivas', e.target.value)}
              placeholder="Uma por linha"
            />
          </Field>
          <Field label="Palavras-chave negativas">
            <Textarea
              rows={4}
              value={form.googleAds.palavrasChaveNegativas ?? ''}
              onChange={(e) => setGoogle('palavrasChaveNegativas', e.target.value)}
              placeholder="Uma por linha"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Localização de segmentação">
              <Input
                value={form.googleAds.localizacaoSegmentacao ?? ''}
                onChange={(e) => setGoogle('localizacaoSegmentacao', e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* SEÇÃO 4 — ESTRATÉGIA GERAL */}
      <div>
        <SectionTitle>4. Estratégia geral</SectionTitle>

        <div className="flex flex-col gap-4">
          <div>
            <SubTitle>Objetivo</SubTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Objetivo principal da campanha">
                <Select
                  value={form.objetivoPrincipal ?? ''}
                  onChange={(e) => set('objetivoPrincipal', e.target.value as MarketingObjective)}
                >
                  <option value="">Selecione...</option>
                  {(Object.entries(MARKETING_OBJECTIVE_LABEL) as [MarketingObjective, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
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
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          <div>
            <SubTitle>Público-alvo</SubTitle>
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
            <SubTitle>Concorrentes</SubTitle>
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
            <SubTitle>Benchmarking</SubTitle>
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
            <SubTitle>Criativos e direcionamento</SubTitle>
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
            <SubTitle>Observações gerais</SubTitle>
            <Textarea rows={3} value={form.observacoesGerais ?? ''} onChange={(e) => set('observacoesGerais', e.target.value)} />
          </div>
        </div>
      </div>

      <Button icon={<Save size={14} />} onClick={handleSave} loading={saving} className="self-start">
        Salvar planejamento
      </Button>
    </div>
  )
}
