import { useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { Trash2 } from 'lucide-react'
import { Drawer } from '../ui/Drawer'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Tabs } from '../ui/Tabs'
import { Button } from '../ui/Button'
import { ChecklistEditor } from './ChecklistEditor'
import { CommentsPanel } from '../comments/CommentsPanel'
import { ActivityPanel } from '../activity/ActivityPanel'
import { FilesPanel } from '../files/FilesPanel'
import { useAuth } from '../../context/AuthContext'
import { useClients } from '../../hooks/useClients'
import { useUsers } from '../../hooks/useUsers'
import { updateTask, deleteTask } from '../../services/taskService'
import {
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
  type Task,
} from '../../types/task'

function toDateInputValue(ts?: Timestamp | null) {
  if (!ts) return ''
  return ts.toDate().toISOString().slice(0, 10)
}

export function TaskDrawer({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { profile } = useAuth()
  const { data: clients } = useClients()
  const { data: users } = useUsers()
  const [title, setTitle] = useState(task?.title ?? '')

  if (!task || !profile) return null

  const save = (data: Partial<Task>) => updateTask(task.id, data, profile.id, profile.name)

  const handleDelete = async () => {
    if (!confirm(`Excluir a tarefa "${task.title}"?`)) return
    await deleteTask(task, profile.id, profile.name)
    onClose()
  }

  return (
    <Drawer
      open={!!task}
      onClose={onClose}
      title={
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== task.title && save({ title: title.trim() })}
          className="w-full border-none bg-transparent text-base font-semibold text-slate-800 outline-none"
        />
      }
    >
      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Status">
            <Select value={task.status} onChange={(e) => save({ status: e.target.value as Task['status'] })}>
              {TASK_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {TASK_STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Prioridade">
            <Select value={task.priority} onChange={(e) => save({ priority: e.target.value as Task['priority'] })}>
              {Object.entries(TASK_PRIORITY_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Cliente">
            <Select value={task.clientId ?? ''} onChange={(e) => save({ clientId: e.target.value || undefined })}>
              <option value="">Nenhum</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Responsável">
            <Select
              value={task.assignedTo ?? ''}
              onChange={(e) => save({ assignedTo: e.target.value || undefined })}
            >
              <option value="">Sem responsável</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Prazo">
            <Input
              type="date"
              value={toDateInputValue(task.dueDate)}
              onChange={(e) => save({ dueDate: e.target.value ? Timestamp.fromDate(new Date(e.target.value)) : null })}
            />
          </Field>
        </div>

        <Field label="Descrição">
          <Textarea
            rows={3}
            defaultValue={task.description ?? ''}
            onBlur={(e) => e.target.value !== (task.description ?? '') && save({ description: e.target.value })}
          />
        </Field>

        <Field label="Checklist">
          <ChecklistEditor items={task.checklist ?? []} onChange={(checklist) => save({ checklist })} />
        </Field>

        <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={handleDelete} className="self-start">
          Excluir tarefa
        </Button>
      </div>

      <Tabs
        tabs={[
          { label: 'Comentários', content: <CommentsPanel entityType="task" entityId={task.id} clientId={task.clientId} /> },
          {
            label: 'Arquivos',
            content: task.clientId ? (
              <FilesPanel clientId={task.clientId} category="social-media" relatedType="task" relatedId={task.id} />
            ) : (
              <p className="text-sm text-slate-400">Associe um cliente para anexar arquivos.</p>
            ),
          },
          { label: 'Histórico', content: <ActivityPanel entityType="task" entityId={task.id} /> },
        ]}
      />
    </Drawer>
  )
}
