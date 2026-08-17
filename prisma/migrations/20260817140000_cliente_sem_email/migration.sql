-- Cliente não precisa de e-mail — endereço passa a ser o dado de contato
-- exibido junto ao telefone.
ALTER TABLE "clientes" DROP COLUMN "email";
