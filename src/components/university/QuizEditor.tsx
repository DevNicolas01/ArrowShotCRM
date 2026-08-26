import { Plus, Trash2 } from 'lucide-react'
import type { QuizQuestion } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Field'

/** Admin-facing quiz author — add/edit/remove questions, each with 4 options
 *  and one marked as correct via a radio. */
export function QuizEditor({
  quiz,
  onChange,
}: {
  quiz: QuizQuestion[]
  onChange: (quiz: QuizQuestion[]) => void
}) {
  const addQuestion = () => {
    onChange([
      ...quiz,
      {
        id: crypto.randomUUID(),
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
      },
    ])
  }

  const updateQuestion = (id: string, patch: Partial<QuizQuestion>) => {
    onChange(quiz.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  const updateOption = (id: string, optionIndex: number, value: string) => {
    onChange(
      quiz.map((q) => (q.id === id ? { ...q, options: q.options.map((o, i) => (i === optionIndex ? value : o)) } : q))
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {quiz.map((q, qi) => (
        <div key={q.id} className="rounded-lg border border-slate-200 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Pergunta {qi + 1}</span>
            <button
              onClick={() => onChange(quiz.filter((item) => item.id !== q.id))}
              className="ml-auto text-slate-300 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <Input
            value={q.question}
            onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
            placeholder="Enunciado da pergunta"
            className="mb-2"
          />
          <div className="flex flex-col gap-1.5">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={q.correctIndex === oi}
                  onChange={() => updateQuestion(q.id, { correctIndex: oi })}
                  className="h-4 w-4 shrink-0 border-slate-300 text-brand-600 focus:ring-brand-400"
                  title="Marcar como resposta correta"
                />
                <Input
                  value={opt}
                  onChange={(e) => updateOption(q.id, oi, e.target.value)}
                  placeholder={`Opção ${oi + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addQuestion}>
        Adicionar pergunta
      </Button>
    </div>
  )
}
