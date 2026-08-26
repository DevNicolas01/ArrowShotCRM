import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAllTasks } from '../hooks/useTasks'
import { useClients } from '../hooks/useClients'
import { useUsers } from '../hooks/useUsers'
import { useAuth } from '../context/AuthContext'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { TaskCard } from '../components/tasks/TaskCard'
import { TaskDrawer } from '../components/tasks/TaskDrawer'
import { TaskFormModal } from '../components/tasks/TaskFormModal'
import { Button } from '../components/ui/Button'
import { moveTaskStatus } from '../services/taskService'
import { TASK_STATUS_LABEL, TASK_STATUS_ORDER, type Task, type TaskStatus } from '../types/task'

const ACCENTS: Record<TaskStatus, string> = {
  todo: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  review: 'bg-amber-500',
  waiting_client: 'bg-fuchsia-500',
  done: 'bg-emerald-500',
}

export function KanbanPage() {
  const { profile } = useAuth()
  const { data: tasks } = useAllTasks()
  const { data: clients } = useClients()
  const { data: users } = useUsers()
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const openTask = tasks.find((t) => t.id === openTaskId) ?? null
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  const columns = TASK_STATUS_ORDER.map((s) => ({ id: s, label: TASK_STATUS_LABEL[s], accent: ACCENTS[s] }))

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Kanban de Tarefas</h1>
          <p className="text-sm text-slate-400">Arraste os cards para atualizar o status.</p>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setCreating(true)}>
          Nova tarefa
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard<Task, TaskStatus>
          columns={columns}
          items={tasks}
          getStatus={(t) => t.status}
          renderCard={(t) => (
            <TaskCard
              task={t}
              client={t.clientId ? clientMap[t.clientId] : undefined}
              assignee={t.assignedTo ? userMap[t.assignedTo] : undefined}
              onClick={() => setOpenTaskId(t.id)}
            />
          )}
          onMove={(task, newStatus, newOrder) => {
            if (!profile) return
            moveTaskStatus(task, newStatus, newOrder, profile.id, profile.name)
          }}
        />
      </div>

      <TaskDrawer key={`task-${openTaskId ?? 'none'}`} task={openTask} onClose={() => setOpenTaskId(null)} />
      <TaskFormModal open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
