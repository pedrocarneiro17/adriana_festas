import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, senha } = await request.json();

  if (!email || !senha) {
    return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario || !usuario.ativo) {
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }

  const senhaValida = await verifyPassword(senha, usuario.senhaHash);
  if (!senhaValida) {
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }

  await createSession({
    userId: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    papel: usuario.papel as "admin" | "funcionario",
  });

  return NextResponse.json({ ok: true });
}
