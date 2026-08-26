import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Field, Input, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { createTrail, updateTrail } from '../../services/trailService'
import type { Trail } from '../../types'

export function TrailFormModal({
  open,
  onClose,
  trail,
  nextOrder,
}: {
  open: boolean
  onClose: () => void
  /** When set, edits this trail instead of creating a new one. */
  trail?: Trail | null
  /** Suggested `order` for a new trail (ignored when editing). */
  nextOrder?: number
}) {
  const { profile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(trail?.title ?? '')
    setDescription(trail?.description ?? '')
  }, [open, trail])

  const handleSubmit = async () => {
    if (!title.trim() || !profile) return
    setSaving(true)
    try {
      if (trail) {
        await updateTrail(trail.id, { title: title.trim(), description: description.trim() }, profile.id)
        toast.success('Trilha atualizada')
      } else {
        await createTrail(
          { title: title.trim(), description: description.trim(), order: nextOrder ?? 0 },
          profile.id
        )
        toast.success('Trilha criada')
      }
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar trilha')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={trail ? 'Editar trilha' : 'Nova trilha'}>
      <div className="flex flex-col gap-3">
        <Field label="Título" required>
          <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Social Media" />
        </Field>
        <Field label="Descrição">
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={saving} disabled={!title.trim()}>
            {trail ? 'Salvar' : 'Criar trilha'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
