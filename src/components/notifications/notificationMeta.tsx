import type { ComponentType } from 'react'
import { differenceInMinutes, differenceInHours, isToday, isYesterday, format } from 'date-fns'
import {
  CheckSquare,
  AtSign,
  Clock,
  ThumbsUp,
  RotateCcw,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  ClipboardList,
  Palette,
  BarChart3,
  BellRing,
} from 'lucide-react'
import type { AppNotification, NotificationType } from '../../types'

type IconType = ComponentType<{ size?: number; className?: string }>

/** Icon per notification type — new types match the platform spec 1-to-1;
 *  legacy types (task_assigned, mention...) keep their original icon. */
export const NOTIFICATION_ICON: Record<NotificationType, IconType> = {
  task_assigned: CheckSquare,
  mention: AtSign,
  approval_requested: Clock,
  content_approved: ThumbsUp,
  change_requested: RotateCcw,
  due_soon: Clock,
  briefing_scheduled: CalendarClock,
  task_completed: CheckCircle2,
  task_overdue: AlertTriangle,
  new_client: UserPlus,
  briefing_filled: ClipboardList,
  content_review_requested: Palette,
  content_ready_to_schedule: CheckCircle2,
  funnel_saved: BarChart3,
  task_reminder: BellRing,
}

/** Icon chip background/text, per the spec's colors (azul, verde, vermelho,
 *  azul escuro, roxo, âmbar, cinza). Legacy types stay neutral slate. */
export const NOTIFICATION_ICON_STYLE: Record<NotificationType, string> = {
  task_assigned: 'bg-slate-100 text-slate-500',
  mention: 'bg-slate-100 text-slate-500',
  approval_requested: 'bg-slate-100 text-slate-500',
  content_approved: 'bg-slate-100 text-slate-500',
  change_requested: 'bg-slate-100 text-slate-500',
  due_soon: 'bg-slate-100 text-slate-500',
  briefing_scheduled: 'bg-blue-50 text-blue-600',
  task_completed: 'bg-emerald-50 text-emerald-600',
  task_overdue: 'bg-red-50 text-red-600',
  new_client: 'bg-indigo-50 text-indigo-700',
  briefing_filled: 'bg-purple-50 text-purple-600',
  content_review_requested: 'bg-amber-50 text-amber-600',
  content_ready_to_schedule: 'bg-emerald-50 text-emerald-600',
  funnel_saved: 'bg-slate-100 text-slate-500',
  task_reminder: 'bg-amber-50 text-amber-600',
}

/** "há 5 minutos" / "há 2 horas" / "ontem às 14:30" / "dd/MM/yyyy às HH:mm". */
export function formatNotificationTime(date: Date): string {
  const now = new Date()
  const minutes = differenceInMinutes(now, date)
  if (minutes < 1) return 'agora mesmo'
  if (minutes < 60) return `há ${minutes} minuto${minutes === 1 ? '' : 's'}`
  if (isToday(date)) {
    const hours = differenceInHours(now, date)
    return `há ${hours} hora${hours === 1 ? '' : 's'}`
  }
  if (isYesterday(date)) return `ontem às ${format(date, 'HH:mm')}`
  return format(date, "dd/MM/yyyy 'às' HH:mm")
}

/** Where clicking a notification should navigate to — the task/content
 *  targets carry the id as a query param so the destination page can open
 *  the right drawer directly (see TasksPage/SocialMediaPage). */
export function resolveNotificationRoute(n: Pick<AppNotification, 'entityType' | 'entityId'>): string | null {
  if (!n.entityType || !n.entityId) return null
  switch (n.entityType) {
    case 'client':
      return `/clientes/${n.entityId}`
    case 'task':
      return `/tarefas?task=${n.entityId}`
    case 'content':
      return `/social-media?content=${n.entityId}`
    default:
      return null
  }
}
