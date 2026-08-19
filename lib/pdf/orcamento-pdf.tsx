import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatBRL, formatDate } from "@/lib/utils";
import { BRAND, PdfBrandHeader, PdfBrandFooter, registerBrandFonts } from "./brand";

registerBrandFonts();

const styles = StyleSheet.create({
  page: { paddingHorizontal: 32, paddingBottom: 32, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontFamily: "Jost", fontWeight: 600, fontSize: 16, marginBottom: 4, color: BRAND.wine },
  subtitle: { fontSize: 10, marginBottom: 16, color: "#6b7280" },
  section: { marginBottom: 12 },
  sectionTitle: { fontFamily: "Jost", fontWeight: 600, fontSize: 11, marginBottom: 6, color: BRAND.wine },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 4 },
  headerRow: { flexDirection: "row", backgroundColor: "#f3f4f6", paddingVertical: 4, fontWeight: 700 },
  colProduto: { flex: 3 },
  colQtd: { flex: 1, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  totalLabel: { fontSize: 12, fontWeight: 700, marginRight: 8 },
  totalValue: { fontFamily: "Jost", fontWeight: 600, fontSize: 13, color: BRAND.wine },
});

type OrcamentoPdfProps = {
  orcamento: {
    id: string;
    dataCriacao: Date;
    validadeAte: Date | null;
    desconto: unknown;
    total: unknown;
    observacoes: string | null;
    cliente: { nome: string; telefone: string | null; endereco: string | null };
    itens: { produto: { nome: string }; quantidade: unknown }[];
  };
};

export default function OrcamentoPdf({ orcamento }: OrcamentoPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfBrandHeader variant="wine" />

        <Text style={styles.title}>Orçamento</Text>
        <Text style={styles.subtitle}>
          Emitido em {formatDate(orcamento.dataCriacao)}
          {orcamento.validadeAte ? ` · Válido até ${formatDate(orcamento.validadeAte)}` : ""}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text>{orcamento.cliente.nome}</Text>
          {orcamento.cliente.telefone && <Text>Telefone: {orcamento.cliente.telefone}</Text>}
          {orcamento.cliente.endereco && <Text>Endereço: {orcamento.cliente.endereco}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens</Text>
          <View style={styles.headerRow}>
            <Text style={styles.colProduto}>Produto</Text>
            <Text style={styles.colQtd}>Qtd</Text>
          </View>
          {orcamento.itens.map((item, idx) => (
            <View style={styles.row} key={idx}>
              <Text style={styles.colProduto}>{item.produto.nome}</Text>
              <Text style={styles.colQtd}>{String(item.quantidade)}</Text>
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

        <PdfBrandFooter />
      </Page>
    </Document>
  );
}
