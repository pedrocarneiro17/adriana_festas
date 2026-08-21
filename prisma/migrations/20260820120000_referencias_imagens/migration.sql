-- Fotos de referência anexadas ao evento, guardadas como bytes no próprio
-- banco (sem depender de storage externo).
CREATE TABLE "referencias_imagens" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "dados" BYTEA NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referencias_imagens_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "referencias_imagens" ADD CONSTRAINT "referencias_imagens_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
