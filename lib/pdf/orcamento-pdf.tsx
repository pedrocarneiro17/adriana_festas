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
  colProduto: { flex: 3 },
  colQtd: { flex: 1, textAlign: "right" },
  colValor: { flex: 1.5, textAlign: "right" },
  colSubtotal: { flex: 1.5, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  totalLabel: { fontSize: 12, fontWeight: 700, marginRight: 8 },
  totalValue: { fontSize: 12, fontWeight: 700, color: "#be123c" },
  footer: { marginTop: 24, fontSize: 8, color: "#9ca3af" },
});

type OrcamentoPdfProps = {
  orcamento: {
    id: string;
    dataCriacao: Date;
    validadeAte: Date | null;
    desconto: unknown;
    total: unknown;
    observacoes: string | null;
    cliente: { nome: string; telefone: string | null; email: string | null; endereco: string | null };
    itens: { produto: { nome: string }; quantidade: unknown; valorUnitarioCongelado: unknown; subtotal: unknown }[];
  };
};

export default function OrcamentoPdf({ orcamento }: OrcamentoPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Orçamento · Adriana Festas</Text>
        <Text style={styles.subtitle}>
          Emitido em {formatDate(orcamento.dataCriacao)}
          {orcamento.validadeAte ? ` · Válido até ${formatDate(orcamento.validadeAte)}` : ""}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text>{orcamento.cliente.nome}</Text>
          {orcamento.cliente.telefone && <Text>Telefone: {orcamento.cliente.telefone}</Text>}
          {orcamento.cliente.email && <Text>E-mail: {orcamento.cliente.email}</Text>}
          {orcamento.cliente.endereco && <Text>Endereço: {orcamento.cliente.endereco}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens</Text>
          <View style={styles.headerRow}>
            <Text style={styles.colProduto}>Produto</Text>
            <Text style={styles.colQtd}>Qtd</Text>
            <Text style={styles.colValor}>Valor unit.</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>
          {orcamento.itens.map((item, idx) => (
            <View style={styles.row} key={idx}>
              <Text style={styles.colProduto}>{item.produto.nome}</Text>
              <Text style={styles.colQtd}>{String(item.quantidade)}</Text>
              <Text style={styles.colValor}>{formatBRL(String(item.valorUnitarioCongelado))}</Text>
              <Text style={styles.colSubtotal}>{formatBRL(String(item.subtotal))}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Desconto:</Text>
          <Text>{formatBRL(String(orcamento.desconto))}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formatBRL(String(orcamento.total))}</Text>
        </View>

        {orcamento.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text>{orcamento.observacoes}</Text>
          </View>
        )}

        <Text style={styles.footer}>Documento gerado automaticamente pelo sistema de gestão Adriana Festas.</Text>
      </Page>
    </Document>
  );
}
