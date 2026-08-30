import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, isPast, isToday, isWithinInterval, addDays, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, AlertTriangle, Clock, Sparkles, Send, ThumbsUp, CalendarDays, Plus } from 'lucide-react'
import { useAllTasks } from '../hooks/useTasks'
import { useAllContents } from '../hooks/useContents'
import { useClients } from '../hooks/useClients'
import { useUsers } from '../hooks/useUsers'
import { EmptyState } from '../components/ui/EmptyState'
import { DashboardEmptyState } from '../components/dashboard/DashboardEmptyState'
import { Button } from '../components/ui/Button'
import { TaskDrawer } from '../components/tasks/TaskDrawer'
import { TaskFormModal } from '../components/tasks/TaskFormModal'
import { ContentDrawer } from '../components/content/ContentDrawer'
import { ContentFormModal } from '../components/content/ContentFormModal'
import { getClientOwnerIds } from '../types/client'
import type { Task } from '../types/task'
import type { Content } from '../types/content'
import type { Client } from '../types/client'

type ClientHealth = 'green' | 'yellow' | 'red'

const HEALTH_DOT: Record<ClientHealth, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-400',
  red: 'bg-red-500',
}

const HEALTH_LABEL: Record<ClientHealth, string> = {
  green: 'Tudo em dia',
  yellow: 'Atenção',
  red: 'Crítico',
}

const HEALTH_RANK: Record<ClientHealth, number> = { red: 0, yellow: 1, green: 2 }

/** Vermelho: 2+ tarefas atrasadas, ou 1 atrasada de prioridade alta/urgente.
 *  Amarelo: 1 tarefa atrasada, ou algum checklist incompleto há mais de 3 dias.
 *  Verde: nenhuma das condições acima. */
function getClientHealth(clientId: string, tasks: Task[]): ClientHealth {
  const openTasks = tasks.filter((t) => t.clientId === clientId && t.status !== 'done')
  const overdue = openTasks.filter((t) => t.dueDate && isPast(t.dueDate.toDate()) && !isToday(t.dueDate.toDate()))
  const overdueHighPriority = overdue.some((t) => t.priority === 'high' || t.priority === 'urgent')
  const staleChecklist = openTasks.some((t) => {
    if (!t.checklist?.length || t.checklist.every((i) => i.done)) return false
    return differenceInDays(new Date(), t.createdAt.toDate()) > 3
  })

  if (overdue.length >= 2 || overdueHighPriority) return 'red'
  if (overdue.length === 1 || staleChecklist) return 'yellow'
  return 'green'
}

function clientServiceLabel(client: Client) {
  const traffic = client.modules?.paidTraffic
  const social = client.modules?.socialMedia
  if (traffic && social) return 'Ambos'
  if (traffic) return 'Tráfego'
  if (social) return 'SM'
  return '—'
}

type WidgetColor = 'red' | 'blue' | 'amber' | 'violet' | 'emerald' | 'slate'

const COLOR_STYLES: Record<WidgetColor, { border: string; tintBg: string; count: string }> = {
  red: { border: 'border-l-red-500', tintBg: 'bg-red-50', count: 'text-red-600' },
  blue: { border: 'border-l-blue-500', tintBg: 'bg-blue-50', count: 'text-blue-600' },
  amber: { border: 'border-l-amber-500', tintBg: 'bg-amber-50', count: 'text-amber-600' },
  violet: { border: 'border-l-violet-500', tintBg: 'bg-violet-50', count: 'text-violet-600' },
  emerald: { border: 'border-l-emerald-500', tintBg: 'bg-emerald-50', count: 'text-emerald-600' },
  slate: { border: 'border-l-slate-200', tintBg: 'bg-white', count: 'text-slate-400' },
}

