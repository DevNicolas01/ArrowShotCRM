import { useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Field, Input, Select } from '../ui/Field'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useClients } from '../../hooks/useClients'
import { createContent } from '../../services/contentService'
import {
  CONTENT_PILLAR_LABEL,
  CONTENT_PLATFORM_LABEL,
  CONTENT_TYPE_LABEL,
  type ContentPillar,
  type ContentPlatform,
  type ContentStatus,
  type ContentType,
} from '../../types/content'

export function ContentFormModal({
  open,
  onClose,
  defaultClientId,
  defaultStatus = 'ideas',
}: {
  open: boolean
  onClose: () => void
  defaultClientId?: string
  defaultStatus?: ContentStatus
}) {
  const { profile } = useAuth()
  const { data: clients } = useClients()

  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState(defaultClientId ?? '')
  const [type, setType] = useState<ContentType>('post')
  const [platform, setPlatform] = useState<ContentPlatform>('instagram')
  const [pillar, setPillar] = useState<ContentPillar | ''>('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !clientId || !profile) return
    setSaving(true)
    try {
      await createContent(
        {
          clientId,
          title: title.trim(),
          type,
          platform,
          pillar: pillar || undefined,
          status: defaultStatus,
          order: Date.now(),
          hashtags: [],
          scheduledDate: null,
        },
        profile.id,
        profile.name
      )
      toast.success('Conteúdo criado')
      setTitle('')
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao criar conteúdo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Novo conteúdo">
      <div className="flex flex-col gap-3">
        <Field label="Título" required>
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Carrossel - Dicas de limpeza"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </Field>

        <Field label="Cliente" required>
          <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Selecione...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Tipo">
            <Select value={type} onChange={(e) => setType(e.target.value as ContentType)}>
              {Object.entries(CONTENT_TYPE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Plataforma">
            <Select value={platform} onChange={(e) => setPlatform(e.target.value as ContentPlatform)}>
              {Object.entries(CONTENT_PLATFORM_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Pilar">
              <Select value={pillar} onChange={(e) => setPillar(e.target.value as ContentPillar)}>
                <option value="">Nenhum</option>
                {Object.entries(CONTENT_PILLAR_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={saving} disabled={!title.trim() || !clientId}>
            Criar conteúdo
          </Button>
        </div>
      </div>
    </Modal>
  )
}
