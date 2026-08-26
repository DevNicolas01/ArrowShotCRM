import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useAllTasks } from '../hooks/useTasks'
import { useClients } from '../hooks/useClients'
import { useUsers } from '../hooks/useUsers'
import { TaskDrawer } from '../components/tasks/TaskDrawer'
import { TaskFormModal } from '../components/tasks/TaskFormModal'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { EmptyState } from '../components/ui/EmptyState'
import { TASK_PRIORITY_COLOR, TASK_PRIORITY_LABEL, TASK_STATUS_LABEL } from '../types/task'

export function TasksPage() {
  const { data: tasks, loading } = useAllTasks()
  const { data: clients } = useClients()
  const { data: users } = useUsers()

  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const openTask = tasks.find((t) => t.id === openTaskId) ?? null

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      if (clientFilter && t.clientId !== clientFilter) return false
      if (assigneeFilter && t.assignedTo !== assigneeFilter) return false
      if (statusFilter && t.status !== statusFilter) return false
      if (priorityFilter && t.priority !== priorityFilter) return false
      return true
    })
  }, [tasks, search, clientFilter, assigneeFilter, statusFilter, priorityFilter])

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Tarefas</h1>
          <p className="text-sm text-slate-400">{filtered.length} tarefa(s)</p>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setCreating(true)}>
          Nova tarefa
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tarefa..."
            className="rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm">
          <option value="">Todos os clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.companyName}</option>
          ))}
        </select>
        <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm">
          <option value="">Todos os responsáveis</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm">
          <option value="">Todos os status</option>
          {Object.entries(TASK_STATUS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm">
          <option value="">Todas as prioridades</option>
          {Object.entries(TASK_PRIORITY_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState title="Nenhuma tarefa encontrada" description="Ajuste os filtros ou crie uma nova tarefa." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2.5 font-medium">Tarefa</th>
                <th className="px-4 py-2.5 font-medium">Cliente</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Prioridade</th>
                <th className="px-4 py-2.5 font-medium">Prazo</th>
                <th className="px-4 py-2.5 font-medium">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setOpenTaskId(t.id)}
                  className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-2.5 font-medium text-slate-700">{t.title}</td>
                  <td className="px-4 py-2.5 text-slate-500">{t.clientId ? clientMap[t.clientId]?.companyName ?? '—' : '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500">{TASK_STATUS_LABEL[t.status]}</td>
                  <td className="px-4 py-2.5">
                    <Badge className={TASK_PRIORITY_COLOR[t.priority]}>{TASK_PRIORITY_LABEL[t.priority]}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {t.dueDate ? t.dueDate.toDate().toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    {t.assignedTo && userMap[t.assignedTo] ? (
                      <Avatar name={userMap[t.assignedTo].name} photoURL={userMap[t.assignedTo].photoURL} size="xs" />
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <TaskDrawer key={`task-${openTaskId ?? 'none'}`} task={openTask} onClose={() => setOpenTaskId(null)} />
      <TaskFormModal open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
