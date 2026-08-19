import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatDate } from "@/lib/utils";
import { BRAND, PdfBrandHeader, PdfBrandFooter, registerBrandFonts } from "./brand";

registerBrandFonts();

const styles = StyleSheet.create({
  page: { paddingHorizontal: 32, paddingBottom: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontFamily: "Jost", fontWeight: 600, fontSize: 16, marginBottom: 4, color: BRAND.green },
  subtitle: { fontSize: 10, marginBottom: 16, color: "#6b7280" },
  section: { marginBottom: 14 },
  sectionTitle: { fontFamily: "Jost", fontWeight: 600, fontSize: 11, marginBottom: 6, color: BRAND.green },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 4 },
  headerRow: { flexDirection: "row", backgroundColor: "#f3f4f6", paddingVertical: 4, fontWeight: 700 },
  colCheck: { width: 20 },
  colDesc: { flex: 3 },
  colQtd: { flex: 1, textAlign: "right" },
  checkbox: { width: 9, height: 9, borderWidth: 1, borderColor: "#374151" },
  taskGroup: { marginBottom: 8 },
  taskTitle: { fontSize: 10, fontWeight: 700, marginBottom: 3 },
  taskItemRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2, paddingLeft: 8 },
  empty: { fontSize: 9, color: "#9ca3af" },
});

type ChecklistEventoPdfProps = {
  evento: {
    nome: string | null;
    data: Date;
    horario: string | null;
    local: string | null;
    contrato: {
      cliente: { nome: string };
      orcamento: { itens: { produto: { nome: string }; quantidade: unknown }[] };
    };
    checklistMateriais: { itens: { materialNome: string; quantidadeTotalNecessaria: unknown; unidade: string }[] } | null;
    tarefas: { titulo: string; itens: { descricao: string }[] }[];
  };
};

export default function ChecklistEventoPdf({ evento }: ChecklistEventoPdfProps) {
  const materiaisItens = evento.checklistMateriais?.itens ?? [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfBrandHeader variant="green" />

        <Text style={styles.title}>Checklist do Evento</Text>
        <Text style={styles.subtitle}>
          {evento.nome || evento.contrato.cliente.nome} · {evento.contrato.cliente.nome} · {formatDate(evento.data)}
          {evento.horario ? ` · ${evento.horario}` : ""}
          {evento.local ? ` · ${evento.local}` : ""}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens do contrato</Text>
          <View style={styles.headerRow}>
            <Text style={styles.colDesc}>Produto</Text>
            <Text style={styles.colQtd}>Qtd</Text>
          </View>
          {evento.contrato.orcamento.itens.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.colDesc}>{item.produto.nome}</Text>
              <Text style={styles.colQtd}>{String(item.quantidade)}</Text>
            </View>
          ))}
          {evento.contrato.orcamento.itens.length === 0 && <Text style={styles.empty}>Nenhum item.</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist de materiais</Text>
          <View style={styles.headerRow}>
            <Text style={styles.colCheck}></Text>
            <Text style={styles.colDesc}>Material</Text>
            <Text style={styles.colQtd}>Qtd</Text>
          </View>
          {materiaisItens.map((item, idx) => (
            <View key={idx} style={[styles.row, { alignItems: "center" }]}>
              <View style={styles.colCheck}>
                <View style={styles.checkbox} />
              </View>
              <Text style={[styles.colDesc, { textTransform: "capitalize" }]}>{item.materialNome}</Text>
              <Text style={styles.colQtd}>
                {String(item.quantidadeTotalNecessaria)} {item.unidade}
              </Text>
            </View>
          ))}
          {materiaisItens.length === 0 && <Text style={styles.empty}>Nenhum material identificado.</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarefas do evento</Text>
          {evento.tarefas.map((tarefa, idx) => (
            <View key={idx} style={styles.taskGroup}>
              <Text style={styles.taskTitle}>{tarefa.titulo}</Text>
              {tarefa.itens.map((item, itemIdx) => (
                <View key={itemIdx} style={styles.taskItemRow}>
                  <View style={styles.checkbox} />
                  <Text>{item.descricao}</Text>
                </View>
              ))}
              {tarefa.itens.length === 0 && <Text style={[styles.empty, { paddingLeft: 8 }]}>Sem itens.</Text>}
            </View>
          ))}
          {evento.tarefas.length === 0 && <Text style={styles.empty}>Nenhuma tarefa vinculada.</Text>}
        </View>

        <PdfBrandFooter />
      </Page>
    </Document>
  );
}
