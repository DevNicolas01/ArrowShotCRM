import { useState } from 'react'
import { Check, X } from 'lucide-react'
import type { QuizQuestion } from '../../types'
import { Button } from '../ui/Button'

export function QuizBlock({
  quiz,
  onSubmit,
}: {
  quiz: QuizQuestion[]
  onSubmit: (score: number) => void
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  if (quiz.length === 0) return null

  const allAnswered = quiz.every((q) => answers[q.id] !== undefined)
  const score = submitted
    ? Math.round((quiz.filter((q) => answers[q.id] === q.correctIndex).length / quiz.length) * 100)
    : null

  const handleSubmit = () => {
    if (!allAnswered) return
    setSubmitted(true)
    const finalScore = Math.round(
      (quiz.filter((q) => answers[q.id] === q.correctIndex).length / quiz.length) * 100
    )
    onSubmit(finalScore)
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Quiz</p>
        {submitted && (
          <span className="text-xs font-medium text-slate-500">Nota: {score}%</span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {quiz.map((q, qi) => (
          <div key={q.id}>
            <p className="mb-1.5 text-sm text-slate-700">
              {qi + 1}. {q.question}
            </p>
            <div className="flex flex-col gap-1">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi
                const isCorrect = oi === q.correctIndex
                let style = 'border-slate-200 hover:bg-slate-50'
                if (submitted) {
                  if (isCorrect) style = 'border-emerald-300 bg-emerald-50'
                  else if (selected) style = 'border-red-300 bg-red-50'
                  else style = 'border-slate-100 opacity-60'
                } else if (selected) {
                  style = 'border-brand-400 bg-brand-50'
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm text-slate-700 transition-colors disabled:cursor-default ${style}`}
                  >
                    {opt}
                    {submitted && isCorrect && <Check size={14} className="shrink-0 text-emerald-600" />}
                    {submitted && selected && !isCorrect && <X size={14} className="shrink-0 text-red-500" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted && (
        <Button className="mt-4" size="sm" onClick={handleSubmit} disabled={!allAnswered}>
          Enviar respostas
        </Button>
      )}
    </div>
  )
}
