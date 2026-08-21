-- CreateTable
CREATE TABLE "referencias_imagens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "evento_id" TEXT NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "dados" BLOB NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "referencias_imagens_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
