import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/utils";

export default async function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      orcamentos: { orderBy: { dataCriacao: "desc" } },
      contratos: {
        orderBy: { criadoEm: "desc" },
        include: { evento: true },
      },
    },
  });

  if (!cliente) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{cliente.nome}</h1>
        <p className="text-sm text-sand-600">
          {cliente.telefone || "sem telefone"} · {cliente.endereco || "sem endereço"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p><span className="text-sand-600">Endereço:</span> {cliente.endereco || "-"}</p>
            <p><span className="text-sand-600">Documento:</span> {cliente.documento || "-"}</p>
            <p><span className="text-sand-600">Observações:</span> {cliente.observacoes || "-"}</p>
            <p><span className="text-sand-600">Cliente desde:</span> {formatDate(cliente.criadoEm)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orçamentos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {cliente.orcamentos.map((o) => (
              <Link
                key={o.id}
                href={`/orcamentos/${o.id}`}
                className="flex items-center justify-between rounded-md border border-[var(--color-divider)] p-2 text-sm hover:bg-sand-100"
              >
                <span>{formatDate(o.dataCriacao)}</span>
                <span className="flex items-center gap-2">
                  {formatBRL(o.total.toString())}
                  <Badge variant="secondary">{o.status}</Badge>
                </span>
              </Link>
            ))}
            {cliente.orcamentos.length === 0 && (
              <p className="text-sm text-sand-500">Nenhum orçamento ainda.</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Eventos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {cliente.contratos
              .filter((c) => c.evento)
              .map((c) => (
                <Link
                  key={c.id}
                  href={`/eventos/${c.evento!.id}`}
                  className="flex items-center justify-between rounded-md border border-[var(--color-divider)] p-2 text-sm hover:bg-sand-100"
                >
                  <span>Evento em {formatDate(c.evento!.data)}</span>
                  <Badge variant="secondary">{c.evento!.status.replace("_", " ")}</Badge>
                </Link>
              ))}
            {cliente.contratos.filter((c) => c.evento).length === 0 && (
              <p className="text-sm text-sand-500">Nenhum evento ainda.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
