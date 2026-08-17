import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function addDays(base: Date, dias: number) {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

function hojeMeioDia() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0));
}

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 10);

  await prisma.usuario.upsert({
    where: { email: "admin@adrianafestas.com" },
    update: {},
    create: {
      nome: "Adriana",
      email: "admin@adrianafestas.com",
      senhaHash,
      papel: "admin",
    },
  });

  const [balaoDourado, balaoBranco, fitaCetim, toalhaMesa, suporteDoces] = await Promise.all([
    prisma.material.create({ data: { nome: "Balão dourado 9\"", unidade: "un" } }),
    prisma.material.create({ data: { nome: "Balão branco 9\"", unidade: "un" } }),
    prisma.material.create({ data: { nome: "Fita de cetim", unidade: "m" } }),
    prisma.material.create({ data: { nome: "Toalha de mesa", unidade: "un" } }),
    prisma.material.create({ data: { nome: "Suporte de doces", unidade: "un" } }),
  ]);

  const arcoBaloes = await prisma.produto.create({
    data: {
      nome: "Arco de balões dourado",
      valorUnitario: 350,
      categoria: "Decoração de entrada",
      unidade: "un",
      materiais: {
        create: [
          { materialId: balaoDourado.id, quantidadeNecessaria: 50 },
          { materialId: balaoBranco.id, quantidadeNecessaria: 30 },
          { materialId: fitaCetim.id, quantidadeNecessaria: 5 },
        ],
      },
    },
  });

  const mesaDoce = await prisma.produto.create({
    data: {
      nome: "Mesa de doces completa",
      valorUnitario: 600,
      categoria: "Mesa posta",
      unidade: "un",
      materiais: {
        create: [
          { materialId: toalhaMesa.id, quantidadeNecessaria: 1 },
          { materialId: suporteDoces.id, quantidadeNecessaria: 3 },
        ],
      },
    },
  });

  const painelFesta = await prisma.produto.create({
    data: {
      nome: "Painel de festa personalizado",
      valorUnitario: 450,
      categoria: "Decoração de fundo",
      unidade: "un",
    },
  });

  const kitMesaInfantil = await prisma.produto.create({
    data: {
      nome: "Kit mesa infantil temática",
      valorUnitario: 280,
      categoria: "Mesa posta",
      unidade: "un",
      materiais: {
        create: [
          { materialId: toalhaMesa.id, quantidadeNecessaria: 1 },
          { materialId: balaoBranco.id, quantidadeNecessaria: 12 },
        ],
      },
    },
  });

  // Helper que replica a regra de negócio de aprovarOrcamento (server action),
  // usada aqui fora de um request do Next.js — sem revalidatePath/redirect.
  async function aprovarOrcamentoSeed(params: {
    clienteId: string;
    itens: { produtoId: string; quantidade: number; valorUnitario: number }[];
    desconto?: number;
    dataEvento: Date;
    nomeEvento?: string;
    horario?: string;
    local?: string;
    condicoesPagamento?: string;
    statusEvento?: "agendado" | "em_execucao" | "concluido" | "cancelado";
  }) {
    const itensComPreco = params.itens.map((i) => ({
      produtoId: i.produtoId,
      quantidade: i.quantidade,
      valorUnitarioCongelado: i.valorUnitario,
      subtotal: i.valorUnitario * i.quantidade,
    }));
    const total = Math.max(0, itensComPreco.reduce((acc, i) => acc + i.subtotal, 0) - (params.desconto ?? 0));

    const orcamento = await prisma.orcamento.create({
      data: {
        clienteId: params.clienteId,
        status: "aprovado",
        desconto: params.desconto ?? 0,
        total,
        itens: { create: itensComPreco },
      },
      include: {
        itens: { include: { produto: { include: { materiais: { include: { material: true } } } } } },
      },
    });

    const materiaisAgregados = new Map<string, { unidade: string; quantidade: number }>();
    for (const item of orcamento.itens) {
      for (const pm of item.produto.materiais) {
        const key = pm.material.nome.trim().toLowerCase();
        const qtd = Number(pm.quantidadeNecessaria) * Number(item.quantidade);
        const existente = materiaisAgregados.get(key);
        if (existente) existente.quantidade += qtd;
        else materiaisAgregados.set(key, { unidade: pm.material.unidade, quantidade: qtd });
      }
    }

    const contrato = await prisma.contrato.create({
      data: {
        orcamentoId: orcamento.id,
        clienteId: params.clienteId,
        status: "ativo",
        condicoesPagamento: params.condicoesPagamento || null,
        assinado: true,
        dataAssinatura: addDays(params.dataEvento, -10),
      },
    });

    const evento = await prisma.evento.create({
      data: {
        contratoId: contrato.id,
        nome: params.nomeEvento || null,
        data: params.dataEvento,
        horario: params.horario || null,
        local: params.local || null,
        status: params.statusEvento || "agendado",
      },
    });

    if (materiaisAgregados.size > 0) {
      await prisma.checklistMateriais.create({
        data: {
          eventoId: evento.id,
          itens: {
            create: Array.from(materiaisAgregados.entries()).map(([nome, v]) => ({
              materialNome: nome,
              quantidadeTotalNecessaria: v.quantidade,
              unidade: v.unidade,
              tenho: params.statusEvento === "concluido",
            })),
          },
        },
      });
    }

    return { orcamento, contrato, evento, total };
  }

  const hoje = hojeMeioDia();

  // ---- Clientes ----
  const [
    mariana,
    carla,
    roberto,
    fernanda,
    joaoPedro,
    beatriz,
    lucas,
    patricia,
    diego,
    camila,
    rafael,
    juliana,
  ] = await Promise.all([
    prisma.cliente.create({ data: { nome: "Mariana Souza", telefone: "(11) 98888-7777", endereco: "Rua das Flores, 123", documento: "123.456.789-00" } }),
    prisma.cliente.create({ data: { nome: "Carla Mendes", telefone: "(11) 97777-1234", endereco: "Av. Paulista, 900" } }),
    prisma.cliente.create({ data: { nome: "Roberto Lima", telefone: "(11) 96666-5555", endereco: "Rua Vergueiro, 1200" } }),
    prisma.cliente.create({ data: { nome: "Fernanda Alves", telefone: "(11) 95555-4444", endereco: "Rua Augusta, 45" } }),
    prisma.cliente.create({ data: { nome: "João Pedro Santos", telefone: "(11) 94444-3333", endereco: "Rua Haddock Lobo, 300" } }),
    prisma.cliente.create({ data: { nome: "Beatriz Rocha", telefone: "(11) 93333-2222", endereco: "Rua da Consolação, 850" } }),
    prisma.cliente.create({ data: { nome: "Lucas Martins", telefone: "(11) 92222-1111", endereco: "Rua Oscar Freire, 210" } }),
    prisma.cliente.create({ data: { nome: "Patrícia Gomes", telefone: "(11) 91111-0000", endereco: "Rua Pamplona, 500" } }),
    prisma.cliente.create({ data: { nome: "Diego Ferreira", telefone: "(11) 90000-9999", endereco: "Av. Rebouças, 1500" } }),
    prisma.cliente.create({ data: { nome: "Camila Barros", telefone: "(11) 98123-4567", endereco: "Rua Bela Cintra, 700" } }),
    prisma.cliente.create({ data: { nome: "Rafael Costa", telefone: "(11) 97123-4567", endereco: "Rua Teodoro Sampaio, 400" } }),
    prisma.cliente.create({ data: { nome: "Juliana Prado", telefone: "(11) 96123-4567", endereco: "Alameda Santos, 780" } }),
  ]);

  // Mariana: orçamento enviado, ainda sem evento
  await prisma.orcamento.create({
    data: {
      clienteId: mariana.id,
      status: "enviado",
      desconto: 0,
      total: 350 + 600 * 2,
      itens: {
        create: [
          { produtoId: arcoBaloes.id, quantidade: 1, valorUnitarioCongelado: 350, subtotal: 350 },
          { produtoId: mesaDoce.id, quantidade: 2, valorUnitarioCongelado: 600, subtotal: 1200 },
        ],
      },
    },
  });

  // Camila: orçamento enviado, ainda sem evento
  await prisma.orcamento.create({
    data: {
      clienteId: camila.id,
      status: "enviado",
      desconto: 50,
      total: 450 - 50,
      itens: { create: [{ produtoId: painelFesta.id, quantidade: 1, valorUnitarioCongelado: 450, subtotal: 450 }] },
    },
  });

  // João Pedro: rascunho
  await prisma.orcamento.create({
    data: {
      clienteId: joaoPedro.id,
      status: "rascunho",
      desconto: 0,
      total: 280,
      itens: { create: [{ produtoId: kitMesaInfantil.id, quantidade: 1, valorUnitarioCongelado: 280, subtotal: 280 }] },
    },
  });

  // Beatriz: recusado
  await prisma.orcamento.create({
    data: {
      clienteId: beatriz.id,
      status: "recusado",
      desconto: 0,
      total: 600,
      itens: { create: [{ produtoId: mesaDoce.id, quantidade: 1, valorUnitarioCongelado: 600, subtotal: 600 }] },
    },
  });

  // Carla: evento daqui a 5 dias, agendado, com pagamento parcial + despesa + tarefa
  const eventoCarla = await aprovarOrcamentoSeed({
    clienteId: carla.id,
    itens: [
      { produtoId: arcoBaloes.id, quantidade: 1, valorUnitario: 350 },
      { produtoId: mesaDoce.id, quantidade: 1, valorUnitario: 600 },
    ],
    dataEvento: addDays(hoje, 5),
    nomeEvento: "Aniversário de 15 anos - Carla",
    horario: "19:00",
    local: "Salão Jardim das Rosas",
    condicoesPagamento: "50% na assinatura, 50% até a data do evento",
  });
  await prisma.pagamento.create({
    data: { contratoId: eventoCarla.contrato.id, valor: 475, data: addDays(hoje, -10), formaPagamento: "Pix" },
  });
  await prisma.despesa.create({
    data: { descricao: "Aluguel de mesas e cadeiras", valor: 180, data: addDays(hoje, -3), eventoId: eventoCarla.evento.id },
  });
  const tarefaCarla = await prisma.tarefa.create({
    data: { titulo: "Preparativos - Aniversário Carla", data: addDays(hoje, 4), eventoId: eventoCarla.evento.id },
  });
  await prisma.tarefaItem.createMany({
    data: [
      { tarefaId: tarefaCarla.id, descricao: "Confirmar entrega dos balões", concluido: true },
      { tarefaId: tarefaCarla.id, descricao: "Montar mesa de doces no local", concluido: false },
      { tarefaId: tarefaCarla.id, descricao: "Testar iluminação do salão", concluido: false },
    ],
  });

  // Roberto: evento hoje, em execução
  const eventoRoberto = await aprovarOrcamentoSeed({
    clienteId: roberto.id,
    itens: [{ produtoId: painelFesta.id, quantidade: 1, valorUnitario: 450 }],
    dataEvento: hoje,
    nomeEvento: "Casamento Roberto & Ana",
    horario: "17:30",
    local: "Espaço Villa Verde",
    condicoesPagamento: "Pagamento único até o dia do evento",
    statusEvento: "em_execucao",
  });
  await prisma.pagamento.create({
    data: { contratoId: eventoRoberto.contrato.id, valor: 450, data: addDays(hoje, -20), formaPagamento: "Cartão de crédito" },
  });
  const tarefaRoberto = await prisma.tarefa.create({
    data: { titulo: "Montagem - Casamento Roberto & Ana", data: hoje, eventoId: eventoRoberto.evento.id },
  });
  await prisma.tarefaItem.createMany({
    data: [
      { tarefaId: tarefaRoberto.id, descricao: "Montar painel de fundo", concluido: true },
      { tarefaId: tarefaRoberto.id, descricao: "Conferir checklist de materiais", concluido: false },
    ],
  });

  // Fernanda: evento concluído há 10 dias, quitado
  const eventoFernanda = await aprovarOrcamentoSeed({
    clienteId: fernanda.id,
    itens: [
      { produtoId: mesaDoce.id, quantidade: 1, valorUnitario: 600 },
      { produtoId: kitMesaInfantil.id, quantidade: 1, valorUnitario: 280 },
    ],
    dataEvento: addDays(hoje, -10),
    nomeEvento: "Chá de bebê - Fernanda",
    horario: "15:00",
    local: "Residência da cliente",
    statusEvento: "concluido",
  });
  await prisma.pagamento.create({
    data: { contratoId: eventoFernanda.contrato.id, valor: eventoFernanda.total, data: addDays(hoje, -25), formaPagamento: "Transferência" },
  });
  await prisma.despesa.create({
    data: { descricao: "Compra de doces e docinhos", valor: 220, data: addDays(hoje, -12), eventoId: eventoFernanda.evento.id },
  });

  // Lucas: evento daqui a 20 dias, agendado, sem pagamento ainda (saldo em aberto)
  await aprovarOrcamentoSeed({
    clienteId: lucas.id,
    itens: [{ produtoId: arcoBaloes.id, quantidade: 2, valorUnitario: 350 }],
    dataEvento: addDays(hoje, 20),
    nomeEvento: "Formatura - Lucas",
    horario: "20:00",
    local: "Buffet Alameda",
    condicoesPagamento: "Entrada de 30% + saldo em até 2 parcelas",
  });

  // Patrícia: orçamento aprovado e evento criado
  await aprovarOrcamentoSeed({
    clienteId: patricia.id,
    itens: [{ produtoId: painelFesta.id, quantidade: 1, valorUnitario: 450 }],
    dataEvento: addDays(hoje, 15),
    nomeEvento: "Debutante - Patrícia",
    horario: "21:00",
    local: "Clube Recanto Feliz",
  });

  // Diego: evento daqui a 2 dias, saldo em aberto (alerta no dashboard)
  const eventoDiego = await aprovarOrcamentoSeed({
    clienteId: diego.id,
    itens: [
      { produtoId: arcoBaloes.id, quantidade: 1, valorUnitario: 350 },
      { produtoId: painelFesta.id, quantidade: 1, valorUnitario: 450 },
    ],
    dataEvento: addDays(hoje, 2),
    nomeEvento: "Aniversário infantil - Diego Jr.",
    horario: "14:00",
    local: "Buffet Mundo Encantado",
    condicoesPagamento: "50% de entrada, saldo no dia",
  });
  await prisma.pagamento.create({
    data: { contratoId: eventoDiego.contrato.id, valor: 400, data: addDays(hoje, -15), formaPagamento: "Pix" },
  });

  // Rafael: evento cancelado
  await aprovarOrcamentoSeed({
    clienteId: rafael.id,
    itens: [{ produtoId: mesaDoce.id, quantidade: 1, valorUnitario: 600 }],
    dataEvento: addDays(hoje, 8),
    nomeEvento: "Aniversário - Rafael (cancelado)",
    statusEvento: "cancelado",
  });

  // Juliana: evento fora da janela de 30 dias do dashboard
  await aprovarOrcamentoSeed({
    clienteId: juliana.id,
    itens: [{ produtoId: arcoBaloes.id, quantidade: 1, valorUnitario: 350 }],
    dataEvento: addDays(hoje, 45),
    nomeEvento: "Casamento - Juliana",
    horario: "18:00",
    local: "Espaço Terra Nova",
  });

  // Tarefas soltas (sem evento vinculado)
  const tarefaSolta1 = await prisma.tarefa.create({
    data: { titulo: "Ligar para fornecedor de balões", data: addDays(hoje, 1) },
  });
  await prisma.tarefaItem.createMany({
    data: [
      { tarefaId: tarefaSolta1.id, descricao: "Confirmar estoque de balão dourado", concluido: false },
      { tarefaId: tarefaSolta1.id, descricao: "Negociar preço por volume", concluido: false },
    ],
  });
  const tarefaSolta2 = await prisma.tarefa.create({
    data: { titulo: "Organizar estoque de materiais", data: addDays(hoje, -2) },
  });
  await prisma.tarefaItem.createMany({
    data: [
      { tarefaId: tarefaSolta2.id, descricao: "Contar toalhas de mesa disponíveis", concluido: true },
      { tarefaId: tarefaSolta2.id, descricao: "Separar itens danificados", concluido: false },
    ],
  });

  // Datas bloqueadas
  await prisma.dataBloqueada.create({
    data: { data: addDays(hoje, 12), motivo: "Manutenção do estoque" },
  });
  await prisma.dataBloqueada.create({
    data: { data: addDays(hoje, 25), dataFim: addDays(hoje, 27), motivo: "Viagem da equipe" },
  });

  console.log("Seed concluído. Login: admin@adrianafestas.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
