import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarClock, Camera, ThumbsUp, Briefcase, Music2, Share2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { CONTENT_PILLAR_LABEL, CONTENT_TYPE_LABEL, type Content } from '../../types/content'
import type { AppUser, Client } from '../../types'

const PLATFORM_ICON = {
  instagram: Camera,
  facebook: ThumbsUp,
  linkedin: Briefcase,
  tiktok: Music2,
  other: Share2,
}

const PILLAR_COLOR: Record<NonNullable<Content['pillar']>, string> = {
  dor_solucao: 'bg-red-50 text-red-600',
  autoridade: 'bg-brand-50 text-brand-600',
  prova_social: 'bg-emerald-50 text-emerald-600',
  educativo: 'bg-amber-50 text-amber-600',
  bastidores: 'bg-fuchsia-50 text-fuchsia-600',
}

export function ContentCard({
  content,
  client,
  assignee,
  onClick,
}: {
  content: Content
  client?: Client
  assignee?: AppUser
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: content.id })
  const PlatformIcon = PLATFORM_ICON[content.platform]
  const date = content.scheduledDate?.toDate()

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
      {client && <p className="mb-1 truncate text-[11px] font-medium text-brand-500">{client.companyName}</p>}
      <p className="text-sm font-medium text-slate-800">{content.title}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge className="bg-slate-100 text-slate-500">
          <PlatformIcon size={11} /> {CONTENT_TYPE_LABEL[content.type]}
        </Badge>
        {content.pillar && <Badge className={PILLAR_COLOR[content.pillar]}>{CONTENT_PILLAR_LABEL[content.pillar]}</Badge>}
        {date && (
          <Badge className="bg-slate-100 text-slate-500">
            <CalendarClock size={11} />
            {format(date, 'dd MMM', { locale: ptBR })}
            {content.scheduledTime ? ` ${content.scheduledTime}` : ''}
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
