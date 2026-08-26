# Arrow Shot CRM

CRM interno da Arrow Shot Marketing, focado inicialmente na operação de Social Media. React + Vite + TypeScript + Tailwind + Firebase (Auth, Firestore, Storage), pensado para deploy na Vercel.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- Firebase Authentication, Firestore, Storage
- react-router-dom, @dnd-kit (Kanban drag-and-drop), date-fns, react-hot-toast, lucide-react

## Estrutura do projeto

```
src/
  components/   # UI reutilizável, organizada por domínio (tasks, content, clients, kanban, files, comments, activity, layout, ui, auth)
  pages/        # Uma página por rota
  hooks/        # Hooks de dados (useClients, useTasks, useContents, ...) sobre os services
  services/     # Toda a lógica de acesso ao Firestore/Storage
  firebase/     # Inicialização do SDK (config.ts)
  context/      # AuthContext
  types/        # Interfaces/enums do domínio, compartilhadas por todo o app
firestore.rules
firestore.indexes.json
storage.rules
firebase.json
```

## 1. Configurar o Firebase (manual, no Console)

Nenhuma etapa abaixo pode ser feita por código — exige acesso ao [Firebase Console](https://console.firebase.google.com).

1. **Criar o projeto** (ou usar um existente). Nome sugerido: `arrow-shot-crm`.
2. **Authentication** → Sign-in method → habilitar **E-mail/senha**.
   - Criar manualmente o primeiro usuário (Authentication → Users → Add user) com o e-mail/senha da primeira pessoa que vai logar. Esse será promovido a `admin` automaticamente no primeiro login (ver `src/services/userService.ts`).
3. **Firestore Database** → criar banco, edição **Standard**, modo produção, região `southamerica-east1` (São Paulo).
4. **Adicionar um app Web** (Project settings → General → "Your apps" → `</>`) para obter as chaves do SDK — são os valores do passo 2 abaixo. Essas chaves **não são secretas**; o controle de acesso real é feito pelas Security Rules.
5. **Storage — adiado.** Desde o final de 2024 o Google exige o plano pago **Blaze** (com cartão de crédito cadastrado) só pra *ativar* o Storage, mesmo dentro da cota gratuita. Neste projeto isso ficou pendente porque não há cartão da empresa disponível ainda. **O CRM funciona inteiro sem o Storage** — só a aba de Arquivos/anexos fica com um aviso até alguém com autorização para usar o cartão da empresa fizer o upgrade. Quando isso acontecer:
   - No Console: Storage → Get started → escolher `southamerica-east1` (mesma região do Firestore).
   - Rodar `npx firebase deploy --only storage` pra publicar o `storage.rules` que já está pronto no projeto.
   - Também dá pra reforçar `storage.rules` com checagem de `role`/`clientId` igual ao Firestore nesse momento — hoje ele só verifica "está logado", com um comentário no arquivo explicando a troca.

## 2. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores do app Web criado no passo 1.4. Nunca commitar `.env.local` (já está no `.gitignore` via `*.local`).

Na Vercel, cadastre as mesmas 6 variáveis em Project Settings → Environment Variables (Production, Preview e Development).

## 3. Deploy das Security Rules e índices

Com a [Firebase CLI](https://firebase.google.com/docs/cli) instalada (já está em `devDependencies`, use `npx firebase`):

```bash
npx firebase login
npx firebase use --add          # selecione o projeto criado no passo 1
npx firebase deploy --only firestore:rules,firestore:indexes
```

Sem isso, o Firestore fica com as regras padrão (tudo bloqueado) — o app carrega mas nenhuma leitura/escrita funciona.

> **Storage ainda não ativado neste projeto** (exige plano Blaze do Google, ver seção abaixo). Enquanto isso, não rode `--only storage` — o Firebase CLI dá erro porque o bucket não existe. Quando o Storage for ativado, rode `npx firebase deploy --only storage` separadamente.

## 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`, faça login com o usuário criado no passo 1.2.

## 5. Deploy na Vercel

```bash
npx vercel        # primeira vez, configura o projeto
npx vercel --prod
```

Ou conecte o repositório Git direto no dashboard da Vercel. `vercel.json` já está configurado com o rewrite de SPA necessário para o React Router funcionar em rotas diretas (ex: `/clientes/abc123`). Build command `npm run build`, output `dist` (detectado automaticamente pelo preset Vite).

## Autenticação e permissões

- Login por e-mail/senha (`Firebase Authentication`).
- Perfil de cada usuário fica em `users/{uid}` no Firestore, com `role`: `admin` | `manager` | `employee` | `client`.
- O **primeiro usuário a logar** vira `admin` automaticamente. Os seguintes entram como `employee`; um admin promove quem for necessário editando o campo `role` do documento (via console do Firebase, ou futuramente uma tela de administração).
- `client` é reservado para um futuro portal externo do cliente (aprovação de conteúdo via link) — hoje o app não expõe rotas para esse papel, mas as Security Rules já isolam o que cada `clientId` pode enxergar.
- Rotas protegidas por `ProtectedRoute` (`src/components/auth/ProtectedRoute.tsx`); usuário não autenticado é redirecionado para `/login`.

## Collections do Firestore

| Collection | Descrição |
|---|---|
| `users` | Perfil de cada usuário autenticado (role, nome, avatar) |
| `clients` | Clientes da agência |
| `tasks` | Tarefas internas (Kanban geral) |
| `contents` | Conteúdos de Social Media (Kanban de produção) |
| `approvals` | Log de aprovações/solicitações de alteração de conteúdo |
| `comments` | Comentários, genéricos por `entityType` + `entityId` |
| `files` | Metadados de arquivo (o binário fica no Storage) |
| `activities` | Log de auditoria genérico, genérico por `entityType` + `entityId` |
| `calendarEvents` | Eventos avulsos do calendário (reuniões, gravações) — tarefas e conteúdos aparecem no calendário direto de suas próprias collections |
| `notifications` | Reservada para notificações por usuário (schema pronto, sem UI ainda) |
| `teams`, `projects` | Reservadas para agrupar usuários/trabalho (schema pronto, sem UI ainda) |

Todo documento relevante carrega `id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, e relacionamentos são sempre por **ID** (`clientId`, nunca `clientName`).

## Storage

Estrutura de pastas: `/clients/{clientId}/{category}/{timestamp}_{fileName}`, onde `category` é `social-media`, `documents`, e (reservado para o futuro, sem mudança de regra necessária) `google-ads`, `meta-ads`, `reports`. Ver `src/services/fileService.ts` e `storage.rules`.

## Arquitetura pensada para o futuro

- `EntityType` (`src/types/common.ts`) já inclui `googleAdsCampaign`, `metaAdsCampaign`, `lead`, `report` — comentários, arquivos e histórico funcionam para esses módulos assim que as collections forem criadas, sem mudar nada do que já existe.
- `Client.modules` marca quais módulos cada cliente já usa, sem exigir uma collection por módulo desde o início.
- As Security Rules têm um bloco comentado indicando exatamente o padrão a replicar para as próximas collections.

## Pendências de configuração manual (resumo)

1. Criar o projeto Firebase e habilitar Auth (e-mail/senha) e Firestore (plano Spark, gratuito, sem cartão).
2. Criar o primeiro usuário em Authentication → Users.
3. Preencher `.env.local` (local) e as mesmas variáveis no dashboard da Vercel.
4. `npx firebase deploy --only firestore:rules,firestore:indexes`.
5. Deploy do frontend na Vercel (import do repo ou `vercel --prod`).
6. **Pendente / futuro**: ativar o Storage (exige plano Blaze + cartão da empresa) quando alguém autorizado puder cadastrar o cartão. Até lá, upload de arquivos fica indisponível — o resto do CRM funciona normalmente.
