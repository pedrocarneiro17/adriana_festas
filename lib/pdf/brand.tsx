import fs from "fs";
import path from "path";
import { Font, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

// Identidade visual Adriana Maia Festas — extraída da apresentação de marca.
// A logo (public/images/logo-wine.png / logo-green.png) é a arte oficial,
// recortada a partir dos arquivos enviados. Fontes reais da marca
// (Amenti / Autumn Wind) não estão disponíveis como arquivo; usamos
// substitutas gratuitas de visual próximo (Jost / Alex Brush) só no corpo
// do texto — a logo em si já traz a tipografia real, embutida na imagem.
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
  band: { paddingVertical: 18, alignItems: "center", marginBottom: 20 },
  logo: { width: 200, height: 100 },
});

const logoSources: Partial<Record<"wine" | "green", { data: Buffer; format: "png" }>> = {};

function getLogoSource(variant: "wine" | "green") {
  if (!logoSources[variant]) {
    const imagesDir = path.join(process.cwd(), "public", "images");
    const data = fs.readFileSync(path.join(imagesDir, `logo-${variant}.png`));
    logoSources[variant] = { data, format: "png" };
  }
  return logoSources[variant]!;
}

export function PdfBrandHeader({ variant = "wine" }: { variant?: "wine" | "green" }) {
  registerBrandFonts();
  return (
    <View style={[headerStyles.band, variant === "wine" ? headerStyles.wine : headerStyles.green]}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, não é <img> do DOM */}
      <Image src={getLogoSource(variant)} style={headerStyles.logo} />
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
