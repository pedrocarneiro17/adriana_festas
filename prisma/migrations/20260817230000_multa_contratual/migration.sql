-- Multa contratual aplicada ao cancelar um evento. O valor original
-- combinado continua em orcamentos.total, sem ser sobrescrito.
ALTER TABLE "contratos" ADD COLUMN "valor_multa" DECIMAL(65,30);
