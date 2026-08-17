import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBRL, formatDate } from "@/lib/utils";
import { FileDown, ArrowLeft } from "lucide-react";
import NomeEventoForm from "../nome-evento-form";
import AssinaturaToggle from "../assinatura-toggle";
import CondicoesPagamentoForm from "../condicoes-pagamento-form";
import EventoAcoes from "../evento-acoes";
import MoverDataForm from "../mover-data-form";
import RegistrarPagamentoDialog from "../../financeiro/registrar-pagamento-dialog";
import ExcluirPagamentoButton from "../excluir-pagamento-button";
import ChecklistMateriaisView from "../checklist-materiais-view";
import NovaDespesaEventoDialog from "../nova-despesa-evento-dialog";
import DespesaEventoRow from "../despesa-evento-row";
import TarefaCard from "../../agenda/tarefa-card";
import NovaTarefaDialog from "../../agenda/nova-tarefa-dialog";

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  agendado: "default",
  em_execucao: "warning",
  concluido: "success",
  cancelado: "destructive",
};

export default async function EventoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const evento = await prisma.evento.findUnique({
    where: { id },
    include: {
      contrato: {
        include: {
          cliente: true,
          orcamento: { include: { itens: { include: { produto: true } } } },
          pagamentos: { orderBy: { data: "desc" } },
        },
      },
      checklistMateriais: { include: { itens: true } },
      tarefas: { include: { itens: true }, orderBy: { data: "asc" } },
      despesas: { orderBy: { data: "desc" } },
    },
  });

  if (!evento) notFound();

  const readOnly = evento.status === "concluido";
  const total = Number(evento.contrato.orcamento.total);
  const pago = evento.contrato.pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
  const saldo = Math.max(0, total - pago);
  const totalDespesas = evento.despesas.reduce((acc, d) => acc + Number(d.valor), 0);
  const lucro = total - totalDespesas;
  const margem = total > 0 ? (lucro / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/eventos" className="flex w-fit items-center gap-1.5 text-sm text-sand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Voltar para eventos
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <NomeEventoForm eventoId={evento.id} nome={evento.nome} readOnly={readOnly} />
          <p className="text-sm text-sand-600">
            {evento.contrato.cliente.nome} · {formatDate(evento.data)} {evento.horario && `· ${evento.horario}`} {evento.local && `· ${evento.local}`}
          </p>
          <div className="flex gap-3">
            <Link href={`/clientes/${evento.contrato.cliente.id ?? ""}`} className="text-sm text-brand-700 hover:underline">
              ver cliente
            </Link>
            <Link href={`/orcamentos/${evento.contrato.orcamento.id}`} className="text-sm text-brand-700 hover:underline">
              ver orçamento
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[evento.status]}>{evento.status.replace("_", " ")}</Badge>
          <Button asChild variant="outline" size="sm">
            <a href={`/api/contratos/${evento.contrato.id}/pdf`} target="_blank">
              <FileDown className="h-4 w-4" /> PDF
            </a>
          </Button>
        </div>
      </div>

      {readOnly && (
        <div className="rounded-full border border-sage-300 bg-sage-100 px-4 py-2 text-sm text-sage-800">
          Evento finalizado — os registros estão bloqueados para edição. Reabra o evento para alterar algo.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Evento</CardTitle>
              {!readOnly && <MoverDataForm eventoId={evento.id} data={evento.data.toISOString()} />}
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            <p>Data: {formatDate(evento.data)}</p>
            <p>Horário: {evento.horario || "-"}</p>
            <p>Local: {evento.local || "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assinatura</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <AssinaturaToggle id={evento.contrato.id} assinado={evento.contrato.assinado} readOnly={readOnly} />
            {evento.contrato.dataAssinatura && <p>Assinado em {formatDate(evento.contrato.dataAssinatura)}</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens e materiais</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evento.contrato.orcamento.itens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.produto.nome}</TableCell>
                  <TableCell>{item.quantidade.toString()}</TableCell>
                  <TableCell>{formatBRL(item.subtotal.toString())}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div>
            <p className="mb-2 text-sm font-medium text-sand-700">Checklist de materiais</p>
            {evento.checklistMateriais && evento.checklistMateriais.itens.length > 0 ? (
              <ChecklistMateriaisView
                itens={evento.checklistMateriais.itens.map((i) => ({
                  ...i,
                  quantidadeTotalNecessaria: i.quantidadeTotalNecessaria.toString(),
                }))}
                readOnly={readOnly}
              />
            ) : (
              <p className="text-sm text-sand-500">
                Nenhum material necessário identificado (os produtos deste orçamento não têm materiais cadastrados).
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tarefas do evento</h2>
        {!readOnly && <NovaTarefaDialog eventoId={evento.id} />}
      </div>
      <div className="flex flex-col gap-3">
        {evento.tarefas.map((t) => (
          <TarefaCard key={t.id} tarefa={{ ...t, data: t.data.toISOString() }} readOnly={readOnly} />
        ))}
        {evento.tarefas.length === 0 && <p className="text-sm text-sand-500">Nenhuma tarefa vinculada.</p>}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Despesas do evento</CardTitle>
            {!readOnly && <NovaDespesaEventoDialog eventoId={evento.id} />}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm">Total de despesas: <strong>{formatBRL(totalDespesas)}</strong></p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evento.despesas.map((d) => (
                <DespesaEventoRow
                  key={d.id}
                  despesa={{ id: d.id, descricao: d.descricao, valor: d.valor.toString(), data: d.data.toISOString() }}
                  readOnly={readOnly}
                />
              ))}
              {evento.despesas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-sand-500">
                    Nenhuma despesa registrada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Margem de lucro do evento</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm">
          <span>Receita: <strong>{formatBRL(total)}</strong></span>
          <span>Despesas: <strong className="text-amber-700">{formatBRL(totalDespesas)}</strong></span>
          <span>Lucro: <strong className={lucro >= 0 ? "text-sage-700" : "text-red-700"}>{formatBRL(lucro)}</strong></span>
          <span>Margem: <strong className={margem >= 0 ? "text-sage-700" : "text-red-700"}>{margem.toFixed(1)}%</strong></span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Condições de pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <CondicoesPagamentoForm
            id={evento.contrato.id}
            condicoesPagamento={evento.contrato.condicoesPagamento ?? ""}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pagamentos</CardTitle>
            {!readOnly && saldo > 0 && (
              <RegistrarPagamentoDialog contratoId={evento.contrato.id} clienteNome={evento.contrato.cliente.nome} saldo={saldo} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-4 text-sm">
            <span>Total: <strong>{formatBRL(total)}</strong></span>
            <span>Pago: <strong className="text-sage-700">{formatBRL(pago)}</strong></span>
            <span>Saldo: <strong className={saldo > 0 ? "text-amber-700" : "text-sage-700"}>{formatBRL(saldo)}</strong></span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evento.contrato.pagamentos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.data)}</TableCell>
                  <TableCell>{p.formaPagamento || "-"}</TableCell>
                  <TableCell>{formatBRL(p.valor.toString())}</TableCell>
                  <TableCell className="text-right">{!readOnly && <ExcluirPagamentoButton id={p.id} />}</TableCell>
                </TableRow>
              ))}
              {evento.contrato.pagamentos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-sand-500">
                    Nenhum pagamento registrado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EventoAcoes
        eventoId={evento.id}
        contratoId={evento.contrato.id}
        status={evento.status}
      />
    </div>
  );
}
