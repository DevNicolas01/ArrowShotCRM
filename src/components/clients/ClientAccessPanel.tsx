import { useEffect, useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Save } from 'lucide-react'
import { Field, Input } from '../ui/Field'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { updateClient } from '../../services/clientService'
import { EMPTY_CLIENT_ACCESS, type Client, type ClientAccess, type AccessItem } from '../../types'

function AccessCheckbox({
  label,
  item,
  onChange,
}: {
  label: string
  item: AccessItem
  onChange: (item: AccessItem) => void
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={(e) => onChange({ ...item, checked: e.target.checked })}
          className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
        />
        {label}
      </label>
      {item.checked && (
        <input
          value={item.link ?? ''}
          onChange={(e) => onChange({ ...item, link: e.target.value })}
          placeholder="Link (opcional)"
          className="mt-1 ml-5.5 w-[calc(100%-1.4rem)] rounded-md border border-slate-200 px-2 py-1 text-xs outline-none placeholder:text-slate-400 focus:border-brand-400"
        />
      )}
    </div>
  )
}

export function ClientAccessPanel({ client }: { client: Client }) {
  const { profile } = useAuth()
  const [form, setForm] = useState<ClientAccess>(client.access ?? EMPTY_CLIENT_ACCESS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(client.access ?? EMPTY_CLIENT_ACCESS)
  }, [client.id, client.access])

  const set = <K extends keyof ClientAccess>(key: K, value: ClientAccess[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const payload: ClientAccess = { ...form, preenchidoPor: profile.name, filledAt: Timestamp.now() }
      await updateClient(client.id, { access: payload }, profile.id, profile.name)
      toast.success('Acessos salvos')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar acessos')
    } finally {
      setSaving(false)
    }
  }

  const lastFilled = client.access?.filledAt

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-400">
        Preenchido pelos gestores da conta.
        {lastFilled && (
          <>
            {' '}
            Última vez salvo por <strong>{client.access?.preenchidoPor}</strong> em{' '}
            {format(lastFilled.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.
          </>
        )}
      </p>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.agenciaNasContasDeAnuncios}
            onChange={(e) => set('agenciaNasContasDeAnuncios', e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
          />
          Usuário da agência adicionado nas contas de anúncios
        </label>
        <AccessCheckbox label="Acesso ao Instagram" item={form.instagram} onChange={(v) => set('instagram', v)} />
        <AccessCheckbox label="Acesso à página do Facebook" item={form.facebookPagina} onChange={(v) => set('facebookPagina', v)} />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.analytics}
            onChange={(e) => set('analytics', e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
          />
          Acesso ao Analytics
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.gtm}
            onChange={(e) => set('gtm', e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
          />
          Acesso ao GTM — Google Tag Manager
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.googleMeuNegocio}
            onChange={(e) => set('googleMeuNegocio', e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
          />
          Acesso ao Google Meu Negócio
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Link da pasta Drive com materiais do cliente">
            <Input value={form.linkDrive ?? ''} onChange={(e) => set('linkDrive', e.target.value)} />
          </Field>
        </div>
        <Field label="WhatsApp para campanhas">
          <Input value={form.whatsappCampanhas ?? ''} onChange={(e) => set('whatsappCampanhas', e.target.value)} />
        </Field>
        <Field label="Telefone fixo">
          <Input value={form.telefoneFixo ?? ''} onChange={(e) => set('telefoneFixo', e.target.value)} />
        </Field>
      </div>

      <Button icon={<Save size={14} />} onClick={handleSave} loading={saving} className="self-start">
        Salvar acessos
      </Button>
    </div>
  )
}
