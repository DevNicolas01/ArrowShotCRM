import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { isPast, isToday, isWithinInterval, addDays } from 'date-fns'
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
import {
  TASK_STATUS_LABEL,
  TASK_BOARD_LABEL,
  ONBOARDING_BOARD_STATUS_ORDER,
  GENERIC_BOARD_STATUS_ORDER,
  type Task,
  type TaskStatus,
  type TaskBoard,
} from '../types/task'

const ACCENTS: Record<TaskStatus, string> = {
  todo: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  review: 'bg-amber-500',
  waiting_client: 'bg-violet-500',
  done: 'bg-emerald-500',
  new_client: 'bg-slate-400',
  onboarding: 'bg-blue-500',
  briefing: 'bg-amber-500',
  access_setup: 'bg-violet-500',
  planning: 'bg-indigo-500',
  active: 'bg-emerald-500',
}

type DueFilter = '' | 'overdue' | 'today' | 'week' | 'none'

const DUE_FILTER_LABEL: Record<DueFilter, string> = {
  '': 'Todos os prazos',
  overdue: 'Atrasadas',
  today: 'Vencem hoje',
  week: 'Próximos 7 dias',
  none: 'Sem prazo',
}

export function KanbanPage() {
  const { profile } = useAuth()
  const { data: tasks } = useAllTasks()
  const { data: clients } = useClients()
  const { data: users } = useUsers()
  const [board, setBoard] = useState<TaskBoard>('onboarding')
  const [clientFilter, setClientFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [dueFilter, setDueFilter] = useState<DueFilter>('')
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const openTask = tasks.find((t) => t.id === openTaskId) ?? null
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  const boardTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.board !== board) return false
      if (clientFilter && t.clientId !== clientFilter) return false
      if (assigneeFilter && t.assignedTo !== assigneeFilter) return false
      if (dueFilter) {
        const due = t.dueDate?.toDate()
        if (dueFilter === 'none') {
          if (due) return false
        } else if (!due) {
          return false
        } else if (dueFilter === 'overdue') {
          if (!(isPast(due) && !isToday(due))) return false
        } else if (dueFilter === 'today') {
          if (!isToday(due)) return false
        } else if (dueFilter === 'week') {
          if (!isWithinInterval(due, { start: new Date(), end: addDays(new Date(), 7) })) return false
        }
      }
      return true
    })
  }, [tasks, board, clientFilter, assigneeFilter, dueFilter])

  const columnOrder = board === 'onboarding' ? ONBOARDING_BOARD_STATUS_ORDER : GENERIC_BOARD_STATUS_ORDER
  const columns = columnOrder.map((s) => ({ id: s, label: TASK_STATUS_LABEL[s], accent: ACCENTS[s] }))

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kanban de Tarefas</h1>
          <p className="text-sm text-slate-500">Arraste os cards para atualizar o status.</p>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setCreating(true)}>
          Nova tarefa
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {(Object.entries(TASK_BOARD_LABEL) as [TaskBoard, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setBoard(id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                board === id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ml-0 flex flex-wrap items-center gap-2 sm:ml-4">
          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="h-[38px] rounded-lg border border-slate-200 px-3 text-sm transition-all duration-150 ease-in-out focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100">
            <option value="">Todos os clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="h-[38px] rounded-lg border border-slate-200 px-3 text-sm transition-all duration-150 ease-in-out focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100">
            <option value="">Todos os responsáveis</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select value={dueFilter} onChange={(e) => setDueFilter(e.target.value as DueFilter)} className="h-[38px] rounded-lg border border-slate-200 px-3 text-sm transition-all duration-150 ease-in-out focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100">
            {(Object.entries(DUE_FILTER_LABEL) as [DueFilter, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard<Task, TaskStatus>
          columns={columns}
          items={boardTasks}
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
      <TaskFormModal open={creating} onClose={() => setCreating(false)} defaultBoard={board} />
    </div>
  )
}
