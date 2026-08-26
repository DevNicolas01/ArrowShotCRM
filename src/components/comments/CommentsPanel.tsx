import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Send } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useComments } from '../../hooks/useComments'
import { addComment } from '../../services/commentService'
import { Avatar } from '../ui/Avatar'
import { Spinner } from '../ui/FullPageSpinner'
import type { EntityType } from '../../types'

export function CommentsPanel({
  entityType,
  entityId,
  clientId,
}: {
  entityType: EntityType
  entityId: string
  clientId?: string
}) {
  const { profile } = useAuth()
  const { data: comments, loading } = useComments(entityType, entityId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!text.trim() || !profile) return
    setSending(true)
    try {
      await addComment({
        entityType,
        entityId,
        clientId,
        text: text.trim(),
        userId: profile.id,
        userName: profile.name,
        userPhotoURL: profile.photoURL,
      })
      setText('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {loading ? (
        <Spinner />
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum comentário ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar name={c.userName} photoURL={c.userPhotoURL} size="sm" />
              <div className="min-w-0 flex-1 rounded-lg bg-slate-50 px-3 py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-slate-700">{c.userName}</span>
                  <span className="text-[11px] text-slate-400">
                    {c.createdAt ? formatDistanceToNow(c.createdAt.toDate(), { addSuffix: true, locale: ptBR }) : '...'}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-700">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-slate-100 pt-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Escreva um comentário..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="rounded-lg bg-brand-600 p-2 text-white disabled:bg-brand-300"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
