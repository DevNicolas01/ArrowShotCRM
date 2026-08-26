import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useClients } from '../../hooks/useClients'
import { useUsers } from '../../hooks/useUsers'
import { createTask } from '../../services/taskService'
import { TASK_PRIORITY_LABEL, type TaskPriority } from '../../types/task'

export function TaskFormModal({
  open,
  onClose,
  defaultClientId,
  defaultStatus,
}: {
  open: boolean
  onClose: () => void
  defaultClientId?: string
  defaultStatus?: 'todo' | 'in_progress' | 'review' | 'waiting_client' | 'done'
}) {
  const { profile } = useAuth()
  const { data: clients } = useClients()
  const { data: users } = useUsers()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState(defaultClientId ?? '')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setTitle('')
    setDescription('')
    setClientId(defaultClientId ?? '')
    setAssignedTo('')
    setDueDate('')
    setPriority('normal')
  }

  const handleSubmit = async () => {
    if (!title.trim() || !profile) return
    setSaving(true)
    try {
      await createTask(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          clientId: clientId || undefined,
          assignedTo: assignedTo || undefined,
          dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
          priority,
          status: defaultStatus ?? 'todo',
          checklist: [],
          order: Date.now(),
        },
        profile.id,
        profile.name
      )
      toast.success('Tarefa criada')
      reset()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao criar tarefa')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova tarefa">
      <div className="flex flex-col gap-3">
        <Field label="Título" required>
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Criar arte para post do dia 25"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </Field>

        <Field label="Descrição">
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Cliente">
            <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Nenhum</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Responsável">
            <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Sem responsável</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Prazo">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>

          <Field label="Prioridade">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {Object.entries(TASK_PRIORITY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={saving} disabled={!title.trim()}>
            Criar tarefa
          </Button>
        </div>
      </div>
    </Modal>
  )
}
