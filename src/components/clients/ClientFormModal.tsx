import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Timestamp } from 'firebase/firestore'
import { Modal } from '../ui/Modal'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useUsers } from '../../hooks/useUsers'
import { createClient, updateClient } from '../../services/clientService'
import { createOnboardingTasks } from '../../services/onboardingTemplates'
import { createPaidTrafficTasks } from '../../services/paidTrafficTemplates'
import {
  CLIENT_PACKAGE_LABEL,
  CLIENT_STATUS_LABEL,
  STYLE_CATALOG_DESCRIPTION,
  STYLE_CATALOG_LABEL,
  getClientOwnerIds,
  type Client,
  type ClientPackage,
  type ClientStatus,
  type StyleCatalog,
} from '../../types/client'

const EMPTY = {
  companyName: '',
  contactName: '',
  whatsapp: '',
  email: '',
  instagram: '',
  facebook: '',
  website: '',
  city: '',
  segment: '',
  document: '',
  status: 'prospect' as ClientStatus,
  package: '' as ClientPackage | '',
  styleCatalog: '' as StyleCatalog | '',
  ownerIds: [] as string[],
  monthlyValue: '',
  contractStartDate: '',
  notes: '',
  socialMedia: false,
  paidTraffic: false,
  metaAds: false,
  googleAds: false,
}

function toDateInputValue(ts?: Timestamp | null) {
  if (!ts) return ''
  return ts.toDate().toISOString().slice(0, 10)
}

