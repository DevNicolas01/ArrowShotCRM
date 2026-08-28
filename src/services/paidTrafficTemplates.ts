import { Timestamp } from 'firebase/firestore'
import { addBusinessDays } from 'date-fns'
import { createTask } from './taskService'
import { nextRecurrenceDate } from '../types/task'
import type { Client } from '../types/client'
import type { ChecklistItem, TaskRecurrence } from '../types/task'

const ONBOARDING_ITEMS = [
  'Coletar dados para contrato (nome, CNPJ, endereço)',
  'Criar pasta no Google Drive',
  'Compartilhar link da pasta no grupo do WhatsApp',
  'Criar grupo de WhatsApp com o cliente',
  'Adicionar responsáveis no grupo',
  'Elaborar e enviar contrato para assinatura',
  'Enviar mensagem de boas-vindas',
]

const BRIEFING_ITEMS = [
  'Enviar formulário de briefing ao cliente',
  'Agendar call de briefing',
  'Realizar call de briefing (gravar e salvar no Drive)',
  'Obter acesso ao Meta Ads (via Business Manager)',
  'Obter acesso ao Google Ads',
  'Solicitar acesso ao Tag Manager (ou criar novo)',
  'Configurar GTM: instalar código na LP, tags de remarketing e conversão',
  'Obter acesso ao Google Meu Negócio',
  'Conferir forma de pagamento nas plataformas',
]

const CAMPAIGN_PLANNING_ITEMS = [
  'Realizar benchmarking (biblioteca de anúncios + concorrentes)',
  'Salvar pesquisa no Drive do cliente',
  'Criar estratégia (apresentação no Canva ou mapa mental)',
  'Configurar contas de anúncios com nomenclaturas padrão',
  'Criar pixels e públicos',
  'Verificar domínio no Meta',
  'Realizar reunião de debriefing com o cliente',
  'Subir campanhas',
]

const RECURRING_TASKS: { title: string; recurrence: TaskRecurrence }[] = [
  { title: 'Gestor de Tráfego — Semanal', recurrence: { frequency: 'weekly', weekday: 1 } },
  { title: 'Gestor de Tráfego — Mensal', recurrence: { frequency: 'monthly', dayOfMonth: 1 } },
  { title: 'CS — Semanal', recurrence: { frequency: 'weekly', weekday: 5 } },
  { title: 'CS — Mensal', recurrence: { frequency: 'monthly', dayOfMonth: 1 } },
]

function toChecklist(items: string[]): ChecklistItem[] {
  return items.map((text) => ({ id: crypto.randomUUID(), text, done: false }))
}

/** Spawns the standard Tráfego Pago onboarding tasks (Onboarding, Briefing e
 *  Acessos, Planejamento de Campanhas) plus the first occurrence of each
 *  recurring task (Gestor de Tráfego / CS, semanal e mensal) for a freshly
 *  contracted client. `assigneeId` defaults to whoever is creating the client
 *  when no Tráfego owner was picked on the form. */
export async function createPaidTrafficTasks(
  client: Pick<Client, 'id' | 'companyName'>,
  userId: string,
  userName: string,
  assigneeId: string = userId
) {
  const dueDate = Timestamp.fromDate(addBusinessDays(new Date(), 5))

  await createTask(
    {
      title: `Onboarding — ${client.companyName}`,
      description: 'Checklist padrão de onboarding de Tráfego Pago.',
      clientId: client.id,
      assignedTo: assigneeId,
      dueDate,
      priority: 'high',
      status: 'todo',
      checklist: toChecklist(ONBOARDING_ITEMS),
      order: Date.now(),
    },
    userId,
    userName
  )

  await createTask(
    {
      title: `Briefing e Acessos — ${client.companyName}`,
      description: 'Checklist padrão de briefing e coleta de acessos de Tráfego Pago.',
      clientId: client.id,
      assignedTo: assigneeId,
      dueDate,
      priority: 'high',
      status: 'todo',
      checklist: toChecklist(BRIEFING_ITEMS),
      order: Date.now() + 1,
    },
    userId,
    userName
  )

  await createTask(
    {
      title: `Planejamento de Campanhas — ${client.companyName}`,
      description: 'Checklist padrão de planejamento e subida de campanhas.',
      clientId: client.id,
      assignedTo: assigneeId,
      dueDate,
      priority: 'high',
      status: 'todo',
      checklist: toChecklist(CAMPAIGN_PLANNING_ITEMS),
      order: Date.now() + 2,
    },
    userId,
    userName
  )

  for (const [i, { title, recurrence }] of RECURRING_TASKS.entries()) {
    await createTask(
      {
        title: `${title} — ${client.companyName}`,
        description: 'Tarefa recorrente. Ao concluir, use "Duplicar próxima ocorrência" no card para recriá-la.',
        clientId: client.id,
        assignedTo: assigneeId,
        dueDate: Timestamp.fromDate(nextRecurrenceDate(recurrence)),
        priority: 'normal',
        status: 'todo',
        checklist: [],
        order: Date.now() + 3 + i,
        recurrence,
      },
      userId,
      userName
    )
  }
}
