import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import { MEETING_TYPE_LABEL, MEETING_TYPE_BADGE, type Meeting } from '../../types'

/** Linha de reunião reusada tanto em /reunioes quanto na aba "Reuniões" da
 *  ficha do cliente. */
export function MeetingRow({
  meeting,
  clientName,
  participants,
  onClick,
}: {
  meeting: Meeting
  clientName?: string
  participants: { id: string; name: string; photoURL?: string }[]
  onClick: () => void
}) {
  const dateLabel = format(meeting.date.toDate(), 'dd/MM/yyyy', { locale: ptBR })
  const decisionsSnippet = meeting.decisions?.trim()

  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-xl border border-slate-100 bg-white p-4 text-left transition-colors duration-150 ease-in-out hover:bg-[#F8FAFC]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-700">
          {dateLabel}
          {meeting.time && ` às ${meeting.time}`}
        </span>
        <Badge className={MEETING_TYPE_BADGE[meeting.type]}>{MEETING_TYPE_LABEL[meeting.type]}</Badge>
        {clientName && <Badge className="bg-slate-100 text-slate-500">{clientName}</Badge>}
        {participants.length > 0 && (
          <div className="ml-auto flex items-center -space-x-1.5">
            {participants.slice(0, 5).map((p) => (
              <Avatar key={p.id} name={p.name} photoURL={p.photoURL} size="xs" />
            ))}
          </div>
        )}
      </div>
      {decisionsSnippet && <p className="truncate text-sm text-slate-500">📌 {decisionsSnippet}</p>}
    </button>
  )
}
