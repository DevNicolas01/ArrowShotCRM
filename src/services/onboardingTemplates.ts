import { Timestamp } from 'firebase/firestore'
import { addBusinessDays } from 'date-fns'
import { createTask } from './taskService'
import type { Client } from '../types/client'
import type { ChecklistItem } from '../types/task'

/** Straight from the Social Media playbook, section 10 — "Checklist de
 *  Ativação". Meta: cliente ativado e primeiro lote publicado em até 5 dias
 *  úteis após o onboarding. */
const ACTIVATION_ITEMS = [
  'Dia 1 — Reunião de onboarding realizada',
  'Dia 1 — Briefing preenchido e salvo no Drive',
  'Dia 1 — Pasta do cliente criada no Drive',
  'Dia 1 — Catálogo de estilo escolhido pelo cliente',
  'Dia 1 — Acesso ao Instagram liberado (Editor)',
  'Dia 1 — Drive compartilhado com o cliente',
  'Dia 1–2 — Bio e destaques configurados',
  'Dia 1–2 — Tarefa recorrente criada no CRM',
  'Dia 2–3 — Primeiro lote de conteúdo produzido',
  'Dia 4 — Lote enviado para aprovação',
  'Dia 4–5 — Ajustes pós-aprovação aplicados',
  'Dia 5 — Conteúdo agendado na Meta Business Suite',
  'Dia 5 — Primeiro post publicado, cliente notificado',
]

/** Section 8 — "Lista de Materiais Necessários", only the Obrigatórios
 *  (production doesn't start without these). */
const MATERIALS_ITEMS = [
  'Logo fundo transparente (PNG, alta resolução)',
  'Logo fundo branco (JPG, alta resolução)',
  'Cores da marca (código hex ou referência)',
  'Fotos de obras antes/depois (mín. 10, mín. 1080px)',
  'Dados da empresa (nº de obras, anos de atuação, cidades, certificações)',
  'WhatsApp comercial com link',
  'Foto de perfil (logo ou foto da equipe, quadrada)',
  'Fotos para capas dos destaques',
]

function toChecklist(items: string[]): ChecklistItem[] {
  return items.map((text) => ({ id: crypto.randomUUID(), text, done: false }))
}

/** Spawns the two standard onboarding tasks (Ativação + Materiais) for a
 *  freshly created client, mirroring the agency's documented Social Media
 *  playbook instead of starting every client from a blank task list. */
export async function createOnboardingTasks(
  client: Pick<Client, 'id' | 'companyName'>,
  userId: string,
  userName: string
) {
  const dueDate = Timestamp.fromDate(addBusinessDays(new Date(), 5))

  await createTask(
    {
      title: `Ativação — ${client.companyName}`,
      description: 'Checklist padrão de ativação de cliente novo (playbook de Social Media).',
      clientId: client.id,
      assignedTo: userId,
      dueDate,
      priority: 'high',
      status: 'todo',
      checklist: toChecklist(ACTIVATION_ITEMS),
      order: Date.now(),
    },
    userId,
    userName
  )

  await createTask(
    {
      title: `Materiais — ${client.companyName}`,
      description: 'Materiais obrigatórios a solicitar ao cliente antes de iniciar a produção.',
      clientId: client.id,
      assignedTo: userId,
      dueDate,
      priority: 'high',
      status: 'todo',
      checklist: toChecklist(MATERIALS_ITEMS),
      order: Date.now() + 1,
    },
    userId,
    userName
  )
}
