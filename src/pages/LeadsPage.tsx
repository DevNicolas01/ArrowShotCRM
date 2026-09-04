import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useLeads } from '../hooks/useLeads'
import { useUsers } from '../hooks/useUsers'
import { useAuth } from '../context/AuthContext'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { LeadCard } from '../components/leads/LeadCard'
import { LeadFormModal } from '../components/leads/LeadFormModal'
import { LeadDrawer } from '../components/leads/LeadDrawer'
import { Button } from '../components/ui/Button'
import { moveLeadStatus } from '../services/leadService'
import { LEAD_STATUS_LABEL, LEAD_STATUS_ORDER, LEAD_STATUS_COLOR, type Lead, type LeadStatus } from '../types'


export function LeadsPage() {
  const { profile } = useAuth()
  const { data: leads } = useLeads()
  const { data: users } = useUsers()
  const [creating, setCreating] = useState(false)
  const [openLeadId, setOpenLeadId] = useState<string | null>(null)

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))
  const openLead = leads.find((l) => l.id === openLeadId) ?? null

  const columns = LEAD_STATUS_ORDER.map((s) => ({
    id: s,
    label: LEAD_STATUS_LABEL[s],
    accentColor: LEAD_STATUS_COLOR[s],
  }))

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-900">Leads</h1>
          <p className="text-[15px] text-[#64748B]">Pipeline de novos clientes</p>
        </div>
        <Button icon={<Plus size={14} />} onClick={() => setCreating(true)}>
          Novo lead
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard<Lead, LeadStatus>
          columns={columns}
          items={leads}
          getStatus={(l) => l.status}
          renderCard={(l) => (
            <LeadCard lead={l} assignee={l.assignedTo ? userMap[l.assignedTo] : undefined} onClick={() => setOpenLeadId(l.id)} />
          )}
          onMove={(lead, newStatus, newOrder) => {
            if (!profile) return
            moveLeadStatus(lead, newStatus, newOrder, profile.id, profile.name)
          }}
        />
      </div>

      <LeadFormModal open={creating} onClose={() => setCreating(false)} />
      <LeadDrawer key={`lead-${openLeadId ?? 'none'}`} lead={openLead} onClose={() => setOpenLeadId(null)} />
    </div>
  )
}
