import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatBRL, formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 4, color: "#be123c" },
  subtitle: { fontSize: 10, marginBottom: 16, color: "#6b7280" },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 4 },
  headerRow: { flexDirection: "row", backgroundColor: "#f3f4f6", paddingVertical: 4, fontWeight: 700 },
  colNum: { flex: 1 },
  colData: { flex: 2 },
  colValor: { flex: 2, textAlign: "right" },
  footer: { marginTop: 24, fontSize: 8, color: "#9ca3af" },
});

type ContratoPdfProps = {
  contrato: {
    id: string;
    criadoEm: Date;
    condicoesPagamento: string | null;
    assinado: boolean;
    dataAssinatura: Date | null;
    cliente: { nome: string; telefone: string | null; email: string | null; endereco: string | null; documento: string | null };
    orcamento: { total: unknown };
    evento: { data: Date; horario: string | null; local: string | null } | null;
  };
};

export default function ContratoPdf({ contrato }: ContratoPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Contrato de Prestação de Serviços · Adriana Festas</Text>
        <Text style={styles.subtitle}>Emitido em {formatDate(contrato.criadoEm)}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contratante</Text>
          <Text>{contrato.cliente.nome}</Text>
          {contrato.cliente.documento && <Text>Documento: {contrato.cliente.documento}</Text>}
          {contrato.cliente.telefone && <Text>Telefone: {contrato.cliente.telefone}</Text>}
          {contrato.cliente.endereco && <Text>Endereço: {contrato.cliente.endereco}</Text>}
        </View>

        {contrato.evento && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evento</Text>
            <Text>Data: {formatDate(contrato.evento.data)}</Text>
            {contrato.evento.horario && <Text>Horário: {contrato.evento.horario}</Text>}
            {contrato.evento.local && <Text>Local: {contrato.evento.local}</Text>}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valor total</Text>
          <Text>{formatBRL(String(contrato.orcamento.total))}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condições de pagamento</Text>
          <Text>{contrato.condicoesPagamento || "-"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assinatura</Text>
          <Text>
            {contrato.assinado
              ? `Assinado/impresso em ${contrato.dataAssinatura ? formatDate(contrato.dataAssinatura) : "-"}`
              : "Pendente de assinatura"}
          </Text>
        </View>

        <Text style={styles.footer}>Documento gerado automaticamente pelo sistema de gestão Adriana Festas.</Text>
      </Page>
    </Document>
  );
}
