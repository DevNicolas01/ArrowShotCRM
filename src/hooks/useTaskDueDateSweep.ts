import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useAllTasks } from './useTasks'
import { useClients } from './useClients'
import { runTaskDueDateSweep } from '../services/taskService'

/** Mounted once in AppLayout — client-side stand-in for a backend cron
 *  (this project has no Cloud Functions): whichever teammate's browser has
 *  the app open runs the "tarefa atrasada" / "lembrete" sweep once per
 *  session. Idempotent per task (see overdueNotifiedAt/reminderNotifiedAt),
 *  so running it from multiple open sessions never double-notifies. */
export function useTaskDueDateSweep() {
  const { profile } = useAuth()
  const { data: tasks } = useAllTasks()
  const { data: clients } = useClients()
  const ranRef = useRef(false)

  useEffect(() => {
    if (!profile || tasks.length === 0 || ranRef.current) return
    ranRef.current = true
    const clientNameById = Object.fromEntries(clients.map((c) => [c.id, c.companyName]))
    runTaskDueDateSweep(tasks, clientNameById, profile.id).catch((err) => console.error('Falha na varredura de prazos de tarefas', err))
  }, [profile, tasks, clients])
}
