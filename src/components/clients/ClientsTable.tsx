import { Building2, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import { CLIENT_STATUS_LABEL, type Client } from '../../types/client'
import type { AppUser } from '../../types'

const STATUS_COLOR: Record<Client['status'], string> = {
  active: 'bg-emerald-100 text-emerald-700',
  prospect: 'bg-blue-100 text-blue-700',
  paused: 'bg-amber-100 text-amber-700',
  churned: 'bg-red-100 text-red-700',
}

function ServiceBadge({ client }: { client: Client }) {
  const paidTraffic = !!client.modules?.paidTraffic
  const socialMedia = !!client.modules?.socialMedia
  if (paidTraffic && socialMedia) {
    return (
      <Badge className="bg-gradient-to-r from-blue-100 to-violet-100 text-blue-700">Ambos</Badge>
    )
  }
  if (paidTraffic) return <Badge className="bg-blue-100 text-blue-700">Tráfego</Badge>
  if (socialMedia) return <Badge className="bg-violet-100 text-violet-700">Social Media</Badge>
  return <span className="text-xs text-slate-400">—</span>
}

export function ClientsTable({
  clients,
  ownersByClientId,
  onRowClick,
}: {
  clients: Client[]
  ownersByClientId: Record<string, AppUser[]>
  onRowClick: (client: Client) => void
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <tr>
            <th className="w-10 py-3 pl-4"></th>
            <th className="py-3 pr-3 font-semibold">Nome</th>
            <th className="py-3 pr-3 font-semibold">Segmento</th>
            <th className="py-3 pr-3 font-semibold">Serviço</th>
            <th className="py-3 pr-3 font-semibold">Status</th>
            <th className="py-3 pr-3 font-semibold">Responsável</th>
            <th className="py-3 pr-3 font-semibold">Cidade</th>
            <th className="py-3 pr-4 font-semibold">Início</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const owners = ownersByClientId[client.id] ?? []
            return (
              <tr
                key={client.id}
                onClick={() => onRowClick(client)}
                className="cursor-pointer border-t border-slate-50 text-slate-700 transition-colors duration-150 ease-in-out hover:bg-slate-50"
              >
                <td className="py-2.5 pl-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-50 text-brand-500">
                    {client.logoUrl ? (
                      <img src={client.logoUrl} alt={client.companyName} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={14} />
                    )}
                  </div>
                </td>
                <td className="max-w-[220px] py-2.5 pr-3">
                  <p className="truncate font-medium text-slate-800">{client.companyName}</p>
                  {client.contactName && <p className="truncate text-xs text-slate-400">{client.contactName}</p>}
                </td>
                <td className="max-w-[140px] truncate py-2.5 pr-3 text-slate-500">{client.segment || '—'}</td>
                <td className="py-2.5 pr-3">
                  <ServiceBadge client={client} />
                </td>
                <td className="py-2.5 pr-3">
                  <Badge className={STATUS_COLOR[client.status]}>{CLIENT_STATUS_LABEL[client.status]}</Badge>
                </td>
                <td className="py-2.5 pr-3">
                  {owners.length > 0 ? (
                    <div className="flex -space-x-1.5">
                      {owners.slice(0, 3).map((o) => (
                        <div key={o.id} title={o.name} className="rounded-full ring-2 ring-white">
                          <Avatar name={o.name} photoURL={o.photoURL} size="xs" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="max-w-[120px] truncate py-2.5 pr-3 text-slate-500">
                  {client.city ? (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="shrink-0 text-slate-400" /> {client.city}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-2.5 pr-4 text-slate-500">
                  {client.contractStartDate ? format(client.contractStartDate.toDate(), 'dd MMM yyyy', { locale: ptBR }) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