function SectionCard({
  title,
  icon,
  accent,
  count,
  color = 'slate',
  emphasizeOnCount,
  children,
}: {
  title: string
  icon: React.ReactNode
  accent: string
  count: number
  /** Left-border (and, when emphasized, background) color — the widget's status identity. */
  color?: WidgetColor
  /** When true, count > 0 also tints the background and makes the count large/bold —
   *  reserved for the cards that need to actively grab attention (atrasadas/hoje/próximas). */
  emphasizeOnCount?: boolean
  children: React.ReactNode
}) {
  const emphasized = !!emphasizeOnCount && count > 0
  const styles = COLOR_STYLES[color]

  const wrapperClass = emphasized
    ? `flex flex-col rounded-xl border-l-4 ${styles.border} ${styles.tintBg} p-5 shadow-md transition-all duration-150 ease-in-out`
    : `flex flex-col rounded-xl border border-slate-100 border-l-4 ${styles.border} bg-white p-5 shadow-sm transition-all duration-150 ease-in-out`

  const countClass = emphasized ? `ml-auto text-lg font-bold ${styles.count}` : 'ml-auto text-xs font-medium text-slate-400'

  return (
    <div className={wrapperClass}>
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent}`}>{icon}</div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <span className={countClass}>{count}</span>
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  )
}

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50"
    >
      <span className="truncate text-slate-700">{task.title}</span>
      {task.dueDate && (
        <span className="shrink-0 text-xs text-slate-400">{format(task.dueDate.toDate(), 'dd MMM', { locale: ptBR })}</span>
      )}
    </button>
  )
}

function AddTaskAction({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={onClick}>
      Adicionar tarefa
    </Button>
  )
}

function AddContentAction({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={onClick}>
      Criar conteúdo
    </Button>
  )
}

function ContentRow({
  content,
  clientName,
  onClick,
}: {
  content: Content
  clientName?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50"
    >
      <span className="min-w-0 truncate text-slate-700">
        {clientName && <span className="text-brand-500">{clientName}</span>}
        {clientName && ' — '}
        {content.title}
      </span>
      {content.scheduledDate && (
        <span className="shrink-0 text-xs text-slate-400">
          {format(content.scheduledDate.toDate(), 'dd MMM', { locale: ptBR })}
        </span>
      )}
    </button>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: tasks } = useAllTasks()
  const { data: contents } = useAllContents()
  const { data: clients } = useClients()
  const { data: users } = useUsers()
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)
  const [openContentId, setOpenContentId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [contentModalOpen, setContentModalOpen] = useState(false)
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null
  const openContent = contents.find((c) => c.id === openContentId) ?? null

  const buckets = useMemo(() => {
    const openTasks = tasks.filter((t) => t.status !== 'done')
    const today = openTasks.filter((t) => t.dueDate && isToday(t.dueDate.toDate()))
    const overdue = openTasks.filter((t) => t.dueDate && isPast(t.dueDate.toDate()) && !isToday(t.dueDate.toDate()))
    const upcoming = openTasks.filter(
      (t) => t.dueDate && isWithinInterval(t.dueDate.toDate(), { start: addDays(new Date(), 1), end: addDays(new Date(), 7) })
    )

    // Cada bucket puxa exatamente uma coluna do board de Social Media.
    const inProduction = contents.filter((c) => c.status === 'production') // EM PRODUÇÃO
    const waitingApproval = contents.filter((c) => c.status === 'waiting_client') // AGUARDANDO CLIENTE
    const approved = contents.filter((c) => c.status === 'approved') // APROVADO
    const nextPublications = contents
      .filter((c) => c.status === 'scheduled' && c.scheduledDate) // AGENDADO
      .sort((a, b) => a.scheduledDate!.toMillis() - b.scheduledDate!.toMillis())
      .slice(0, 6)

    return { today, overdue, upcoming, inProduction, waitingApproval, approved, nextPublications }
  }, [tasks, contents])

  const allZero =
    buckets.today.length === 0 &&
    buckets.overdue.length === 0 &&
    buckets.upcoming.length === 0 &&
    buckets.inProduction.length === 0 &&
    buckets.waitingApproval.length === 0 &&
    buckets.approved.length === 0

  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users])
  const clientMap = useMemo(() => Object.fromEntries(clients.map((c) => [c.id, c])), [clients])

  const clientSummary = useMemo(() => {
    return clients
      .filter((c) => c.status === 'active')
      .map((c) => {
        const nextTask = tasks
          .filter((t) => t.clientId === c.id && t.status !== 'done' && t.dueDate)
          .sort((a, b) => a.dueDate!.toMillis() - b.dueDate!.toMillis())[0]
        const ownerId = getClientOwnerIds(c)[0]
        return {
          client: c,
          health: getClientHealth(c.id, tasks),
          service: clientServiceLabel(c),
          ownerName: ownerId ? (userMap[ownerId]?.name ?? '—') : '—',
          nextTask,
        }
      })
      .sort((a, b) => HEALTH_RANK[a.health] - HEALTH_RANK[b.health] || a.client.companyName.localeCompare(b.client.companyName))
  }, [clients, tasks, userMap])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Visão geral do que precisa da sua atenção hoje.</p>
      </div>

      {allZero && !expanded ? (
        <DashboardEmptyState
          counts={{
            today: buckets.today.length,
            overdue: buckets.overdue.length,
            upcoming: buckets.upcoming.length,
            inProduction: buckets.inProduction.length,
            waitingApproval: buckets.waitingApproval.length,
            approved: buckets.approved.length,
          }}
          onExpand={() => setExpanded(true)}
        />
      ) : (
        <>
          {allZero && (
            <button
              onClick={() => setExpanded(false)}
              className="self-start text-xs font-medium text-slate-400 hover:text-brand-500"
            >
              ← Recolher
            </button>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(buckets.overdue.length > 0
              ? ['overdue', 'today', 'upcoming', 'inProduction', 'waitingApproval', 'approved']
              : ['today', 'overdue', 'upcoming', 'inProduction', 'waitingApproval', 'approved']
            ).map((key) => {
              switch (key) {
                case 'today':
                  return (
                    <SectionCard
                      key="today"
                      title="Tarefas de hoje"
                      icon={<Clock size={14} className="text-white" />}
                      accent="bg-blue-500"
                      count={buckets.today.length}
                      color="blue"
                      emphasizeOnCount
                    >
                      {buckets.today.length === 0 ? (
                        <EmptyState title="Nada para hoje" action={<AddTaskAction onClick={() => setTaskModalOpen(true)} />} />
                      ) : (
                        buckets.today.map((t) => <TaskRow key={t.id} task={t} onClick={() => setOpenTaskId(t.id)} />)
                      )}
                    </SectionCard>
                  )
                case 'overdue':
                  return (
                    <SectionCard
                      key="overdue"
                      title="Tarefas atrasadas"
                      icon={<AlertTriangle size={14} className="text-white" />}
                      accent="bg-red-500"
                      count={buckets.overdue.length}
                      color="red"
                      emphasizeOnCount
                    >
                      {buckets.overdue.length === 0 ? (
                        <EmptyState title="Nenhuma pendência" action={<AddTaskAction onClick={() => setTaskModalOpen(true)} />} />
                      ) : (
                        buckets.overdue.map((t) => <TaskRow key={t.id} task={t} onClick={() => setOpenTaskId(t.id)} />)
                      )}
                    </SectionCard>
                  )
                case 'upcoming':
                  return (
                    <SectionCard
                      key="upcoming"
                      title="Próximas (7 dias)"
                      icon={<CheckCircle2 size={14} className="text-white" />}
                      accent="bg-amber-500"
                      count={buckets.upcoming.length}
                      color="amber"
                      emphasizeOnCount
                    >
                      {buckets.upcoming.length === 0 ? (
                        <EmptyState title="Nada agendado" action={<AddTaskAction onClick={() => setTaskModalOpen(true)} />} />
                      ) : (
                        buckets.upcoming.map((t) => <TaskRow key={t.id} task={t} onClick={() => setOpenTaskId(t.id)} />)
                      )}
                    </SectionCard>
                  )
                case 'inProduction':
                  return (
                    <SectionCard
                      key="inProduction"
                      title="Em produção"
                      icon={<Sparkles size={14} className="text-white" />}
                      accent="bg-blue-500"
                      count={buckets.inProduction.length}
                      color="blue"
                    >
                      {buckets.inProduction.length === 0 ? (
                        <EmptyState title="Nada em produção" action={<AddContentAction onClick={() => setContentModalOpen(true)} />} />
                      ) : (
                        buckets.inProduction.map((c) => <ContentRow key={c.id} content={c} onClick={() => setOpenContentId(c.id)} />)
                      )}
                    </SectionCard>
                  )
                case 'waitingApproval':
                  return (
                    <SectionCard
                      key="waitingApproval"
                      title="Aguardando aprovação"
                      icon={<Send size={14} className="text-white" />}
                      accent="bg-violet-500"
                      count={buckets.waitingApproval.length}
                      color="violet"
                    >
                      {buckets.waitingApproval.length === 0 ? (
                        <EmptyState title="Nada pendente" action={<AddContentAction onClick={() => setContentModalOpen(true)} />} />
                      ) : (
                        buckets.waitingApproval.map((c) => <ContentRow key={c.id} content={c} onClick={() => setOpenContentId(c.id)} />)
                      )}
                    </SectionCard>
                  )
                case 'approved':
                  return (
                    <SectionCard
                      key="approved"
                      title="Conteúdos aprovados"
                      icon={<ThumbsUp size={14} className="text-white" />}
                      accent="bg-emerald-500"
                      count={buckets.approved.length}
                      color="emerald"
                    >
                      {buckets.approved.length === 0 ? (
                        <EmptyState title="Nada aprovado ainda" />
                      ) : (
                        buckets.approved.map((c) => <ContentRow key={c.id} content={c} onClick={() => setOpenContentId(c.id)} />)
                      )}
                    </SectionCard>
                  )
                default:
                  return null
              }
            })}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard title="Próximas publicações" icon={<CalendarDays size={14} className="text-white" />} accent="bg-violet-500" color="violet" count={buckets.nextPublications.length}>
          {buckets.nextPublications.length === 0 ? (
            <EmptyState title="Nenhuma publicação agendada" />
          ) : (
            buckets.nextPublications.map((c) => (
              <ContentRow key={c.id} content={c} clientName={clientMap[c.clientId]?.companyName} onClick={() => setOpenContentId(c.id)} />
            ))
          )}
        </SectionCard>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-slate-700">Resumo por cliente</p>
          {clientSummary.length === 0 ? (
            <EmptyState title="Nenhum cliente ativo" />
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="w-6 py-1.5"></th>
                    <th className="py-1.5 pr-2 font-semibold">Cliente</th>
                    <th className="py-1.5 pr-2 font-semibold">Serviço</th>
                    <th className="py-1.5 pr-2 font-semibold">Responsável</th>
                    <th className="py-1.5 pr-2 font-semibold">Próxima tarefa</th>
                    <th className="py-1.5 font-semibold">Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {clientSummary.map(({ client, health, service, ownerName, nextTask }) => {
                    const overdueTask = nextTask?.dueDate && isPast(nextTask.dueDate.toDate()) && !isToday(nextTask.dueDate.toDate())
                    return (
                      <tr
                        key={client.id}
                        onClick={() => navigate(`/clientes/${client.id}`)}
                        className="cursor-pointer border-t border-slate-50 text-slate-700 transition-colors duration-150 ease-in-out hover:bg-slate-50"
                      >
                        <td className="py-2">
                          <span title={HEALTH_LABEL[health]} className={`block h-2.5 w-2.5 rounded-full ${HEALTH_DOT[health]}`} />
                        </td>
                        <td className="max-w-[140px] truncate py-2 pr-2 font-medium">{client.companyName}</td>
                        <td className="py-2 pr-2 text-slate-500">{service}</td>
                        <td className="py-2 pr-2 text-slate-500">{ownerName}</td>
                        <td className="max-w-[160px] truncate py-2 pr-2 text-slate-500">{nextTask?.title ?? '—'}</td>
                        <td className={`py-2 text-xs ${overdueTask ? 'font-bold text-red-600' : 'text-slate-400'}`}>
                          {nextTask?.dueDate ? format(nextTask.dueDate.toDate(), 'dd MMM', { locale: ptBR }) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <TaskDrawer key={`task-${openTaskId ?? 'none'}`} task={openTask} onClose={() => setOpenTaskId(null)} />
      <ContentDrawer key={`content-${openContentId ?? 'none'}`} content={openContent} onClose={() => setOpenContentId(null)} />
      <TaskFormModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
      <ContentFormModal open={contentModalOpen} onClose={() => setContentModalOpen(false)} />
    </div>
  )
}
