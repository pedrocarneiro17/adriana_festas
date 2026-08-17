-- Orçamento aprovado deixa de gerar uma nova versão a cada reajuste: as
-- edições passam a atualizar o mesmo registro. Colunas de versionamento
-- removidas.
ALTER TABLE "orcamentos" DROP COLUMN "versao";
ALTER TABLE "orcamentos" DROP COLUMN "origem_id";
