import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Field, Input, Textarea } from '../ui/Field'
import { Button } from '../ui/Button'
import { ChecklistEditor } from '../tasks/ChecklistEditor'
import { QuizEditor } from './QuizEditor'
import { useAuth } from '../../context/AuthContext'
import { createModule, updateModule } from '../../services/moduleService'
import type { ChecklistItem, Module, QuizQuestion } from '../../types'

export function ModuleFormModal({
  open,
  onClose,
  trailId,
  module,
  nextOrder,
}: {
  open: boolean
  onClose: () => void
  trailId: string
  /** When set, edits this module instead of creating a new one. */
  module?: Module | null
  /** Suggested `order` for a new module (ignored when editing). */
  nextOrder?: number
}) {
  const { profile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [materialUrl, setMaterialUrl] = useState('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(module?.title ?? '')
    setDescription(module?.description ?? '')
    setContent(module?.content ?? '')
    setVideoUrl(module?.videoUrl ?? '')
    setMaterialUrl(module?.materialUrl ?? '')
    setChecklist(module?.checklist ?? [])
    setQuiz(module?.quiz ?? [])
  }, [open, module])

  const handleSubmit = async () => {
    if (!title.trim() || !profile) return
    setSaving(true)
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        content,
        videoUrl: videoUrl.trim() || undefined,
        materialUrl: materialUrl.trim() || undefined,
        checklist,
        quiz,
      }
      if (module) {
        await updateModule(module.id, data, profile.id)
        toast.success('Módulo atualizado')
      } else {
        await createModule({ ...data, trailId, order: nextOrder ?? 0 }, profile.id)
        toast.success('Módulo criado')
      }
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar módulo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={module ? 'Editar módulo' : 'Novo módulo'} width="max-w-2xl">
      <div className="flex flex-col gap-3">
        <Field label="Título" required>
          <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Descrição">
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Conteúdo (markdown)">
          <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} className="font-mono" />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Link do vídeo (YouTube, opcional)">
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
          </Field>
          <Field label="Material de apoio (PDF/URL, opcional)">
            <Input value={materialUrl} onChange={(e) => setMaterialUrl(e.target.value)} placeholder="https://..." />
          </Field>
        </div>

        <Field label="Checklist de aprendizado">
          <ChecklistEditor items={checklist} onChange={setChecklist} />
        </Field>

        <Field label="Quiz">
          <QuizEditor quiz={quiz} onChange={setQuiz} />
        </Field>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={saving} disabled={!title.trim()}>
            {module ? 'Salvar' : 'Criar módulo'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
