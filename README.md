# Adriana Festas — Plataforma de Gestão

Plataforma interna para digitalizar o fluxo completo de uma decoradora de festas: do primeiro
orçamento até o controle financeiro do evento.

```
Cliente → Orçamento → Evento (auto-gerado do orçamento aprovado, com contrato embutido)
→ Execução (checklist de materiais, tarefas, pagamentos, despesas) → Finalizar evento
```

O **Evento** é o registro central: ao aprovar um orçamento, tudo relacionado a ele — dados do
contrato, assinatura, condições de pagamento, pagamentos recebidos, despesas, checklist de
materiais e tarefas — fica reunido em uma única página (`/eventos/[id]`), com nome próprio
editável. O cliente só vê a lista de eventos vinculados a ele; o acompanhamento do dia a dia
acontece dentro do evento, não espalhado pelo cadastro do cliente. A lista de eventos e o
financeiro têm filtros por cliente, status e período, e mostram a margem de lucro (%) de cada
evento. Tarefas soltas (sem evento) são criadas direto na Agenda, que também tem filtros e um
menu lateral retrátil (colapsa no desktop, vira um menu gaveta no mobile).

## Stack

- **Next.js 16** (App Router) + TypeScript, full-stack (frontend + Server Actions).
- **Prisma ORM 6** — **PostgreSQL** em produção, **SQLite** em desenvolvimento local (dois
  schemas espelhados, veja [Banco de dados: Postgres em prod, SQLite local](#banco-de-dados-postgres-em-prod-sqlite-local)).
- **Tailwind CSS v4** com o sistema de design "Organic" (fundo creme, acento terracota,
  segundo acento sage, título em Caprasimo sobre corpo em Figtree, formas bem arredondadas).
- Autenticação simples por sessão JWT em cookie httpOnly, com papéis `admin` / `funcionario`.
- Geração de PDF (orçamentos e contratos) com `@react-pdf/renderer`.

## Rodando localmente

Não precisa instalar nem configurar nenhum banco de dados — o ambiente local usa SQLite, criado
automaticamente na primeira vez que o servidor sobe (veja a seção abaixo).

### 1. Pré-requisitos

- Node.js 20+

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env` (o valor padrão de `DATABASE_URL` já aponta para o SQLite
local, não precisa mudar nada pra desenvolver):

```bash
cp .env.example .env
```

- `DATABASE_URL="file:./dev.db"`: arquivo SQLite local (resolvido dentro de `prisma/local/`).
- `AUTH_SECRET`: uma string aleatória longa (usada para assinar o cookie de sessão).

### 4. Rodar as migrations e popular dados de exemplo

```bash
npm run db:local:migrate
npm run db:local:seed
```

O seed cria um usuário administrador de exemplo, ~12 clientes, orçamentos em vários status,
eventos (passados/futuros, com pagamentos, despesas e tarefas), tarefas soltas e datas
bloqueadas — dados o suficiente pra navegar pela aplicação inteira sem cadastrar nada manualmente:

- **E-mail:** `admin@adrianafestas.com`
- **Senha:** `admin123`

> Troque essa senha (ou crie um novo usuário e desative o de exemplo) antes de usar em produção —
> não há tela de cadastro de usuário na v1; usuários são criados via `prisma/seed.ts` ou
> diretamente no banco.

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Isso regenera automaticamente o Prisma Client apontando para o schema SQLite local (script
`predev`) antes de subir o Next.js. Acesse [http://localhost:3000](http://localhost:3000).

## Banco de dados: Postgres em prod, SQLite local

O Prisma não permite que um único `schema.prisma` alterne de conector em tempo de execução — o
`provider` (`sqlite` vs `postgresql`) é fixado quando o Prisma Client é gerado (`prisma
generate`), e o histórico de migrations de cada conector é incompatível com o outro. Em vez de
manter dois arquivos à mão, só existe **uma fonte da verdade**:

- `prisma/schema.prisma` — **produção** (Postgres). É o schema versionado no git, usado por
  `npm run build`, pelo deploy no Railway e por todos os comandos `prisma` sem `--schema`
  explícito.
- `prisma/local/schema.prisma` — **gerado automaticamente** (não versionado, está no
  `.gitignore`) por `scripts/generate-local-schema.js`: copia `prisma/schema.prisma` e troca só
  o `provider` do datasource para `sqlite`. Rodado sozinho antes de `npm run dev` (via `predev`)
  e antes de qualquer script `db:local:*`. Nunca edite esse arquivo diretamente — a próxima vez
  que algum script local rodar, ele é sobrescrito.

Ou seja: pra mudar o modelo de dados, edite só `prisma/schema.prisma` e gere as duas migrations
(uma pra cada histórico, já que os conectores não compartilham migrations):

```bash
# schema de produção (Postgres) — só roda de fato contra um Postgres acessível
npm run db:migrate -- --name nome_da_mudanca

# schema local (SQLite) — regenera prisma/local/schema.prisma sozinho antes de migrar
npm run db:local:migrate -- --name nome_da_mudanca
```

Se você não tiver um Postgres acessível para testar a migration de produção localmente, dá pra
gerar o SQL da migration sem conectar em nenhum banco (útil só pra criar o arquivo de migration a
partir do diff do schema):

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
```

## Regras de negócio implementadas

- **Orçamento → Evento:** ao aprovar um orçamento, o sistema cria automaticamente o registro
  de evento (contrato + evento na agenda) e o checklist de materiais (agregando os materiais de
  cada produto do orçamento × quantidade). Não há cronograma de parcelas pré-definido — os
  pagamentos são lançados manualmente dentro do próprio evento (ou pela área **Financeiro**)
  conforme forem recebidos, e o saldo em aberto é sempre `total do evento − soma dos pagamentos`.
- **Despesas sempre vinculadas a um evento:** não existe despesa "solta" — toda despesa é
  cadastrada a partir de um evento específico.
- **Evento como registro central:** assinatura, condições de pagamento, pagamentos, despesas,
  checklist de materiais e tarefas do evento ficam todos na página do evento
  (`/eventos/[id]`). O cadastro do cliente só lista os eventos vinculados a ele, evitando editar
  os mesmos dados em dois lugares diferentes.
- **Finalizar / reabrir evento:** um evento só é considerado encerrado depois de clicar em
  "Finalizar evento". Enquanto finalizado, todos os registros do evento ficam bloqueados para
  edição (pagamentos, despesas, checklist, tarefas, assinatura, condições, data). É possível
  reabrir o evento a qualquer momento para voltar a editar.
- **Orçamento associado ao evento, sem versionamento:** um orçamento aprovado nunca gera uma
  segunda linha. Editar um orçamento já aprovado (reajuste) atualiza os itens/total do mesmo
  registro — que é o mesmo que fica associado ao Contrato/Evento — e, se já houver um evento
  gerado, o checklist de materiais é recalculado automaticamente a partir dos novos itens. Editar
  um orçamento com contrato já assinado pede confirmação antes de abrir a edição.
- **Preço congelado:** o valor unitário de cada item de orçamento é copiado do produto no
  momento da criação (`valorUnitarioCongelado`) — reprecificar um produto não afeta orçamentos
  já existentes.
- **Datas bloqueadas:** marcar uma data como fechada não impede o agendamento, apenas emite um
  alerta de confirmação (ao criar orçamento, aprovar orçamento, ou mover a data de um evento).
- **Conflitos de agenda:** mover um evento para uma nova data revalida conflitos com outros
  eventos e com datas bloqueadas, sempre pedindo confirmação antes de prosseguir.
- **Alertas do painel:** eventos com saldo em aberto, eventos se aproximando (14 dias) e itens
  de tarefas do dia anterior não concluídos.

## Estrutura do projeto

```
app/
  (app)/            rotas autenticadas (produtos, clientes, orçamentos, eventos, agenda, financeiro)
  api/               rotas de API (login/logout, geração de PDF)
  login/             página de login pública
lib/
  actions/           Server Actions por domínio (orçamentos, contratos, agenda, tarefas, financeiro)
  pdf/               templates de PDF (orçamento, contrato)
  prisma.ts          cliente Prisma singleton
  auth.ts            sessão/JWT
components/ui/       componentes de UI compartilhados (botão, input, card, tabela, diálogo...)
prisma/
  schema.prisma      modelo de dados — fonte da verdade (produção, Postgres)
  migrations/         histórico de migrations do Postgres
  local/
    schema.prisma     gerado automaticamente (git-ignored, não editar)
    migrations/       histórico de migrations do SQLite (dev local)
  seed.ts             dados de exemplo para desenvolvimento (dev local)
  seed-prod.ts        cria só o usuário admin — roda automaticamente no start de produção
scripts/
  generate-local-schema.js   gera prisma/local/schema.prisma a partir de prisma/schema.prisma
```

## Deploy no Railway

1. Crie um novo projeto no Railway e adicione um serviço **PostgreSQL** gerenciado.
2. Adicione um segundo serviço a partir deste repositório (Next.js).
3. No serviço Next.js, configure as variáveis de ambiente:
   - `DATABASE_URL`: copie a connection string do serviço Postgres do Railway (Railway
     normalmente expõe essa variável automaticamente como referência — use
     `${{Postgres.DATABASE_URL}}`).
   - `AUTH_SECRET`: gere uma string aleatória longa.
4. Build command (padrão, já configurado em `package.json`):
   ```
   npm run build
   ```
   Isso roda `prisma generate` antes do build do Next.js.
5. Start command (padrão, já configurado em `package.json`):
   ```
   npm run start
   ```
   Não precisa rodar migration nem seed manualmente: toda vez que o serviço sobe, `npm run start`
   já roda `prisma migrate deploy` (aplica as migrations pendentes — não gera novas, seguro pra
   produção) e depois `prisma/seed-prod.ts` (cria só o usuário admin, via `upsert` — não duplica
   nem mexe em dados existentes se já rodou antes) antes de iniciar o Next.js. O primeiro deploy
   já sobe com as tabelas criadas e o login pronto (`admin@adrianafestas.com` / `admin123` —
   troque a senha assim que possível).

## Scripts disponíveis

| Script | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (regenera o client SQLite via `predev`) |
| `npm run build` | `prisma generate` (schema Postgres) + build de produção |
| `npm run start` | Aplica migrations pendentes + cria o admin (se não existir) + inicia o servidor de produção |
| `npm run db:migrate` | Cria/aplica migrations no schema de produção (Postgres) — precisa de um Postgres acessível |
| `npm run db:deploy` | Aplica migrations existentes em produção (`prisma migrate deploy`), sem subir o servidor |
| `npm run db:seed` | Popula o banco com dados de exemplo (usa o client gerado por último) — só pra dev/teste |
| `npm run db:seed:prod` | Cria só o usuário admin, sem dados de exemplo — já roda automaticamente no `start` |
| `npm run db:studio` | Abre o Prisma Studio no schema de produção (Postgres) |
| `npm run db:local:migrate` | Cria/aplica migrations no schema local (SQLite) |
| `npm run db:local:reset` | Reseta o banco SQLite local e reaplica as migrations |
| `npm run db:local:seed` | Regenera o client SQLite e popula o banco local com dados de exemplo |
| `npm run db:local:studio` | Abre o Prisma Studio no schema local (SQLite) |

## Fora de escopo nesta versão

- Assinatura eletrônica de contrato (fica como registro manual — checkbox "assinado/impresso").
- Cadastro próprio de fornecedores (tratado como campo de texto livre na despesa por evento).
- Fluxo formal de cancelamento com estorno automático (cancelamento apenas muda o status do
  evento/contrato; qualquer estorno é lançado manualmente como ajuste financeiro).
- Multi-tenant (o sistema assume uma única empresa).
#   a d r i a n a _ f e s t a s  
 