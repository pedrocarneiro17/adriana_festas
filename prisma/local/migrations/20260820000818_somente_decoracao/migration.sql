-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_contratos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orcamento_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "condicoes_pagamento" TEXT,
    "somente_decoracao" BOOLEAN NOT NULL DEFAULT false,
    "assinado" BOOLEAN NOT NULL DEFAULT false,
    "data_assinatura" DATETIME,
    "valor_multa" DECIMAL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contratos_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "orcamentos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "contratos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_contratos" ("assinado", "cliente_id", "condicoes_pagamento", "criado_em", "data_assinatura", "id", "orcamento_id", "status", "valor_multa") SELECT "assinado", "cliente_id", "condicoes_pagamento", "criado_em", "data_assinatura", "id", "orcamento_id", "status", "valor_multa" FROM "contratos";
DROP TABLE "contratos";
ALTER TABLE "new_contratos" RENAME TO "contratos";
CREATE UNIQUE INDEX "contratos_orcamento_id_key" ON "contratos"("orcamento_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
