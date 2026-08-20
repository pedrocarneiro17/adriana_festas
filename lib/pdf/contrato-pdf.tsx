import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatBRL, formatDate } from "@/lib/utils";
import { BRAND, BUSINESS, PdfBrandHeader, PdfBrandFooter, registerBrandFonts } from "./brand";

registerBrandFonts();

const styles = StyleSheet.create({
  page: { paddingHorizontal: 32, paddingBottom: 32, fontSize: 10, fontFamily: "Helvetica", lineHeight: 1.4 },
  title: { fontFamily: "Jost", fontWeight: 600, fontSize: 15, marginBottom: 14, textAlign: "center", color: BRAND.wine },
  clausula: { fontFamily: "Jost", fontWeight: 600, fontSize: 11, marginTop: 14, marginBottom: 6, color: BRAND.wine },
  section: { marginBottom: 8 },
  bold: { fontWeight: 700 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 4 },
  headerRow: { flexDirection: "row", backgroundColor: "#f3f4f6", paddingVertical: 4, fontWeight: 700 },
  colProduto: { flex: 3 },
  colQtd: { flex: 1, textAlign: "right" },
  avisoBox: { marginTop: 12, padding: 10, backgroundColor: "#f7f2f2", borderRadius: 4 },
  avisoTitle: { fontWeight: 700, marginBottom: 4 },
  signSection: { marginTop: 40, flexDirection: "row", justifyContent: "space-between" },
  signBlock: { width: "45%", alignItems: "center" },
  signLine: { borderTopWidth: 1, borderTopColor: "#000", width: "100%", marginBottom: 4, marginTop: 30 },
  paymentBox: { marginTop: 20, flexDirection: "row", justifyContent: "space-between" },
});

type ContratoPdfProps = {
  contrato: {
    id: string;
    criadoEm: Date;
    condicoesPagamento: string | null;
    somenteDecoracao: boolean;
    cliente: { nome: string; telefone: string | null; endereco: string | null; documento: string | null };
    orcamento: { total: unknown; itens: { produto: { nome: string }; quantidade: unknown }[] };
    evento: { data: Date; horario: string | null; local: string | null } | null;
  };
};

export default function ContratoPdf({ contrato }: ContratoPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfBrandHeader variant="wine" />

        <Text style={styles.title}>
          PRESTAÇÃO DE SERVIÇOS DE DECORAÇÃO{contrato.somenteDecoracao ? "" : " E CERIMONIAL"}
        </Text>

        <View style={styles.section}>
          <Text><Text style={styles.bold}>CONTRATADA:</Text> {BUSINESS.razaoSocial}, {BUSINESS.endereco}, portadora do RG {BUSINESS.rg} e CPF: {BUSINESS.cpf}.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.bold}>CONTRATANTE:</Text>
          <Text>Cliente: {contrato.cliente.nome}</Text>
          {contrato.cliente.documento && <Text>CPF/RG: {contrato.cliente.documento}</Text>}
          {contrato.cliente.endereco && <Text>Endereço: {contrato.cliente.endereco}</Text>}
          {contrato.cliente.telefone && <Text>Telefone: {contrato.cliente.telefone}</Text>}
        </View>

        <Text>
          Tem entre si, de maneira justa e acordada, o presente CONTRATO DE PRESTAÇÃO DE SERVIÇOS de
          decoração e cerimonial conforme cláusulas abaixo:
        </Text>

        <Text style={styles.clausula}>CLÁUSULA 1ª – DO OBJETO DO CONTRATO</Text>
        {contrato.evento && (
          <View style={styles.section}>
            <Text>Data: {formatDate(contrato.evento.data)}</Text>
            {contrato.evento.horario && <Text>Horário: {contrato.evento.horario}</Text>}
            {contrato.evento.local && <Text>Local: {contrato.evento.local}</Text>}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.bold}>Itens contratados</Text>
          <View style={styles.headerRow}>
            <Text style={styles.colProduto}>Produto/Serviço</Text>
            <Text style={styles.colQtd}>Qtd</Text>
          </View>
          {contrato.orcamento.itens.map((item, idx) => (
            <View style={styles.row} key={idx}>
              <Text style={styles.colProduto}>{item.produto.nome}</Text>
              <Text style={styles.colQtd}>{String(item.quantidade)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.clausula}>CLÁUSULA 2ª – DA EXECUÇÃO</Text>
        <Text>
          A contratada se compromete a realizar o serviço no local e data descritos na Cláusula 1ª, oferecendo
          todo o material de seu uso, dentro do que foi listado acima, até o horário estipulado.
        </Text>

        <Text style={styles.clausula}>CLÁUSULA 3ª – DO PREÇO E DAS CONDIÇÕES DE PAGAMENTO</Text>
        <Text>Valor total: {formatBRL(String(contrato.orcamento.total))}</Text>
        <Text>Forma de pagamento: {contrato.condicoesPagamento || "30% de entrada e restante a combinar"}</Text>

        <Text style={styles.clausula}>CLÁUSULA 4ª – DAS SANÇÕES</Text>
        <Text style={styles.bold}>Em caso de desistência:</Text>
        <Text>Até 6 meses para o evento: a contratada estornará 50% do valor pago até a data da desistência.</Text>
        <Text>Até 3 meses para o evento: a contratada estornará 30% do valor pago até a data da desistência.</Text>
        <Text>
          Em caso de necessidade de reagendamento do evento por causa de morte, doença ou motivo de força
          maior, remarcaremos uma nova data diante da disponibilidade da contratada.
        </Text>
        <Text style={styles.bold}>
          Caso o contratante desista de promover/cancele o evento nos 3 meses que o antecedem, não será
          reembolsado nenhum percentual do valor já pago.
        </Text>

        <Text style={styles.clausula}>CLÁUSULA 5ª – DAS DISPOSIÇÕES FINAIS</Text>
        <Text>Em caso de quebra dos itens ornamentais, será cobrado o valor de mercado.</Text>

        <View style={styles.avisoBox}>
          <Text style={styles.avisoTitle}>AVISO IMPORTANTE:</Text>
          <Text>- Fica a cargo da contratante criar um grupo no WhatsApp com todos os fornecedores envolvidos, para alinhar os detalhes e facilitar a comunicação.</Text>
          <Text>- Nos enviar uma foto para postagem do grande dia.</Text>
          <Text>*Os detalhes acima devem ser cumpridos no mínimo 8 dias de antecedência do evento.*</Text>
        </View>

        <Text style={{ marginTop: 16 }}>
          E por estarem as partes justas e acordadas, assinam o presente contrato, em 02 (duas) vias de igual
          teor.
        </Text>

        <View style={styles.signSection}>
          <View style={styles.signBlock}>
            <View style={styles.signLine} />
            <Text>CONTRATANTE</Text>
          </View>
          <View style={styles.signBlock}>
            <View style={styles.signLine} />
            <Text>CONTRATADA: {BUSINESS.razaoSocial}</Text>
          </View>
        </View>
        <View style={styles.paymentBox}>
          <View>
            <Text style={styles.bold}>Dados de pagamento:</Text>
            <Text>Chave PIX: {BUSINESS.pixChave}</Text>
            <Text>Banco: {BUSINESS.pixBanco}</Text>
          </View>
          <View>
            <Text>{BUSINESS.instagram}</Text>
            <Text>WhatsApp: {BUSINESS.whatsapp}</Text>
          </View>
        </View>

        <PdfBrandFooter />
      </Page>
    </Document>
  );
}
