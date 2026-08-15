import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBRL, formatDate } from "@/lib/utils";
import { FileDown, Pencil } from "lucide-react";
import OrcamentoStatusActions from "../orcamento-status-actions";
import AprovarOrcamentoDialog from "../aprovar-orcamento-dialog";
import DuplicarButton from "../duplicar-button";

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  rascunho: "secondary",
  enviado: "default",
  aprovado: "success",
  recusado: "destructive",
  expirado: "secondary",
  pendente_reajuste: "warning",
};

export default async function OrcamentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orcamento = await prisma.orcamento.findUnique({
    where: { id },
    include: {
      cliente: true,
      itens: { include: { produto: true } },
      contrato: { include: { evento: true } },
    },
  });

  if (!orcamento) notFound();

  const podeEditar = ["rascunho", "enviado", "recusado", "expirado", "pendente_reajuste"].includes(
    orcamento.status
  );
  const podeReajustar = orcamento.status === "aprovado";
  const podeAprovar = orcamento.status === "enviado" || orcamento.status === "rascunho";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Orçamento · {orcamento.cliente.nome} <span className="text-sand-500">v{orcamento.versao}</span>
          </h1>
          <p className="text-sm text-sand-600">Criado em {formatDate(orcamento.dataCriacao)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[orcamento.status]}>{orcamento.status.replace("_", " ")}</Badge>
          <Button asChild variant="outline" size="sm">
            <a href={`/api/orcamentos/${orcamento.id}/pdf`} target="_blank">
              <FileDown className="h-4 w-4" /> PDF
            </a>
          </Button>
          <DuplicarButton id={orcamento.id} />
          {(podeEditar || podeReajustar) && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/orcamentos/${orcamento.id}/editar`}>
                <Pencil className="h-4 w-4" /> {podeReajustar ? "Reajustar" : "Editar"}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {orcamento.status === "pendente_reajuste" && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Este orçamento foi reajustado. Uma nova versão foi criada e precisa de nova aprovação. O contrato
          vinculado está marcado como <strong>pendente de revisão</strong>.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Valor unitário</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orcamento.itens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.produto.nome}</TableCell>
                  <TableCell>{item.quantidade.toString()}</TableCell>
                  <TableCell>{formatBRL(item.valorUnitarioCongelado.toString())}</TableCell>
                  <TableCell>{formatBRL(item.subtotal.toString())}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex flex-col items-end gap-1 text-sm">
            <span>Desconto: {formatBRL(orcamento.desconto.toString())}</span>
            <span className="text-lg font-bold text-[var(--color-text)]">Total: {formatBRL(orcamento.total.toString())}</span>
          </div>
        </CardContent>
      </Card>

      {orcamento.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-sand-700">{orcamento.observacoes}</CardContent>
        </Card>
      )}

      {orcamento.contrato?.evento && (
        <div className="rounded-[28px] bg-[var(--color-surface)] p-4 text-sm">
          Evento gerado:{" "}
          <Link href={`/eventos/${orcamento.contrato.evento.id}`} className="text-brand-700 hover:underline">
            ver evento
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {podeAprovar && <AprovarOrcamentoDialog orcamentoId={orcamento.id} validadeAte={orcamento.validadeAte?.toISOString().slice(0,10) ?? null} />}
        {podeEditar && <OrcamentoStatusActions id={orcamento.id} status={orcamento.status} />}
      </div>
    </div>
  );
}
