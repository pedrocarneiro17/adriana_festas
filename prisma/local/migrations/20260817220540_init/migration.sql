-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'admin',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "endereco" TEXT,
    "documento" TEXT,
    "observacoes" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "valor_unitario" DECIMAL NOT NULL,
    "categoria" TEXT,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "materiais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "ativo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "produto_materiais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produto_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "quantidade_necessaria" DECIMAL NOT NULL,
    CONSTRAINT "produto_materiais_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "produto_materiais_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cliente_id" TEXT NOT NULL,
    "data_criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validade_ate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "desconto" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    CONSTRAINT "orcamentos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orcamento_itens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orcamento_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade" DECIMAL NOT NULL,
    "valor_unitario_congelado" DECIMAL NOT NULL,
    "subtotal" DECIMAL NOT NULL,
    CONSTRAINT "orcamento_itens_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "orcamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orcamento_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orcamento_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "condicoes_pagamento" TEXT,
    "assinado" BOOLEAN NOT NULL DEFAULT false,
    "data_assinatura" DATETIME,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contratos_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "orcamentos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "contratos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contrato_id" TEXT NOT NULL,
    "nome" TEXT,
    "data" DATETIME NOT NULL,
    "horario" TEXT,
    "local" TEXT,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    CONSTRAINT "eventos_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "datas_bloqueadas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" DATETIME NOT NULL,
    "data_fim" DATETIME,
    "motivo" TEXT
);

-- CreateTable
CREATE TABLE "checklists_materiais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evento_id" TEXT NOT NULL,
    CONSTRAINT "checklists_materiais_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checklist_material_itens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checklist_id" TEXT NOT NULL,
    "material_nome" TEXT NOT NULL,
    "quantidade_total_necessaria" DECIMAL NOT NULL,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "tenho" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "checklist_material_itens_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "checklists_materiais" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tarefas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "evento_id" TEXT,
    CONSTRAINT "tarefas_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tarefa_itens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tarefa_id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "tarefa_itens_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contrato_id" TEXT NOT NULL,
    "valor" DECIMAL NOT NULL,
    "data" DATETIME NOT NULL,
    "forma_pagamento" TEXT,
    CONSTRAINT "pagamentos_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "despesas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL NOT NULL,
    "data" DATETIME NOT NULL,
    "evento_id" TEXT NOT NULL,
    CONSTRAINT "despesas_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "materiais_nome_key" ON "materiais"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_orcamento_id_key" ON "contratos"("orcamento_id");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_contrato_id_key" ON "eventos"("contrato_id");

-- CreateIndex
CREATE UNIQUE INDEX "checklists_materiais_evento_id_key" ON "checklists_materiais"("evento_id");
