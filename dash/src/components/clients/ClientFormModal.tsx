import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useUsers } from '../../hooks/useUsers'
import { createClient, updateClient } from '../../services/clientService'
import { createOnboardingTasks } from '../../services/onboardingTemplates'
import {
  CLIENT_PACKAGE_LABEL,
  CLIENT_STATUS_LABEL,
  STYLE_CATALOG_DESCRIPTION,
  STYLE_CATALOG_LABEL,
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
  status: 'prospect' as ClientStatus,
  package: '' as ClientPackage | '',
  styleCatalog: '' as StyleCatalog | '',
  ownerId: '',
  notes: '',
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
        status: client.status,
        package: client.package ?? '',
        styleCatalog: client.styleCatalog ?? '',
        ownerId: client.ownerId ?? '',
        notes: client.notes ?? '',
      })
    } else {
      setForm(EMPTY)
      setCreateTasks(true)
    }
  }, [client, open])

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

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
        status: form.status,
        package: form.package || undefined,
        styleCatalog: form.styleCatalog || undefined,
        ownerId: form.ownerId || undefined,
        notes: form.notes || undefined,
      }
      if (client) {
        await updateClient(client.id, payload, profile.id, profile.name)
        toast.success('Cliente atualizado')
      } else {
        const newClientId = await createClient(payload, profile.id, profile.name)
        if (createTasks) {
          await createOnboardingTasks({ id: newClientId, companyName: payload.companyName }, profile.id, profile.name)
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
        <Field label="Status">
          <Select value={form.status} onChange={(e) => set('status', e.target.value as ClientStatus)}>
            {Object.entries(CLIENT_STATUS_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Pacote (Social Media)">
          <Select value={form.package} onChange={(e) => set('package', e.target.value as ClientPackage)}>
            <option value="">Nenhum</option>
            {Object.entries(CLIENT_PACKAGE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
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
        <Field label="Responsável interno">
          <Select value={form.ownerId} onChange={(e) => set('ownerId', e.target.value)}>
            <option value="">Nenhum</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Observações">
            <Textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </Field>
        </div>
      </div>

      {!client && (
        <label className="mt-3 flex items-start gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={createTasks}
            onChange={(e) => setCreateTasks(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
          />
          Criar automaticamente as tarefas de "Ativação" e "Materiais" com o checklist padrão (playbook de Social Media)
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
