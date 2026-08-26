import { format, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarClock, CheckSquare } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { TASK_PRIORITY_COLOR, TASK_PRIORITY_LABEL, type Task } from '../../types/task'
import type { AppUser, Client } from '../../types'

export function TaskCard({
  task,
  client,
  assignee,
  onClick,
}: {
  task: Task
  client?: Client
  assignee?: AppUser
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const dueDate = task.dueDate?.toDate()
  const overdue = dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== 'done'
  const checklistDone = task.checklist?.filter((i) => i.done).length ?? 0
  const checklistTotal = task.checklist?.length ?? 0

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`cursor-pointer rounded-lg border border-slate-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      {client && (
        <p className="mb-1 truncate text-[11px] font-medium text-brand-500">{client.companyName}</p>
      )}
      <p className="text-sm font-medium text-slate-800">{task.title}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge className={TASK_PRIORITY_COLOR[task.priority]}>{TASK_PRIORITY_LABEL[task.priority]}</Badge>
        {checklistTotal > 0 && (
          <Badge className="bg-slate-100 text-slate-500">
            <CheckSquare size={11} /> {checklistDone}/{checklistTotal}
          </Badge>
        )}
        {dueDate && (
          <Badge className={overdue ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}>
            <CalendarClock size={11} /> {format(dueDate, 'dd MMM', { locale: ptBR })}
          </Badge>
        )}
      </div>

      {assignee && (
        <div className="mt-2 flex justify-end">
          <Avatar name={assignee.name} photoURL={assignee.photoURL} size="xs" />
        </div>
      )}
    </div>
  )
}
