// Gera prisma/local/schema.prisma a partir de prisma/schema.prisma (fonte da
// verdade, Postgres), trocando só o datasource para SQLite. Assim os dois
// nunca ficam fora de sincronia manualmente — rode antes de comandos locais
// (já é chamado pelo script "predev").
const fs = require("fs");
const path = require("path");

const srcPath = path.join(__dirname, "..", "prisma", "schema.prisma");
const destPath = path.join(__dirname, "..", "prisma", "local", "schema.prisma");

const header = `// ARQUIVO GERADO AUTOMATICAMENTE — não edite à mão.
// Gerado a partir de prisma/schema.prisma por scripts/generate-local-schema.js
// (roda no "predev"). Para mudar o modelo de dados, edite prisma/schema.prisma.

`;

let schema = fs.readFileSync(srcPath, "utf8");
schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');

fs.mkdirSync(path.dirname(destPath), { recursive: true });
fs.writeFileSync(destPath, header + schema);
console.log("[db] prisma/local/schema.prisma gerado a partir de prisma/schema.prisma (sqlite)");
