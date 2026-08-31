import { createTask } from './taskService'
import type { Client } from '../types/client'
import type { AppUser } from '../types/user'
import type { ChecklistItem, TaskPriority, TaskRecurrence, WorkflowStepKey } from '../types/task'

/** Resolves "Responsável: Janilson/Ciane" from the templates below to a real
 *  uid by matching against the team roster (case-insensitive, matches on
 *  first name). Returns undefined — task stays unassigned — if that person
 *  doesn't have a CRM account yet (see README: accounts are created manually
 *  in the Firebase Console). */
function findUserIdByName(users: AppUser[], name: string): string | undefined {
  return users.find((u) => u.name.toLowerCase().includes(name.toLowerCase()))?.id
}

function toChecklist(items: string[]): ChecklistItem[] {
  return items.map((text) => ({ id: crypto.randomUUID(), text, done: false }))
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

/** Straight from the Social Media playbook, section 10 ("Checklist de
 *  Ativação") plus section 8 ("Lista de Materiais Necessários", só os
 *  obrigatórios) — juntas na única tarefa de ativação da nova sequência. */
const ATIVACAO_SOCIAL_MEDIA_ITEMS = [
  'Reunião de onboarding realizada',
  'Briefing preenchido e salvo no Drive',
  'Pasta do cliente criada no Drive',
  'Catálogo de estilo escolhido pelo cliente',
  'Acesso ao Instagram liberado (Editor)',
  'Drive compartilhado com o cliente',
  'Bio e destaques configurados',
  'Logo fundo transparente e fundo branco (alta resolução)',
  'Cores da marca (código hex ou referência)',
  'Fotos de obras antes/depois (mín. 10, mín. 1080px)',
  'Dados da empresa (nº de obras, anos de atuação, cidades, certificações)',
  'WhatsApp comercial com link',
  'Foto de perfil e fotos para capas dos destaques',
]

const PRODUCAO_CONTEUDO_ITEMS = [
  'Revisar calendário/pauta de conteúdo da semana',
  'Produzir os criativos (posts, reels, stories) planejados',
  'Escrever legendas e CTAs de cada peça',
  'Selecionar hashtags e marcações',
  'Organizar os arquivos finais na pasta do cliente',
]

const APROVACAO_CONTEUDO_ITEMS = [
  'Enviar lote de conteúdo da semana para aprovação do cliente',
  'Acompanhar retorno e prazo de aprovação',
  'Aplicar ajustes solicitados pelo cliente',
  'Confirmar aprovação final de cada peça',
  'Agendar publicação dos conteúdos aprovados',
]

interface StepDef {
  title: (companyName: string) => string
  description: string
  checklist: string[] | ((companyName: string) => string[])
  priority: TaskPriority
  /** 'creator' assigns to whoever triggered the step; a name assigns via
   *  findUserIdByName (falls back to unassigned if nobody matches yet). */
  assignee: 'creator' | 'Janilson' | 'Ciane'
  recurrence?: TaskRecurrence
}

const STEP_DEFS: Record<WorkflowStepKey, StepDef> = {
  pt_onboarding: {
    title: (name) => `Onboarding — ${name}`,
    description: 'Checklist padrão de onboarding de cliente novo.',
    checklist: onboardingItems,
    priority: 'high',
    assignee: 'Janilson',
  },
  pt_briefing: {
    title: (name) => `Briefing e Acessos — ${name}`,
    description: 'Checklist padrão de briefing e coleta de acessos de Tráfego Pago.',
    checklist: BRIEFING_ACESSOS_ITEMS,
    priority: 'high',
    assignee: 'Janilson',
  },
  pt_planning: {
    title: (name) => `Planejamento de Campanhas — ${name}`,
    description: 'Checklist padrão de planejamento e subida de campanhas.',
    checklist: PLANEJAMENTO_CAMPANHAS_ITEMS,
    priority: 'high',
    assignee: 'Ciane',
  },
  pt_trafego_semanal: {
    title: (name) => `Gestor de Tráfego — Semanal — ${name}`,
    description: 'Tarefa recorrente. Ao concluir, use "Duplicar próxima ocorrência" no card para recriá-la.',
    checklist: TRAFEGO_SEMANAL_ITEMS,
    priority: 'normal',
    assignee: 'Ciane',
    recurrence: { frequency: 'weekly', weekday: 1 },
  },
  pt_trafego_mensal: {
    title: (name) => `Gestor de Tráfego — Mensal — ${name}`,
    description: 'Tarefa recorrente. Ao concluir, use "Duplicar próxima ocorrência" no card para recriá-la.',
    checklist: TRAFEGO_MENSAL_ITEMS,
    priority: 'normal',
    assignee: 'Ciane',
    recurrence: { frequency: 'monthly', dayOfMonth: 1 },
  },
  pt_cs_semanal: {
    title: (name) => `CS — Semanal — ${name}`,
    description: 'Tarefa recorrente. Ao concluir, use "Duplicar próxima ocorrência" no card para recriá-la.',
    checklist: CS_SEMANAL_ITEMS,
    priority: 'normal',
    assignee: 'Janilson',
    recurrence: { frequency: 'weekly', weekday: 5 },
  },
  pt_cs_mensal: {
    title: (name) => `CS — Mensal — ${name}`,
    description: 'Tarefa recorrente. Ao concluir, use "Duplicar próxima ocorrência" no card para recriá-la.',
    checklist: CS_MENSAL_ITEMS,
    priority: 'normal',
    assignee: 'Janilson',
    recurrence: { frequency: 'monthly', dayOfMonth: 1 },
  },
  sm_ativacao: {
    title: (name) => `Ativação de Social Media — ${name}`,
    description: 'Checklist padrão de ativação de cliente novo (playbook de Social Media).',
    checklist: ATIVACAO_SOCIAL_MEDIA_ITEMS,
    priority: 'high',
    assignee: 'creator',
  },
  sm_producao: {
    title: (name) => `Produção de Conteúdo — ${name}`,
    description: 'Tarefa recorrente. Ao concluir, use "Duplicar próxima ocorrência" no card para recriá-la.',
    checklist: PRODUCAO_CONTEUDO_ITEMS,
    priority: 'normal',
    assignee: 'creator',
    recurrence: { frequency: 'weekly', weekday: 1 },
  },
  sm_aprovacao: {
    title: (name) => `Aprovação de Conteúdo — ${name}`,
    description: 'Tarefa recorrente. Ao concluir, use "Duplicar próxima ocorrência" no card para recriá-la.',
    checklist: APROVACAO_CONTEUDO_ITEMS,
    priority: 'normal',
    assignee: 'creator',
    recurrence: { frequency: 'weekly', weekday: 3 },
  },
  sm_cs_semanal: {
    title: (name) => `CS — Semanal — ${name}`,
    description: 'Tarefa recorrente. Ao concluir, use "Duplicar próxima ocorrência" no card para recriá-la.',
    checklist: CS_SEMANAL_ITEMS,
    priority: 'normal',
    assignee: 'Janilson',
    recurrence: { frequency: 'weekly', weekday: 5 },
  },
  sm_cs_mensal: {
    title: (name) => `CS — Mensal — ${name}`,
    description: 'Tarefa recorrente. Ao concluir, use "Duplicar próxima ocorrência" no card para recriá-la.',
    checklist: CS_MENSAL_ITEMS,
    priority: 'normal',
    assignee: 'Janilson',
    recurrence: { frequency: 'monthly', dayOfMonth: 1 },
  },
}

/** Which step(s) get created automatically once `key` is marked done.
 *  Terminal/recurring steps return []. When a client has both services, the
 *  Social Media activation step skips CS Semanal/Mensal — the Tráfego Pago
 *  sequence already creates that same pair, and duplicating it would leave
 *  the client with two of each. */
function getNextSteps(key: WorkflowStepKey, client: Pick<Client, 'modules'>): WorkflowStepKey[] {
  switch (key) {
    case 'pt_onboarding':
      return ['pt_briefing']
    case 'pt_briefing':
      return ['pt_planning']
    case 'pt_planning':
      return ['pt_trafego_semanal', 'pt_trafego_mensal', 'pt_cs_semanal', 'pt_cs_mensal']
    case 'sm_ativacao':
      return client.modules?.paidTraffic ? ['sm_producao', 'sm_aprovacao'] : ['sm_producao', 'sm_aprovacao', 'sm_cs_semanal', 'sm_cs_mensal']
    default:
      return []
  }
}

async function createWorkflowStepTask(
  key: WorkflowStepKey,
  client: Pick<Client, 'id' | 'companyName'>,
  userId: string,
  userName: string,
  users: AppUser[],
  order: number
) {
  const def = STEP_DEFS[key]
  const assignedTo = def.assignee === 'creator' ? userId : findUserIdByName(users, def.assignee)
  const items = typeof def.checklist === 'function' ? def.checklist(client.companyName) : def.checklist

  await createTask(
    {
      title: def.title(client.companyName),
      description: def.description,
      clientId: client.id,
      assignedTo,
      dueDate: null,
      priority: def.priority,
      status: 'todo',
      checklist: toChecklist(items),
      order,
      recurrence: def.recurrence ?? null,
      workflowStep: key,
    },
    userId,
    userName
  )
}

/** Creates only the first step(s) of the applicable sequence(s) for a
 *  freshly registered client — the rest of each sequence is created
 *  automatically as each step is marked done (see advanceClientWorkflow). */
export async function createInitialWorkflowTasks(
  client: Pick<Client, 'id' | 'companyName' | 'modules'>,
  userId: string,
  userName: string,
  users: AppUser[]
) {
  const base = Date.now()
  const firstSteps: WorkflowStepKey[] = []
  if (client.modules?.paidTraffic) firstSteps.push('pt_onboarding')
  if (client.modules?.socialMedia) firstSteps.push('sm_ativacao')

  for (let i = 0; i < firstSteps.length; i++) {
    await createWorkflowStepTask(firstSteps[i], client, userId, userName, users, base + i)
  }
}

/** Called right after a task is marked "done" — creates the next step(s) of
 *  its workflow sequence, if it belongs to one and has any (see
 *  getNextSteps). Terminal/recurring tasks are a no-op. */
export async function advanceClientWorkflow(
  task: { workflowStep?: WorkflowStepKey | null; clientId?: string },
  client: Pick<Client, 'id' | 'companyName' | 'modules'>,
  userId: string,
  userName: string,
  users: AppUser[]
) {
  if (!task.workflowStep || !task.clientId) return
  const nextKeys = getNextSteps(task.workflowStep, client)
  const base = Date.now()
  for (let i = 0; i < nextKeys.length; i++) {
    await createWorkflowStepTask(nextKeys[i], client, userId, userName, users, base + i)
  }
}
