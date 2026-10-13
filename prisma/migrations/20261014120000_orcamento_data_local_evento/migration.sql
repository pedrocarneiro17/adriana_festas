-- Data e endereço do evento informados já no orçamento.
ALTER TABLE "orcamentos" ADD COLUMN "data_evento" TIMESTAMP(3);
ALTER TABLE "orcamentos" ADD COLUMN "local_evento" TEXT;
