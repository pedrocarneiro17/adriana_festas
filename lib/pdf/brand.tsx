import path from "path";
import { Font, View, Text, Svg, Path, StyleSheet } from "@react-pdf/renderer";

// Identidade visual Adriana Maia Festas — extraída da apresentação de marca.
// Fontes reais da marca (Amenti / Autumn Wind) não estão disponíveis como
// arquivo; usamos substitutas gratuitas de visual próximo (Jost / Alex Brush).
export const BRAND = {
  wine: "#581922",
  green: "#415D51",
  white: "#FFFFFF",
  textMuted: "#d9c9cc",
};

export const BUSINESS = {
  nomeFantasia: "Adriana Maia Festas",
  razaoSocial: "ADRIANA MAIA CARNEIRO",
  endereco: "Sítio Soares, Guaraciaba – MG",
  cpf: "034.981.146-62",
  rg: "10606169",
  instagram: "@adrianamaiafestas",
  whatsapp: "31 99632-3972",
  pixChave: "63.684.589/0001-0 (CNPJ)",
  pixBanco: "SICOOB",
};

let fontsRegistered = false;

export function registerBrandFonts() {
  if (fontsRegistered) return;
  const fontsDir = path.join(process.cwd(), "public", "fonts");

  Font.register({
    family: "Jost",
    fonts: [
      { src: path.join(fontsDir, "Jost-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontsDir, "Jost-Medium.ttf"), fontWeight: 500 },
      { src: path.join(fontsDir, "Jost-SemiBold.ttf"), fontWeight: 600 },
    ],
  });
  Font.register({
    family: "Alex Brush",
    src: path.join(fontsDir, "AlexBrush-Regular.ttf"),
  });

  fontsRegistered = true;
}

const headerStyles = StyleSheet.create({
  wine: { backgroundColor: BRAND.wine },
  green: { backgroundColor: BRAND.green },
  band: { paddingVertical: 28, alignItems: "center", marginBottom: 20 },
  wordmark: {
    fontFamily: "Jost",
    fontWeight: 500,
    fontSize: 20,
    letterSpacing: 4,
    color: BRAND.white,
    marginTop: 6,
  },
  tagline: {
    fontFamily: "Alex Brush",
    fontSize: 20,
    color: BRAND.white,
    marginTop: -4,
  },
});

// Monograma "A" com o traço curvo característico da marca, redesenhado em
// vetor (não é um clone exato do arquivo original, que não temos disponível).
function Monograma({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M50 10 L78 88 M50 10 L22 88 M32 62 H68"
        stroke={BRAND.white}
        strokeWidth={4}
        fill="none"
      />
      <Path
        d="M8 46 C 30 66, 46 66, 62 50"
        stroke={BRAND.white}
        strokeWidth={2.5}
        fill="none"
      />
    </Svg>
  );
}

export function PdfBrandHeader({ variant = "wine" }: { variant?: "wine" | "green" }) {
  registerBrandFonts();
  return (
    <View style={[headerStyles.band, variant === "wine" ? headerStyles.wine : headerStyles.green]}>
      <Monograma />
      <Text style={headerStyles.wordmark}>ADRIANA MAIA</Text>
      <Text style={headerStyles.tagline}>festas</Text>
    </View>
  );
}

const footerStyles = StyleSheet.create({
  footer: {
    marginTop: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5d9db",
    fontSize: 8,
    color: "#8a8a8a",
  },
});

export function PdfBrandFooter() {
  registerBrandFonts();
  return (
    <View style={footerStyles.footer}>
      <Text>{BUSINESS.nomeFantasia} · {BUSINESS.instagram} · WhatsApp {BUSINESS.whatsapp}</Text>
    </View>
  );
}
