// Seed de produção: cria/atualiza só o usuário admin, sem nenhum dado de
// exemplo. Roda automaticamente a cada start do servidor (veja o script
// "start" no package.json) — é seguro rodar toda vez, é idempotente.
//
// As credenciais vêm das variáveis de ambiente ADMIN_EMAIL / ADMIN_PASSWORD
// (configure no Railway). Se não forem definidas, usa um valor padrão só pra
// não travar em ambientes de teste — não deixe isso acontecer em produção
// com dados reais.
//
// A senha é resincronizada com ADMIN_PASSWORD a cada start: pra trocar a
// senha do admin, basta mudar a variável de ambiente e reiniciar o serviço.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@adrianafestas.com";
  const senha = process.env.ADMIN_PASSWORD || "admin123";
  const nome = process.env.ADMIN_NOME || "Adriana";

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn(
      "[seed-prod] ADMIN_EMAIL/ADMIN_PASSWORD não configurados — usando credenciais padrão " +
      "(admin@adrianafestas.com / admin123). Configure essas variáveis de ambiente em produção."
    );
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.usuario.upsert({
    where: { email },
    update: { senhaHash, nome, ativo: true },
    create: { nome, email, senhaHash, papel: "admin" },
  });

  console.log(`Seed de produção concluído. Login: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
