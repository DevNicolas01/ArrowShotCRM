/** Widget "Rotina do dia" do Dashboard — checklist diário fixo por pessoa
 *  (Bruno, Jamilson, Ciane, Nicolas), gerado no frontend a partir do dia da
 *  semana/mês; nada aqui é persistido — só quais itens já foram marcados
 *  hoje (ver dailyRoutineService.ts). Mesmo padrão de "nomes reais
 *  hardcoded" já usado em clientWorkflowTemplates.ts. */

export type RoutinePersonKey = 'bruno' | 'jamilson' | 'ciane' | 'nicolas'

export interface RoutineItem {
  id: string
  text: string
}

const DAILY_MEETING: RoutineItem = { id: 'daily-meeting', text: 'Participar da reunião diária com o time (9h)' }

const BRUNO_DAILY: RoutineItem[] = [
  DAILY_MEETING,
  { id: 'bruno-ads-leads-morning', text: 'Responder mensagens de anúncios e leads (manhã)' },
  { id: 'bruno-pipeline', text: 'Organizar pipeline de leads na plataforma' },
  { id: 'bruno-confirm-sales-meetings', text: 'Confirmar reuniões de vendas do dia' },
  { id: 'bruno-ads-leads-afternoon', text: 'Responder mensagens e leads (tarde)' },
  { id: 'bruno-book-sales-meetings', text: 'Marcar novas reuniões de vendas' },
]
const BRUNO_MONDAY: RoutineItem[] = [{ id: 'bruno-partner-meeting-mon', text: 'Reunião de sociedade (11:30)' }]
const BRUNO_FRIDAY: RoutineItem[] = [
  { id: 'bruno-partner-meeting-fri', text: 'Reunião de sociedade (17h)' },
  { id: 'bruno-review-week-pipeline', text: 'Revisar pipeline da semana' },
]

const JAMILSON_DAILY: RoutineItem[] = [
  DAILY_MEETING,
  { id: 'jamilson-whatsapp-unanswered', text: 'Verificar mensagens sem resposta nos grupos de WhatsApp dos clientes' },
  { id: 'jamilson-update-tasks', text: 'Atualizar status das tarefas na plataforma' },
  { id: 'jamilson-check-overdue', text: 'Verificar se há tarefas atrasadas dos clientes' },
]
const JAMILSON_FRIDAY: RoutineItem[] = [
  { id: 'jamilson-weekly-update', text: 'Enviar atualização semanal a todos os clientes ativos' },
]
const JAMILSON_MONTHLY: RoutineItem[] = [
  { id: 'jamilson-monthly-report', text: 'Enviar relatório mensal a todos os clientes' },
  { id: 'jamilson-check-payments', text: 'Verificar pagamentos do mês' },
]

const CIANE_DAILY: RoutineItem[] = [
  DAILY_MEETING,
  { id: 'gestor-check-campaigns', text: 'Verificar desempenho das campanhas ativas' },
  { id: 'gestor-update-tasks', text: 'Atualizar tarefas na plataforma' },
]
const CIANE_MONDAY: RoutineItem[] = [
  { id: 'ciane-overview-clients', text: 'Overview completo de todos os clientes (Meta Ads + Google Ads)' },
  { id: 'ciane-review-week-plan', text: 'Revisar planejamento da semana' },
]
const CIANE_FRIDAY: RoutineItem[] = [
  { id: 'ciane-review-week-pending', text: 'Revisar pendências da semana' },
  { id: 'ciane-check-waiting-approval', text: 'Verificar conteúdos aguardando aprovação de clientes de Social Mídia' },
]

const NICOLAS_DAILY: RoutineItem[] = [
  DAILY_MEETING,
  { id: 'gestor-check-campaigns', text: 'Verificar desempenho das campanhas ativas' },
  { id: 'gestor-update-tasks', text: 'Atualizar tarefas na plataforma' },
]
const NICOLAS_MONDAY: RoutineItem[] = [
  { id: 'nicolas-start-weekly-production', text: 'Iniciar produção de conteúdos da semana (clientes de pacote semanal)' },
]
const NICOLAS_FRIDAY: RoutineItem[] = [
  { id: 'nicolas-review-production-pending', text: 'Revisar pendências de produção de conteúdo' },
  { id: 'nicolas-check-next-week-scheduled', text: 'Verificar conteúdos agendados para a próxima semana' },
]

/** Resolves the logged-in user's name to one of the 4 defined routines —
 *  case-insensitive, matches on first name (same convention as
 *  utils/userLookup.findUserIdByName, just in reverse). `undefined` means
 *  no routine is defined for this person — the widget just doesn't render. */
export function resolveRoutinePersonKey(userName: string): RoutinePersonKey | undefined {
  const name = userName.toLowerCase()
  if (name.includes('bruno')) return 'bruno'
  if (name.includes('jamilson') || name.includes('janilson')) return 'jamilson'
  if (name.includes('ciane')) return 'ciane'
  if (name.includes('nicolas') || name.includes('nícolas')) return 'nicolas'
  return undefined
}

/** Builds today's checklist for a person — pure function of (person, date),
 *  so the same day always regenerates the exact same item ids (needed to
 *  match up against dailyRoutineProgress). */
export function buildDailyRoutine(personKey: RoutinePersonKey, date: Date): RoutineItem[] {
  const weekday = date.getDay() // 0 = domingo … 6 = sábado
  const isWeekday = weekday >= 1 && weekday <= 5
  const isMonday = weekday === 1
  const isFriday = weekday === 5
  const isFirstOfMonth = date.getDate() === 1

  const items: RoutineItem[] = []

  switch (personKey) {
    case 'bruno':
      if (isWeekday) items.push(...BRUNO_DAILY)
      if (isMonday) items.push(...BRUNO_MONDAY)
      if (isFriday) items.push(...BRUNO_FRIDAY)
      break
    case 'jamilson':
      if (isWeekday) items.push(...JAMILSON_DAILY)
      if (isFriday) items.push(...JAMILSON_FRIDAY)
      if (isFirstOfMonth) items.push(...JAMILSON_MONTHLY)
      break
    case 'ciane':
      if (isWeekday) items.push(...CIANE_DAILY)
      if (isMonday) items.push(...CIANE_MONDAY)
      if (isFriday) items.push(...CIANE_FRIDAY)
      break
    case 'nicolas':
      if (isWeekday) items.push(...NICOLAS_DAILY)
      if (isMonday) items.push(...NICOLAS_MONDAY)
      if (isFriday) items.push(...NICOLAS_FRIDAY)
      break
  }

  return items
}
