import { useMemo, useState } from 'react'
import { format, isPast, isToday, isWithinInterval, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, AlertTriangle, Clock, Sparkles, Send, ThumbsUp, CalendarDays } from 'lucide-react'
import { useAllTasks } from '../hooks/useTasks'
import { useAllContents } from '../hooks/useContents'
import { useClients } from '../hooks/useClients'
import { EmptyState } from '../components/ui/EmptyState'
import { TaskDrawer } from '../components/tasks/TaskDrawer'
import { ContentDrawer } from '../components/content/ContentDrawer'
import type { Task } from '../types/task'
import type { Content } from '../types/content'

function SectionCard({
  title,
  icon,
  accent,
  count,
  children,
}: {
  title: string
  icon: React.ReactNode
  accent: string
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${accent}`}>{icon}</div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <span className="ml-auto text-xs font-medium text-slate-400">{count}</span>
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

function ContentRow({ content, onClick }: { content: Content; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50"
    >
      <span className="truncate text-slate-700">{content.title}</span>
      {content.scheduledDate && (
        <span className="shrink-0 text-xs text-slate-400">
          {format(content.scheduledDate.toDate(), 'dd MMM', { locale: ptBR })}
        </span>
      )}
    </button>
  )
}

export function DashboardPage() {
  const { data: tasks } = useAllTasks()
  const { data: contents } = useAllContents()
  const { data: clients } = useClients()
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)
  const [openContentId, setOpenContentId] = useState<string | null>(null)
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null
  const openContent = contents.find((c) => c.id === openContentId) ?? null

  const buckets = useMemo(() => {
    const openTasks = tasks.filter((t) => t.status !== 'done')
    const today = openTasks.filter((t) => t.dueDate && isToday(t.dueDate.toDate()))
    const overdue = openTasks.filter((t) => t.dueDate && isPast(t.dueDate.toDate()) && !isToday(t.dueDate.toDate()))
    const upcoming = openTasks.filter(
      (t) => t.dueDate && isWithinInterval(t.dueDate.toDate(), { start: addDays(new Date(), 1), end: addDays(new Date(), 7) })
    )

    const inProduction = contents.filter((c) => c.status === 'production')
    const waitingApproval = contents.filter((c) => c.status === 'waiting_client' || c.status === 'review')
    const approved = contents.filter((c) => c.status === 'approved' || c.status === 'scheduled')
    const nextPublications = contents
      .filter((c) => c.scheduledDate && c.scheduledDate.toDate() >= new Date())
      .sort((a, b) => a.scheduledDate!.toMillis() - b.scheduledDate!.toMillis())
      .slice(0, 6)

    return { today, overdue, upcoming, inProduction, waitingApproval, approved, nextPublications }
  }, [tasks, contents])

  const clientSummary = useMemo(() => {
    return clients
      .map((c) => ({
        client: c,
        openTasks: tasks.filter((t) => t.clientId === c.id && t.status !== 'done').length,
        pendingContents: contents.filter((ct) => ct.clientId === c.id && ct.status !== 'published').length,
      }))
      .filter((s) => s.openTasks > 0 || s.pendingContents > 0)
      .sort((a, b) => b.openTasks + b.pendingContents - (a.openTasks + a.pendingContents))
      .slice(0, 8)
  }, [clients, tasks, contents])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-400">Visão geral do que precisa da sua atenção hoje.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SectionCard title="Tarefas de hoje" icon={<Clock size={14} className="text-white" />} accent="bg-blue-500" count={buckets.today.length}>
          {buckets.today.length === 0 ? (
            <EmptyState title="Nada para hoje" />
          ) : (
            buckets.today.map((t) => <TaskRow key={t.id} task={t} onClick={() => setOpenTaskId(t.id)} />)
          )}
        </SectionCard>

        <SectionCard title="Tarefas atrasadas" icon={<AlertTriangle size={14} className="text-white" />} accent="bg-red-500" count={buckets.overdue.length}>
          {buckets.overdue.length === 0 ? (
            <EmptyState title="Nenhuma pendência" />
          ) : (
            buckets.overdue.map((t) => <TaskRow key={t.id} task={t} onClick={() => setOpenTaskId(t.id)} />)
          )}
        </SectionCard>

        <SectionCard title="Próximas (7 dias)" icon={<CheckCircle2 size={14} className="text-white" />} accent="bg-emerald-500" count={buckets.upcoming.length}>
          {buckets.upcoming.length === 0 ? (
            <EmptyState title="Nada agendado" />
          ) : (
            buckets.upcoming.map((t) => <TaskRow key={t.id} task={t} onClick={() => setOpenTaskId(t.id)} />)
          )}
        </SectionCard>

        <SectionCard title="Em produção" icon={<Sparkles size={14} className="text-white" />} accent="bg-brand-500" count={buckets.inProduction.length}>
          {buckets.inProduction.length === 0 ? (
            <EmptyState title="Nada em produção" />
          ) : (
            buckets.inProduction.map((c) => <ContentRow key={c.id} content={c} onClick={() => setOpenContentId(c.id)} />)
          )}
        </SectionCard>

        <SectionCard title="Aguardando aprovação" icon={<Send size={14} className="text-white" />} accent="bg-amber-500" count={buckets.waitingApproval.length}>
          {buckets.waitingApproval.length === 0 ? (
            <EmptyState title="Nada pendente" />
          ) : (
            buckets.waitingApproval.map((c) => <ContentRow key={c.id} content={c} onClick={() => setOpenContentId(c.id)} />)
          )}
        </SectionCard>

        <SectionCard title="Conteúdos aprovados" icon={<ThumbsUp size={14} className="text-white" />} accent="bg-teal-500" count={buckets.approved.length}>
          {buckets.approved.length === 0 ? (
            <EmptyState title="Nada aprovado ainda" />
          ) : (
            buckets.approved.map((c) => <ContentRow key={c.id} content={c} onClick={() => setOpenContentId(c.id)} />)
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard title="Próximas publicações" icon={<CalendarDays size={14} className="text-white" />} accent="bg-fuchsia-500" count={buckets.nextPublications.length}>
          {buckets.nextPublications.length === 0 ? (
            <EmptyState title="Nenhuma publicação agendada" />
          ) : (
            buckets.nextPublications.map((c) => <ContentRow key={c.id} content={c} onClick={() => setOpenContentId(c.id)} />)
          )}
        </SectionCard>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-slate-700">Resumo por cliente</p>
          {clientSummary.length === 0 ? (
            <EmptyState title="Tudo em dia" description="Nenhum cliente com pendências no momento." />
          ) : (
            <div className="flex flex-col gap-1.5">
              {clientSummary.map(({ client, openTasks, pendingContents }) => (
                <div key={client.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                  <span className="truncate text-slate-700">{client.companyName}</span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {openTasks} tarefas · {pendingContents} conteúdos
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TaskDrawer key={`task-${openTaskId ?? 'none'}`} task={openTask} onClose={() => setOpenTaskId(null)} />
      <ContentDrawer key={`content-${openContentId ?? 'none'}`} content={openContent} onClose={() => setOpenContentId(null)} />
    </div>
  )
}
