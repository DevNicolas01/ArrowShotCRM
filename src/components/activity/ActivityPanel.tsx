import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { History } from 'lucide-react'
import { useActivities } from '../../hooks/useActivities'
import { Spinner } from '../ui/FullPageSpinner'
import type { EntityType } from '../../types'

export function ActivityPanel({ entityType, entityId }: { entityType: EntityType; entityId: string }) {
  const { data: activities, loading } = useActivities(entityType, entityId)

  if (loading) return <Spinner />
  if (activities.length === 0) {
    return <p className="text-sm text-slate-400">Nenhuma atividade registrada ainda.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {activities.map((a) => (
        <li key={a.id} className="flex gap-2.5 text-sm">
          <History size={14} className="mt-0.5 shrink-0 text-slate-300" />
          <p className="text-slate-600">
            <span className="font-medium text-slate-800">{a.userName}</span> {a.message}
            <span className="ml-1.5 text-xs text-slate-400">
              {a.createdAt ? formatDistanceToNow(a.createdAt.toDate(), { addSuffix: true, locale: ptBR }) : ''}
            </span>
          </p>
        </li>
      ))}
    </ul>
  )
}
