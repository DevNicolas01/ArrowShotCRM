import { Timestamp } from 'firebase/firestore'
import { addBusinessDays } from 'date-fns'
import { createTask } from './taskService'
import { nextRecurrenceDate } from '../types/task'
import type { Client } from '../types/client'
import type { AppUser } from '../types/user'
import type { ChecklistItem, TaskBoard, TaskRecurrence } from '../types/task'

function toChecklist(items: string[]): ChecklistItem[] {
  return items.map((text) => ({ id: crypto.randomUUID(), text, done: false }))
}

/** Resolves "Responsável: Janilson/Ciane" from the templates below to a real
 *  uid by matching against the team roster (case-insensitive, matches on
 *  first name). Returns undefined — task stays unassigned — if that person
 *  doesn't have a CRM account yet (see README: accounts are created manually
 *  in the Firebase Console). */
function findUserIdByName(users: AppUser[], name: string): string | undefined {
  return users.find((u) => u.name.toLowerCase().includes(name.toLowerCase()))?.id
}

function onboardingItems(companyName: string): string[] {
  return [
    'Coletar dados para contrato (nome completo, CNPJ, endereço)',
    'Elaborar contrato usando modelo padrão',
    'Enviar contrato para assinatura (Autentique)',
    'Criar pasta no Google Drive para o cliente',
    'Criar grupo de WhatsApp com o cliente',
    'Adicionar todos os responsáveis no grupo (gestor + CS + cliente)',
    'Colocar o cliente como ADM do grupo',
    `Renomear o grupo para "Arrow Shot & ${companyName}"`,
    'Compartilhar link da pasta Drive no grupo',
    'Enviar mensagem de boas-vindas no grupo',
    'Agendar reunião de briefing e acessos',
  ]
}

const BRIEFING_ACESSOS_ITEMS = [
  'Enviar formulário de briefing ao cliente antes da call',
  'Realizar call de briefing (gravar a reunião)',
  'Salvar gravação na pasta Drive do cliente',
  'Preencher briefing na plataforma durante ou após a call',
  'Obter acesso ao Meta Ads via Business Manager',
  'Obter acesso ao Google Ads',
  'Obter acesso ao Tag Manager (ou criar novo se não existir)',
  'Instalar código GTM na LP/site do cliente',
  'Instalar tag de remarketing no GTM',
  'Instalar tags de conversão no GTM',
  'Obter acesso ao Google Meu Negócio',
  'Conferir forma de pagamento no Meta Ads',
  'Conferir forma de pagamento no Google Ads',
  'Registrar todos os acessos na aba "Acessos" da ficha do cliente',
]

const PLANEJAMENTO_CAMPANHAS_ITEMS = [
  'Realizar benchmarking (biblioteca de anúncios + concorrentes + outros canais)',
  'Salvar pesquisa de benchmarking na pasta Drive do cliente',
  'Criar estratégia (apresentação no Canva ou mapa mental no Whimsical)',
  'Configurar contas de anúncios com nomenclaturas padrão da agência',
  'Criar pixel no gerenciador de negócios',
  'Verificar domínio no Meta',
  'Criar públicos (visitantes, engajamento, lista de clientes, lookalike)',
  'Realizar reunião de debriefing com o cliente (apresentar estratégia)',
  'Subir campanhas',
  'Confirmar que campanhas estão no ar',
]

const TRAFEGO_SEMANAL_ITEMS = [
  'Verificar desempenho das campanhas Meta Ads',
  'Verificar desempenho das campanhas Google Ads',
  'Identificar anúncios com baixo desempenho e pausar se necessário',
  'Ajustar orçamentos se necessário',
  'Verificar se há leads chegando corretamente',
  'Registrar observações relevantes da semana',
]

const TRAFEGO_MENSAL_ITEMS = [
  'Análise completa de resultados do mês (Meta + Google)',
  'Identificar melhores e piores anúncios do mês',
  'Definir estratégia e ajustes para o próximo mês',
  'Atualizar planejamento de campanhas na plataforma',
  'Renovar ou criar novos criativos se necessário',
  'Registrar conclusões do mês na ficha do cliente',
]

const CS_SEMANAL_ITEMS = [
  'Verificar se há mensagens sem resposta no grupo do WhatsApp do cliente',
  'Enviar atualização semanal de progresso ao cliente',
  'Verificar se há tarefas atrasadas vinculadas ao cliente',
  'Registrar qualquer feedback ou solicitação do cliente',
]

const CS_MENSAL_ITEMS = [
  'Preparar relatório mensal do cliente',
  'Enviar relatório ao cliente',
  'Agendar reunião mensal de resultado se necessário',
  'Verificar satisfação do cliente (NPS)',
  'Registrar status do cliente (ativo, risco de churn, expansão)',
  'Confirmar pagamento do mês',
]