export function ClientFormModal({
  open,
  onClose,
  client,
}: {
  open: boolean
  onClose: () => void
  client?: Client | null
}) {
  const { profile } = useAuth()
  const { data: users } = useUsers()
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [createTasks, setCreateTasks] = useState(true)

  useEffect(() => {
    if (client) {
      setForm({
        companyName: client.companyName,
        contactName: client.contactName,
        whatsapp: client.whatsapp ?? '',
        email: client.email ?? '',
        instagram: client.instagram ?? '',
        facebook: client.facebook ?? '',
        website: client.website ?? '',
        city: client.city ?? '',
        segment: client.segment ?? '',
        document: client.document ?? '',
        status: client.status,
        package: client.package ?? '',
        styleCatalog: client.styleCatalog ?? '',
        ownerIds: getClientOwnerIds(client),
        monthlyValue: client.monthlyValue != null ? String(client.monthlyValue) : '',
        contractStartDate: toDateInputValue(client.contractStartDate),
        notes: client.notes ?? '',
        socialMedia: client.modules?.socialMedia ?? false,
        paidTraffic: client.modules?.paidTraffic ?? false,
        metaAds: client.modules?.metaAds ?? false,
        googleAds: client.modules?.googleAds ?? false,
      })
    } else {
      setForm(EMPTY)
      setCreateTasks(true)
    }
  }, [client, open])

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggleOwner = (uid: string) =>
    setForm((f) => ({
      ...f,
      ownerIds: f.ownerIds.includes(uid) ? f.ownerIds.filter((id) => id !== uid) : [...f.ownerIds, uid],
    }))

  const autoTaskSummary = [
    form.socialMedia && 'Social Media: Ativação + Materiais',
    form.paidTraffic && 'Tráfego Pago: Onboarding, Briefing e Acessos, Planejamento de Campanhas + recorrentes',
  ]
    .filter(Boolean)
    .join('; ')

  const handleSubmit = async () => {
    if (!form.companyName.trim() || !profile) return
    setSaving(true)
    try {
      const payload = {
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        whatsapp: form.whatsapp || undefined,
        email: form.email || undefined,
        instagram: form.instagram || undefined,
        facebook: form.facebook || undefined,
        website: form.website || undefined,
        city: form.city || undefined,
        segment: form.segment || undefined,
        document: form.document || undefined,
        status: form.status,
        package: form.socialMedia ? form.package || undefined : undefined,
        styleCatalog: form.styleCatalog || undefined,
        ownerIds: form.ownerIds.length > 0 ? form.ownerIds : undefined,
        monthlyValue: form.monthlyValue ? Number(form.monthlyValue) : undefined,
        contractStartDate: form.contractStartDate ? Timestamp.fromDate(new Date(form.contractStartDate)) : null,
        notes: form.notes || undefined,
        modules: {
          ...client?.modules,
          socialMedia: form.socialMedia,
          paidTraffic: form.paidTraffic,
          metaAds: form.paidTraffic && form.metaAds,
          googleAds: form.paidTraffic && form.googleAds,
        },
      }
      if (client) {
        await updateClient(client.id, payload, profile.id, profile.name)
        toast.success('Cliente atualizado')
      } else {
        const newClientId = await createClient(payload, profile.id, profile.name)
        if (createTasks) {
          const newClient = { id: newClientId, companyName: payload.companyName }
          const trafficOwnerId = form.ownerIds[0] ?? profile.id
          if (form.socialMedia) {
            await createOnboardingTasks(newClient, profile.id, profile.name)
          }
          if (form.paidTraffic) {
            await createPaidTrafficTasks(newClient, profile.id, profile.name, trafficOwnerId)
          }
        }
        toast.success('Cliente cadastrado')
      }
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar cliente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={client ? 'Editar cliente' : 'Novo cliente'} width="max-w-2xl">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nome da empresa" required>
          <Input autoFocus value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
        </Field>
        <Field label="Responsável do cliente">
          <Input value={form.contactName} onChange={(e) => set('contactName', e.target.value)} />
        </Field>
        <Field label="WhatsApp">
          <Input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="(11) 99999-9999" />
        </Field>
        <Field label="E-mail">
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Instagram">
          <Input value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@usuario" />
        </Field>
        <Field label="Facebook">
          <Input value={form.facebook} onChange={(e) => set('facebook', e.target.value)} />
        </Field>
        <Field label="Site">
          <Input value={form.website} onChange={(e) => set('website', e.target.value)} />
        </Field>
        <Field label="Cidade/Região">
          <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
        </Field>
        <Field label="Segmento">
          <Input value={form.segment} onChange={(e) => set('segment', e.target.value)} placeholder="Ex: Limpeza, Estética" />
        </Field>
        <Field label="CNPJ ou CPF">
          <Input value={form.document} onChange={(e) => set('document', e.target.value)} placeholder="00.000.000/0000-00" />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set('status', e.target.value as ClientStatus)}>
            {Object.entries(CLIENT_STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex flex-col gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Serviços contratados</p>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.paidTraffic}
              onChange={(e) => set('paidTraffic', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
            />
            Tráfego Pago
          </label>
          {form.paidTraffic && (
            <div className="ml-6 flex flex-col gap-1.5">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.metaAds}
                  onChange={(e) => set('metaAds', e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                Meta Ads
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.googleAds}
                  onChange={(e) => set('googleAds', e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                Google Ads
              </label>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.socialMedia}
              onChange={(e) => set('socialMedia', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
            />
            Social Media
          </label>
          {form.socialMedia && (
            <div className="ml-6">
              <Field label="Pacote">
                <Select value={form.package} onChange={(e) => set('package', e.target.value as ClientPackage)}>
                  <option value="">Nenhum</option>
                  {Object.entries(CLIENT_PACKAGE_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          )}
        </div>

        <Field label="Valor mensal do contrato">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.monthlyValue}
            onChange={(e) => set('monthlyValue', e.target.value)}
            placeholder="R$ 0,00"
          />
        </Field>
        <Field label="Data de início do contrato">
          <Input
            type="date"
            value={form.contractStartDate}
            onChange={(e) => set('contractStartDate', e.target.value)}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Catálogo de estilo">
            <Select
              value={form.styleCatalog}
              onChange={(e) => set('styleCatalog', (e.target.value ? Number(e.target.value) : '') as StyleCatalog | '')}
            >
              <option value="">Nenhum escolhido ainda</option>
              {Object.entries(STYLE_CATALOG_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
            {form.styleCatalog && (
              <p className="mt-1 text-xs text-slate-400">{STYLE_CATALOG_DESCRIPTION[form.styleCatalog]}</p>
            )}
          </Field>
        </div>

        <div className="sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-slate-500">Responsável interno</span>
          <div className="flex flex-col gap-1.5 rounded-lg border border-slate-200 p-2.5">
            {users.length === 0 && <p className="text-xs text-slate-400">Nenhum usuário cadastrado.</p>}
            {users.map((u) => (
              <label key={u.id} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.ownerIds.includes(u.id)}
                  onChange={() => toggleOwner(u.id)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                {u.name}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-400">Selecione um ou mais responsáveis (ex: co-gestão de Tráfego Pago).</p>
        </div>

        <div className="sm:col-span-2">
          <Field label="Observações">
            <Textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </Field>
        </div>
      </div>

      {!client && (form.socialMedia || form.paidTraffic) && (
        <label className="mt-3 flex items-start gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={createTasks}
            onChange={(e) => setCreateTasks(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
          />
          Criar automaticamente as tarefas padrão dos serviços marcados acima ({autoTaskSummary})
        </label>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} loading={saving} disabled={!form.companyName.trim()}>
          {client ? 'Salvar' : 'Cadastrar'}
        </Button>
      </div>
    </Modal>
  )
}
