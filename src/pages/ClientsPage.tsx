import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useClients } from '../hooks/useClients'
import { useUsers } from '../hooks/useUsers'
import { ClientCard } from '../components/clients/ClientCard'
import { ClientFormModal } from '../components/clients/ClientFormModal'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { CLIENT_STATUS_LABEL, getClientOwnerIds } from '../types/client'

export function ClientsPage() {
  const navigate = useNavigate()
  const { data: clients, loading } = useClients()
  const { data: users } = useUsers()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [creating, setCreating] = useState(false)

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (search && !c.companyName.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter && c.status !== statusFilter) return false
      return true
    })
  }, [clients, search, statusFilter])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Clientes</h1>
          <p className="text-sm text-slate-400">{filtered.length} cliente(s)</p>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setCreating(true)}>
          Novo cliente
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm">
          <option value="">Todos os status</option>
          {Object.entries(CLIENT_STATUS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState title="Nenhum cliente encontrado" description="Ajuste os filtros ou cadastre um novo cliente." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ClientCard
              key={c.id}
              client={c}
              owners={getClientOwnerIds(c).map((id) => userMap[id]).filter(Boolean)}
              onClick={() => navigate(`/clientes/${c.id}`)}
            />
          ))}
        </div>
      )}

      <ClientFormModal open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
