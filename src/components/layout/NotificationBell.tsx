import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, CheckSquare, ThumbsUp, RotateCcw, AtSign, Clock, CalendarClock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import { markAllNotificationsRead, markNotificationRead } from '../../services/notificationService'
import type { AppNotification, NotificationType } from '../../types'

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  task_assigned: CheckSquare,
  mention: AtSign,
  approval_requested: Clock,
  content_approved: ThumbsUp,
  change_requested: RotateCcw,
  due_soon: Clock,
  briefing_scheduled: CalendarClock,
}

export function NotificationBell() {
  const { profile } = useAuth()
  const { notifications, unreadCount } = useNotifications(profile?.id)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleClick = async (n: AppNotification) => {
    if (!n.read) await markNotificationRead(n.id)
    setOpen(false)
    if (n.entityType === 'task') navigate('/tarefas')
    else if (n.entityType === 'content') navigate('/social-media')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-slate-100 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <p className="text-sm font-semibold text-slate-700">Notificações</p>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsRead(notifications)}
                  className="text-xs text-brand-600 hover:text-brand-700"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-slate-400">Nenhuma notificação ainda.</p>
              ) : (
                notifications.slice(0, 30).map((n) => {
                  const Icon = TYPE_ICON[n.type]
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`flex w-full items-start gap-2.5 border-b border-slate-50 px-3 py-2.5 text-left last:border-0 hover:bg-slate-50 ${
                        n.read ? '' : 'bg-brand-50/40'
                      }`}
                    >
                      <Icon size={14} className="mt-0.5 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className={`text-sm ${n.read ? 'text-slate-600' : 'font-medium text-slate-800'}`}>{n.message}</p>
                        <p className="text-[11px] text-slate-400">
                          {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: ptBR }) : ''}
                        </p>
                      </div>
                      {!n.read && <span className="ml-auto mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
