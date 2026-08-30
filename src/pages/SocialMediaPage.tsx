import { useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { useAllContents } from '../hooks/useContents'
import { useClients } from '../hooks/useClients'
import { useUsers } from '../hooks/useUsers'
import { useAuth } from '../context/AuthContext'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { ContentCard } from '../components/content/ContentCard'
import { ContentDrawer } from '../components/content/ContentDrawer'
import { ContentFormModal } from '../components/content/ContentFormModal'
import { GeneratePautaModal } from '../components/content/GeneratePautaModal'
import { Button } from '../components/ui/Button'
import { moveContentStatus } from '../services/contentService'
import {
  CONTENT_STATUS_LABEL,
  CONTENT_STATUS_ORDER,
  CONTENT_FORMAT_LABEL,
  type Content,
  type ContentStatus,
  type ContentType,
} from '../types/content'

const ACCENTS: Record<ContentStatus, string> = {
  ideas: 'bg-slate-400',
  production: 'bg-blue-500',
  review: 'bg-amber-500',
  waiting_client: 'bg-fuchsia-500',
  approved: 'bg-teal-500',
  scheduled: 'bg-indigo-500',
  published: 'bg-emerald-500',
  cancelled: 'bg-red-400',
}

const FORMAT_FILTER_OPTIONS: ContentType[] = ['post', 'reels', 'story']

export function SocialMediaPage() {
  const { profile } = useAuth()
  const { data: contents } = useAllContents()
  const { data: clients } = useClients()
  const { data: users } = useUsers()
  const [openContentId, setOpenContentId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [clientFilter, setClientFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [formatFilter, setFormatFilter] = useState('')

  const openContent = contents.find((c) => c.id === openContentId) ?? null
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]))
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))
  const visibleContents = contents.filter((c) => {
    if (clientFilter && c.clientId !== clientFilter) return false
    if (assigneeFilter && c.assignedTo !== assigneeFilter) return false
    if (formatFilter && c.type !== formatFilter) return false
    return true
  })

  const columns = CONTENT_STATUS_ORDER.map((s) => ({ id: s, label: CONTENT_STATUS_LABEL[s], accent: ACCENTS[s] }))

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Social Media</h1>
          <p className="text-sm text-slate-400">Fluxo de produção de conteúdo, da ideia à publicação.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          >
            <option value="">Todos os clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          >
            <option value="">Todos os responsáveis</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
          >
            <option value="">Todos os formatos</option>
            {FORMAT_FILTER_OPTIONS.map((t) => (
              <option key={t} value={t}>{CONTENT_FORMAT_LABEL[t]}</option>
            ))}
          </select>
          <Button variant="secondary" icon={<Sparkles size={14} />} onClick={() => setGenerating(true)}>
            Gerar pauta
          </Button>
          <Button icon={<Plus size={14} />} onClick={() => setCreating(true)}>
            Novo conteúdo
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard<Content, ContentStatus>
          columns={columns}
          items={visibleContents}
          getStatus={(c) => c.status}
          renderCard={(c) => (
            <ContentCard
              content={c}
              client={clientMap[c.clientId]}
              assignee={c.assignedTo ? userMap[c.assignedTo] : undefined}
              onClick={() => setOpenContentId(c.id)}
            />
          )}
          onMove={(content, newStatus, newOrder) => {
            if (!profile) return
            moveContentStatus(content, newStatus, newOrder, profile.id, profile.name)
          }}
        />
      </div>

      <ContentDrawer key={`content-${openContentId ?? 'none'}`} content={openContent} onClose={() => setOpenContentId(null)} />
      <ContentFormModal open={creating} onClose={() => setCreating(false)} defaultClientId={clientFilter || undefined} />
      <GeneratePautaModal open={generating} onClose={() => setGenerating(false)} />
    </div>
  )
}