async function createOnboardingTask(
  client: Pick<Client, 'id' | 'companyName'>,
  userId: string,
  userName: string,
  assigneeId: string | undefined,
  order: number
) {
  await createTask(
    {
      title: `Onboarding — ${client.companyName}`,
      description: 'Checklist padrão de onboarding de cliente novo.',
      clientId: client.id,
      assignedTo: assigneeId,
      dueDate: Timestamp.fromDate(addBusinessDays(new Date(), 5)),
      priority: 'high',
      status: 'onboarding',
      board: 'onboarding',
      checklist: toChecklist(onboardingItems(client.companyName)),
      order,
    },
    userId,
    userName
  )
}

async function createRecurringTask(
  client: Pick<Client, 'id' | 'companyName'>,
  userId: string,
  userName: string,
  title: string,
  recurrence: TaskRecurrence,
  items: string[],
  assigneeId: string | undefined,
  order: number,
  board: TaskBoard
) {
  await createTask(
    {
      title: `${title} — ${client.companyName}`,
      description: 'Tarefa recorrente. Ao concluir, use "Duplicar próxima ocorrência" no card para recriá-la.',
      clientId: client.id,
      assignedTo: assigneeId,
      dueDate: Timestamp.fromDate(nextRecurrenceDate(recurrence)),
      priority: 'normal',
      status: 'todo',
      board,
      checklist: toChecklist(items),
      order,
      recurrence,
    },
    userId,
    userName
  )
}

/** Onboarding + CS Semanal + CS Mensal — o subconjunto que também se aplica
 *  a um cliente só de Social Media (sem Tráfego Pago), já que nenhuma delas
 *  é específica de tráfego. */
export async function createSharedOnboardingTasks(
  client: Pick<Client, 'id' | 'companyName'>,
  userId: string,
  userName: string,
  users: AppUser[]
) {
  const janilsonId = findUserIdByName(users, 'Janilson')
  const base = Date.now()

  await createOnboardingTask(client, userId, userName, janilsonId, base)
  await createRecurringTask(
    client, userId, userName,
    'CS — Semanal', { frequency: 'weekly', weekday: 5 }, CS_SEMANAL_ITEMS, janilsonId, base + 1, 'cs'
  )
  await createRecurringTask(
    client, userId, userName,
    'CS — Mensal', { frequency: 'monthly', dayOfMonth: 1 }, CS_MENSAL_ITEMS, janilsonId, base + 2, 'cs'
  )
}

/** Full Tráfego Pago task set for a freshly contracted client: Onboarding,
 *  Briefing e Acessos, Planejamento de Campanhas, plus the first occurrence
 *  of the 4 recurring tasks (Gestor de Tráfego / CS, semanal e mensal). */
export async function createPaidTrafficTasks(
  client: Pick<Client, 'id' | 'companyName'>,
  userId: string,
  userName: string,
  users: AppUser[]
) {
  const janilsonId = findUserIdByName(users, 'Janilson')
  const cianeId = findUserIdByName(users, 'Ciane')
  const base = Date.now()

  await createOnboardingTask(client, userId, userName, janilsonId, base)

  await createTask(
    {
      title: `Briefing e Acessos — ${client.companyName}`,
      description: 'Checklist padrão de briefing e coleta de acessos de Tráfego Pago.',
      clientId: client.id,
      assignedTo: janilsonId,
      dueDate: Timestamp.fromDate(addBusinessDays(new Date(), 5)),
      priority: 'high',
      status: 'briefing',
      board: 'onboarding',
      checklist: toChecklist(BRIEFING_ACESSOS_ITEMS),
      order: base + 1,
    },
    userId,
    userName
  )

  await createTask(
    {
      title: `Planejamento de Campanhas — ${client.companyName}`,
      description: 'Checklist padrão de planejamento e subida de campanhas.',
      clientId: client.id,
      assignedTo: cianeId,
      dueDate: Timestamp.fromDate(addBusinessDays(new Date(), 5)),
      priority: 'high',
      status: 'planning',
      board: 'onboarding',
      checklist: toChecklist(PLANEJAMENTO_CAMPANHAS_ITEMS),
      order: base + 2,
    },
    userId,
    userName
  )

  await createRecurringTask(
    client, userId, userName,
    'Gestor de Tráfego — Semanal', { frequency: 'weekly', weekday: 1 }, TRAFEGO_SEMANAL_ITEMS, cianeId, base + 3, 'paid_traffic'
  )
  await createRecurringTask(
    client, userId, userName,
    'Gestor de Tráfego — Mensal', { frequency: 'monthly', dayOfMonth: 1 }, TRAFEGO_MENSAL_ITEMS, cianeId, base + 4, 'paid_traffic'
  )
  await createRecurringTask(
    client, userId, userName,
    'CS — Semanal', { frequency: 'weekly', weekday: 5 }, CS_SEMANAL_ITEMS, janilsonId, base + 5, 'cs'
  )
  await createRecurringTask(
    client, userId, userName,
    'CS — Mensal', { frequency: 'monthly', dayOfMonth: 1 }, CS_MENSAL_ITEMS, janilsonId, base + 6, 'cs'
  )
}
