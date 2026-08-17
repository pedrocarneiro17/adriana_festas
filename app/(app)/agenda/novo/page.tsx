import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import NovoAgendaForm from "./novo-agenda-form";

export default async function NovoAgendaPage() {
  const eventos = await prisma.evento.findMany({
    where: { status: { not: "cancelado" } },
    include: { contrato: { include: { cliente: true } } },
    orderBy: { data: "asc" },
  });

  const eventosOptions = eventos.map((e) => ({
    id: e.id,
    label: `${e.nome || e.contrato.cliente.nome} · ${formatDate(e.data)}`,
  }));

  return <NovoAgendaForm eventosOptions={eventosOptions} />;
}
