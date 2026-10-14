-- Número de convidados e paleta de cores informados no orçamento.
ALTER TABLE "orcamentos" ADD COLUMN "numero_convidados" INTEGER;
ALTER TABLE "orcamentos" ADD COLUMN "paleta_cores" TEXT;
