-- Flag "somente decoração": quando marcada, o título do contrato omite
-- "E CERIMONIAL".
ALTER TABLE "contratos" ADD COLUMN "somente_decoracao" BOOLEAN NOT NULL DEFAULT false;
