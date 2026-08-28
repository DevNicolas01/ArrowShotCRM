import { Building2, MapPin } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import { CLIENT_PACKAGE_LABEL, CLIENT_STATUS_LABEL, type Client } from '../../types/client'
import type { AppUser } from '../../types'

const STATUS_COLOR: Record<Client['status'], string> = {
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  churned: 'bg-slate-200 text-slate-500',
  prospect: 'bg-blue-100 text-blue-700',
}

export function ClientCard({
  client,
  owners,
  onClick,
}: {
  client: Client
  owners?: AppUser[]
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-brand-500">
            {client.logoUrl ? (
              <img src={client.logoUrl} alt={client.companyName} className="h-full w-full object-cover" />
            ) : (
              <Building2 size={16} />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{client.companyName}</p>
            {client.contactName && <p className="truncate text-xs text-slate-400">{client.contactName}</p>}
          </div>
        </div>
        {owners && owners.length > 0 && (
          <div className="flex shrink-0 -space-x-1.5">
            {owners.map((o) => (
              <div key={o.id} className="rounded-full ring-2 ring-white">
                <Avatar name={o.name} photoURL={o.photoURL} size="xs" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge className={STATUS_COLOR[client.status]}>{CLIENT_STATUS_LABEL[client.status]}</Badge>
        {client.package && <Badge className="bg-brand-50 text-brand-600">{CLIENT_PACKAGE_LABEL[client.package]}</Badge>}
        {client.segment && <Badge className="bg-slate-100 text-slate-500">{client.segment}</Badge>}
      </div>

      {client.city && (
        <p className="flex items-center gap-1 text-xs text-slate-400">
          <MapPin size={12} /> {client.city}
        </p>
      )}
    </button>
  )
}
