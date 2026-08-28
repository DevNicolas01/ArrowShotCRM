import { useEffect, useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Save, Plus, X } from 'lucide-react'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { updateClient } from '../../services/clientService'
import { markBriefingChecklistDone } from '../../services/taskService'
import {
  EMPTY_COMMERCIAL_BRIEFING,
  MARKETING_OBJECTIVE_LABEL,
  PRICE_COMPARISON_LABEL,
  CREDIT_CARD_FOR_ADS_LABEL,
  type Client,
  type CommercialBriefing,
  type BriefingContact,
  type BriefingAccess,
  type MarketingObjective,
  type PriceComparison,
  type CreditCardForAds,
} from '../../types'

function toDateInputValue(ts?: Timestamp | null) {
  if (!ts) return ''
  return ts.toDate().toISOString().slice(0, 10)
}

function toNumberOrUndefined(v: string) {
  return v === '' ? undefined : Number(v)
}

function SectionTitle({ children }: { children: string }) {
  return <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{children}</p>
}

function ContactListField({
  label,
  contacts,
  onChange,
}: {
  label: string
  contacts: BriefingContact[]
  onChange: (contacts: BriefingContact[]) => void
}) {
  const update = (id: string, patch: Partial<BriefingContact>) =>
    onChange(contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const add = () => onChange([...contacts, { id: crypto.randomUUID(), name: '', email: '', birthday: null }])
  const remove = (id: string) => onChange(contacts.filter((c) => c.id !== id))

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <Button variant="ghost" size="sm" icon={<Plus size={13} />} onClick={add}>
          Adicionar
        </Button>
      </div>
      {contacts.length === 0 && <p className="text-xs text-slate-400">Nenhum contato adicionado.</p>}
      <div className="flex flex-col gap-2">
        {contacts.map((c) => (
          <div key={c.id} className="grid grid-cols-1 items-end gap-2 rounded-md bg-slate-50 p-2 sm:grid-cols-[1fr_1fr_150px_auto]">
            <Field label="Nome">
              <Input value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} />
            </Field>
            <Field label="E-mail">
              <Input type="email" value={c.email} onChange={(e) => update(c.id, { email: e.target.value })} />
            </Field>
            <Field label="Aniversário">
              <Input
                type="date"
                value={toDateInputValue(c.birthday)}
                onChange={(e) => update(c.id, { birthday: e.target.value ? Timestamp.fromDate(new Date(e.target.value)) : null })}
              />
            </Field>
            <button
              onClick={() => remove(c.id)}
              aria-label="Remover contato"
              className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const ACCESS_CHECKBOXES: { key: keyof BriefingAccess; label: string }[] = [
  { key: 'agenciaNasContasDeAnuncios', label: 'Usuário da agência adicionado nas contas de anúncios' },
  { key: 'instagram', label: 'Acesso ao Instagram' },
  { key: 'facebookPagina', label: 'Acesso à página do Facebook' },
  { key: 'analytics', label: 'Acesso ao Analytics' },
  { key: 'gtm', label: 'Acesso ao GTM' },
  { key: 'googleMeuNegocio', label: 'Acesso ao Google Meu Negócio' },
]

export function ClientCommercialBriefingPanel({ client }: { client: Client }) {
  const { profile } = useAuth()
  const [form, setForm] = useState<CommercialBriefing>(client.commercialBriefing ?? EMPTY_COMMERCIAL_BRIEFING)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(client.commercialBriefing ?? EMPTY_COMMERCIAL_BRIEFING)
  }, [client.id, client.commercialBriefing])

  const set = <K extends keyof CommercialBriefing>(key: K, value: CommercialBriefing[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const setAccess = <K extends keyof BriefingAccess>(key: K, value: BriefingAccess[K]) =>
    setForm((f) => ({ ...f, acessos: { ...f.acessos, [key]: value } }))

  const toggleObjective = (objective: MarketingObjective) =>
    setForm((f) => ({
      ...f,
      objetivos: f.objetivos.includes(objective)
        ? f.objetivos.filter((o) => o !== objective)
        : [...f.objetivos, objective],
    }))

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const payload: CommercialBriefing = { ...form, filledAt: Timestamp.now() }
      await updateClient(client.id, { commercialBriefing: payload }, profile.id, profile.name)
      await markBriefingChecklistDone(client.id, profile.id, profile.name)
      toast.success('Briefing salvo')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar briefing')
    } finally {
      setSaving(false)
    }
  }

  const lastFilled = client.commercialBriefing?.filledAt

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-slate-400">
        Preenchido pelo CS durante ou logo após a call de briefing com o cliente.
        {lastFilled && (
          <>
            {' '}
            Última vez salvo por <strong>{client.commercialBriefing?.preenchidoPor}</strong> em{' '}
            {format(lastFilled.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.
          </>
        )}
      </p>

      <Field label="Preenchido por">
        <Input value={form.preenchidoPor} onChange={(e) => set('preenchidoPor', e.target.value)} placeholder="Ex: Jamilson" />
      </Field>

      <div>
        <SectionTitle>1. Dados básicos</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="CNPJ">
            <Input value={form.cnpj ?? ''} onChange={(e) => set('cnpj', e.target.value)} />
          </Field>
          <Field label="Site">
            <Input value={form.site ?? ''} onChange={(e) => set('site', e.target.value)} />
          </Field>
          <Field label="Instagram">
            <Input value={form.instagram ?? ''} onChange={(e) => set('instagram', e.target.value)} placeholder="@usuario" />
          </Field>
          <Field label="Página do Facebook">
            <Input value={form.facebookPagina ?? ''} onChange={(e) => set('facebookPagina', e.target.value)} />
          </Field>
          <Field label="Canal no YouTube">
            <Input value={form.youtube ?? ''} onChange={(e) => set('youtube', e.target.value)} />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>2. Responsáveis</SectionTitle>
        <div className="flex flex-col gap-2.5">
          <ContactListField label="Sócio/Diretor" contacts={form.socios} onChange={(v) => set('socios', v)} />
          <ContactListField label="Tomador de decisões" contacts={form.decisores} onChange={(v) => set('decisores', v)} />
          <ContactListField
            label="Responsável pela aprovação das campanhas"
            contacts={form.aprovadoresCampanhas}
            onChange={(v) => set('aprovadoresCampanhas', v)}
          />
          <ContactListField label="Responsável pelo financeiro" contacts={form.financeiro} onChange={(v) => set('financeiro', v)} />
          <ContactListField label="Responsável pelo marketing" contacts={form.marketing} onChange={(v) => set('marketing', v)} />
          <ContactListField label="Responsável pelo comercial" contacts={form.comercial} onChange={(v) => set('comercial', v)} />
        </div>
      </div>

      <div>
        <SectionTitle>3. Acessos</SectionTitle>
        <div className="flex flex-col gap-1.5">
          {ACCESS_CHECKBOXES.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.acessos[key] as boolean}
                onChange={(e) => setAccess(key, e.target.checked as BriefingAccess[typeof key])}
                className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
              />
              {label}
            </label>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Link da pasta Drive com materiais da empresa">
              <Input value={form.acessos.linkDrive ?? ''} onChange={(e) => setAccess('linkDrive', e.target.value)} />
            </Field>
          </div>
          <Field label="Telefone fixo">
            <Input value={form.acessos.telefoneFixo ?? ''} onChange={(e) => setAccess('telefoneFixo', e.target.value)} />
          </Field>
          <Field label="WhatsApp para campanhas">
            <Input value={form.acessos.whatsappCampanhas ?? ''} onChange={(e) => setAccess('whatsappCampanhas', e.target.value)} />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>4. Comercial</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Como o time está estruturado?">
            <Textarea rows={2} value={form.estruturaTime ?? ''} onChange={(e) => set('estruturaTime', e.target.value)} />
          </Field>
          <Field label="Como funciona o processo de vendas?">
            <Textarea rows={2} value={form.processoVendas ?? ''} onChange={(e) => set('processoVendas', e.target.value)} />
          </Field>
          <Field label="Qual sistema usa para gestão de leads?">
            <Input value={form.sistemaGestaoLeads ?? ''} onChange={(e) => set('sistemaGestaoLeads', e.target.value)} />
          </Field>
          <Field label="Há quanto tempo usa esse sistema?">
            <Input value={form.tempoUsoSistema ?? ''} onChange={(e) => set('tempoUsoSistema', e.target.value)} />
          </Field>
          <Field label="Qual o ciclo de venda?">
            <Input value={form.cicloVenda ?? ''} onChange={(e) => set('cicloVenda', e.target.value)} />
          </Field>
          <Field label="Qual o canal que mais vende?">
            <Input value={form.canalQueMaisVende ?? ''} onChange={(e) => set('canalQueMaisVende', e.target.value)} />
          </Field>
          <Field label="Quanto tempo a empresa está no mercado?">
            <Input value={form.tempoDeMercado ?? ''} onChange={(e) => set('tempoDeMercado', e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Percepção da empresa perante o mercado">
              <Textarea rows={2} value={form.percepcaoMercado ?? ''} onChange={(e) => set('percepcaoMercado', e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Quais são os desafios atuais?">
              <Textarea rows={2} value={form.desafiosAtuais ?? ''} onChange={(e) => set('desafiosAtuais', e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>5. Marketing e desenvolvimento</SectionTitle>
        <div className="flex flex-col gap-3">
          <div>
            <span className="mb-1 block text-xs font-medium text-slate-500">Objetivos</span>
            <div className="flex flex-wrap gap-3">
              {(Object.entries(MARKETING_OBJECTIVE_LABEL) as [MarketingObjective, string][]).map(([value, label]) => (
                <label key={value} className="flex items-center gap-1.5 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.objetivos.includes(value)}
                    onChange={() => toggleObjective(value)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="O que espera como resultado?">
                <Textarea rows={2} value={form.resultadoEsperado ?? ''} onChange={(e) => set('resultadoEsperado', e.target.value)} />
              </Field>
            </div>
            <Field label="Endereço para direcionamento da campanha">
              <Input value={form.enderecoDirecionamento ?? ''} onChange={(e) => set('enderecoDirecionamento', e.target.value)} />
            </Field>
            <Field label="Principais produtos/serviços">
              <Input value={form.principaisProdutos ?? ''} onChange={(e) => set('principaisProdutos', e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Períodos de sazonalidade (melhores e piores meses)">
                <Textarea rows={2} value={form.sazonalidade ?? ''} onChange={(e) => set('sazonalidade', e.target.value)} />
              </Field>
            </div>
            <Field label="Ticket médio (R$)">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.ticketMedio ?? ''}
                onChange={(e) => set('ticketMedio', toNumberOrUndefined(e.target.value))}
              />
            </Field>
            <Field label="Orçamento mensal para anúncios (R$)">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.orcamentoMensalAnuncios ?? ''}
                onChange={(e) => set('orcamentoMensalAnuncios', toNumberOrUndefined(e.target.value))}
              />
            </Field>
            <Field label="Faturamento mensal (R$)">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.faturamentoMensal ?? ''}
                onChange={(e) => set('faturamentoMensal', toNumberOrUndefined(e.target.value))}
              />
            </Field>
            <Field label="Faturamento anual (R$)">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.faturamentoAnual ?? ''}
                onChange={(e) => set('faturamentoAnual', toNumberOrUndefined(e.target.value))}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Formas de pagamento">
                <Input value={form.formasPagamento ?? ''} onChange={(e) => set('formasPagamento', e.target.value)} />
              </Field>
            </div>
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
              <Field label="O que oferece que concorrentes NÃO oferecem?">
                <Textarea
                  rows={2}
                  value={form.diferencialVsConcorrentes ?? ''}
                  onChange={(e) => set('diferencialVsConcorrentes', e.target.value)}
                />
              </Field>
            </div>
            <Field label="Ponto forte">
              <Textarea rows={2} value={form.pontoForte ?? ''} onChange={(e) => set('pontoForte', e.target.value)} />
            </Field>
            <Field label="Ponto fraco">
              <Textarea rows={2} value={form.pontoFraco ?? ''} onChange={(e) => set('pontoFraco', e.target.value)} />
            </Field>
            <Field label="Preço em relação aos concorrentes">
              <Select value={form.precoComparado ?? ''} onChange={(e) => set('precoComparado', e.target.value as PriceComparison)}>
                <option value="">Selecione...</option>
                {(Object.entries(PRICE_COMPARISON_LABEL) as [PriceComparison, string][]).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Possui cartão de crédito para pagar anúncios?">
              <Select value={form.cartaoCreditoAnuncios ?? ''} onChange={(e) => set('cartaoCreditoAnuncios', e.target.value as CreditCardForAds)}>
                <option value="">Selecione...</option>
                {(Object.entries(CREDIT_CARD_FOR_ADS_LABEL) as [CreditCardForAds, string][]).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Por que comprar mesmo sendo igual ou mais caro?">
                <Textarea
                  rows={2}
                  value={form.motivoComprarMesmoCaro ?? ''}
                  onChange={(e) => set('motivoComprarMesmoCaro', e.target.value)}
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>6. Perfil do cliente ideal — B2C</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Gênero">
            <Input value={form.b2cGenero ?? ''} onChange={(e) => set('b2cGenero', e.target.value)} />
          </Field>
          <Field label="Estado civil e filhos">
            <Input value={form.b2cEstadoCivilFilhos ?? ''} onChange={(e) => set('b2cEstadoCivilFilhos', e.target.value)} />
          </Field>
          <Field label="Idade">
            <Input value={form.b2cIdade ?? ''} onChange={(e) => set('b2cIdade', e.target.value)} />
          </Field>
          <Field label="Escolaridade e profissão">
            <Input value={form.b2cEscolaridadeProfissao ?? ''} onChange={(e) => set('b2cEscolaridadeProfissao', e.target.value)} />
          </Field>
          <Field label="Onde mora/região">
            <Input value={form.b2cRegiao ?? ''} onChange={(e) => set('b2cRegiao', e.target.value)} />
          </Field>
          <div />
          <div className="sm:col-span-2">
            <Field label="Dor latente da persona">
              <Textarea rows={2} value={form.b2cDorLatente ?? ''} onChange={(e) => set('b2cDorLatente', e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Soluções que já tentou antes">
              <Textarea rows={2} value={form.b2cSolucoesTentadas ?? ''} onChange={(e) => set('b2cSolucoesTentadas', e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>7. Perfil do cliente ideal — B2B</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Setor">
            <Input value={form.b2bSetor ?? ''} onChange={(e) => set('b2bSetor', e.target.value)} />
          </Field>
          <Field label="Faturamento mínimo (R$)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.b2bFaturamentoMinimo ?? ''}
              onChange={(e) => set('b2bFaturamentoMinimo', toNumberOrUndefined(e.target.value))}
            />
          </Field>
          <Field label="Quantidade de funcionários">
            <Input value={form.b2bQuantidadeFuncionarios ?? ''} onChange={(e) => set('b2bQuantidadeFuncionarios', e.target.value)} />
          </Field>
          <Field label="Cargo do decisor">
            <Input value={form.b2bCargoDecisor ?? ''} onChange={(e) => set('b2bCargoDecisor', e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Localização">
              <Input value={form.b2bLocalizacao ?? ''} onChange={(e) => set('b2bLocalizacao', e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>8. Palavras-chave</SectionTitle>
        <Textarea rows={3} value={form.palavrasChave ?? ''} onChange={(e) => set('palavrasChave', e.target.value)} placeholder="Liste as principais palavras-chave, separadas por vírgula" />
      </div>

      <div>
        <SectionTitle>9. Observações gerais</SectionTitle>
        <Textarea rows={3} value={form.observacoes ?? ''} onChange={(e) => set('observacoes', e.target.value)} />
      </div>

      <Button icon={<Save size={14} />} onClick={handleSave} loading={saving} className="self-start">
        Salvar briefing
      </Button>
    </div>
  )
}
