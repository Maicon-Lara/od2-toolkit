// Geração de notas de referência (compêndio) a partir dos dados do SRD.
// Funções puras: recebem dados, devolvem markdown. Sem dependência do Obsidian.

import { ArmaDef, ArmaduraDef, Bonus, ClasseDef, ItemDef, PovoDef, sinal } from "./od2";
import { ItemMagico } from "./srd/itens-magicos";
import { MagiaDef } from "./srd/magias";

const FOOTER =
  "\n---\n*Nota gerada pelo Old Dragon 2 Toolkit a partir do SRD. " +
  "Old Dragon 2ª edição © 2023 da Old Dragon Editora · CC BY-SA 4.0.*\n";

// Frontmatter padrão das notas geradas. `od2_compendio: true` marca a nota como
// regenerável (o gerador só sobrescreve notas com essa marca).
function frontmatter(tipo: string): string {
  return ["---", "tags:", "  - od2", "  - compendio", `  - ${tipo}`, "od2_compendio: true", "---", ""].join("\n");
}

function bonusTexto(b?: Bonus): string[] {
  const r: string[] = [];
  if (!b) return r;
  if (b.jpd) r.push(`${sinal(b.jpd)} JPD`);
  if (b.jpc) r.push(`${sinal(b.jpc)} JPC`);
  if (b.jps) r.push(`${sinal(b.jps)} JPS`);
  if (b.ba) r.push(`${sinal(b.ba)} BA`);
  if (b.ca) r.push(`${sinal(b.ca)} CA`);
  if (b.ca_base != null) r.push(`CA base ${b.ca_base}`);
  if (b.deslocamento != null) r.push(`deslocamento ${b.deslocamento} m`);
  return r;
}

export function notaClasse(c: ClasseDef): string {
  const out: string[] = [frontmatter("classe"), `# ${c.nome}`, ""];

  const info: string[] = [];
  if (c.dado_vida) info.push(`**Dado de Vida:** d${c.dado_vida}`);
  if (c.base && c.base !== c.nome) info.push(`**Perfil:** ${c.base}`);
  if (info.length) out.push("> [!info] Classe — Old Dragon 2", "> " + info.join("  ·  "), "");

  if ((c.ba?.length ?? 0) || (c.jp?.length ?? 0)) {
    out.push("## Progressão", "", "| Nível | Bônus de Ataque | Jogada de Proteção |", "|--:|:--:|:--:|");
    const n = Math.max(c.ba?.length ?? 0, c.jp?.length ?? 0);
    for (let i = 0; i < n; i++) {
      const ba = c.ba?.[i];
      const jp = c.jp?.[i];
      out.push(`| ${i + 1} | ${ba != null ? sinal(ba) : "—"} | ${jp ?? "—"} |`);
    }
    out.push("");
  }

  if (c.magias?.length) {
    const maxCirc = c.magias.reduce((m, lv) => Math.max(m, lv.length), 0);
    const cabec = ["Nível", ...Array.from({ length: maxCirc }, (_, i) => `${i + 1}º círculo`)];
    out.push(
      "## Magias por dia",
      "",
      `| ${cabec.join(" | ")} |`,
      `|${cabec.map(() => ":--:").join("|")}|`,
    );
    c.magias.forEach((lv, idx) => {
      const cells = Array.from({ length: maxCirc }, (_, i) => (lv[i] ? String(lv[i]) : "—"));
      out.push(`| ${idx + 1} | ${cells.join(" | ")} |`);
    });
    out.push("", "_Conjuradores ganham espaços extras por atributo (Clérigo = SAB, Mago = INT)._", "");
  }

  if (c.talentos?.length) {
    out.push("## Talentos", "", ...c.talentos.map((t) => `- ${t}`), "");
  }

  const poderes = (c.poderes ?? []).filter((p) => p?.nome);
  if (poderes.length) {
    out.push("## Poderes", "");
    for (const p of poderes) {
      out.push(`- **[${p.nivel ?? 1}º] ${p.nome}**${p.desc ? ` — ${p.desc}` : ""}`);
      for (const m of p.melhorias ?? []) {
        if (m?.desc) out.push(`    - **${m.nivel ?? ""}º:** ${m.desc}`);
      }
    }
    out.push("");
  }

  out.push(FOOTER);
  return out.join("\n");
}

export function notaPovo(p: PovoDef): string {
  const out: string[] = [frontmatter("povo"), `# ${p.nome}`, ""];
  if (p.descricao) out.push(`> ${p.descricao}`, "");

  const info: string[] = [];
  if (p.deslocamento != null) info.push(`**Deslocamento:** ${p.deslocamento} m`);
  if (p.infravisao) info.push(`**Infravisão:** ${p.infravisao}`);
  if (p.alinhamento) info.push(`**Alinhamento:** ${p.alinhamento}`);
  if (info.length) out.push("> [!info] Povo — Old Dragon 2", "> " + info.join("  ·  "), "");

  const bonus = bonusTexto(p.bonus);
  if (bonus.length) out.push(`**Bônus mecânicos:** ${bonus.join(", ")}.`, "");

  const habs = (p.habilidades ?? []).filter((h) => h?.nome);
  if (habs.length) {
    out.push("## Habilidades", "");
    for (const h of habs) out.push(`- **${h.nome}**${h.desc ? ` — ${h.desc}` : ""}`);
    out.push("");
  }

  out.push(FOOTER);
  return out.join("\n");
}

// `yamlBody` é o corpo já serializado do bloco od2-monstro (vem de stringifyYaml).
export function notaMonstro(nome: string, yamlBody: string): string {
  const fence = "```";
  return [
    frontmatter("monstro"),
    `# ${nome}`,
    "",
    `${fence}od2-monstro`,
    yamlBody.replace(/\n+$/, ""),
    fence,
    FOOTER,
  ].join("\n");
}

// --- Equipamento ---
function tabela(out: string[], cabec: string[], linhas: string[][]) {
  out.push(`| ${cabec.join(" | ")} |`, `|${cabec.map(() => "---").join("|")}|`);
  for (const l of linhas) out.push(`| ${l.join(" | ")} |`);
  out.push("");
}

export function notaArmas(armas: ArmaDef[]): string {
  const out: string[] = [frontmatter("equipamento"), "# Armas", ""];
  tabela(
    out,
    ["Arma", "Dano", "Categoria", "Alcance", "Custo", "Carga"],
    armas.map((a) => [a.nome, a.dano, a.categoria ?? "—", a.alcance ?? "—", a.custo ?? "—", a.carga ?? "—"]),
  );
  out.push("_“#” = carga desprezível. Munições (flechas/virotes) definem o dano do disparo._", FOOTER);
  return out.join("\n");
}

export function notaArmaduras(armaduras: ArmaduraDef[]): string {
  const out: string[] = [frontmatter("equipamento"), "# Armaduras", ""];
  tabela(
    out,
    ["Armadura", "Bônus de CA", "Tipo", "Custo", "Carga"],
    armaduras.map((a) => [a.nome, a.ca, a.tipo ?? "—", a.custo ?? "—", a.carga ?? "—"]),
  );
  out.push("_CA ascendente: some o bônus da armadura à CA base 10 (+ mod. DES + escudo)._", FOOTER);
  return out.join("\n");
}

export function notaItens(itens: ItemDef[]): string {
  const out: string[] = [frontmatter("equipamento"), "# Itens Gerais", ""];
  tabela(
    out,
    ["Item", "Peso", "Custo"],
    itens.map((i) => [i.nome, i.peso ?? "—", i.custo ?? "—"]),
  );
  out.push(FOOTER);
  return out.join("\n");
}

export function notaEquipamento(sistemaMonetario: string[]): string {
  const out: string[] = [frontmatter("equipamento"), "# Equipamento", ""];
  out.push("> [!info] Sistema monetário", ...sistemaMonetario.map((l) => `> - ${l}`), "");
  out.push("## Tabelas", "", "- [[Armas]]", "- [[Armaduras]]", "- [[Itens Gerais]]", "");
  out.push(FOOTER);
  return out.join("\n");
}

// --- Magias ---
export function notaMagias(
  titulo: string,
  porCirculo: MagiaDef[][],
  exclusivas?: Array<{ classe: string; magias: string[] }>,
): string {
  const out: string[] = [frontmatter("magias"), `# ${titulo}`, ""];
  const total = porCirculo.reduce((s, c) => s + c.length, 0);
  out.push(`> [!info] ${total} magias em ${porCirculo.length} círculos.`, "");
  porCirculo.forEach((magias, i) => {
    if (!magias.length) return;
    out.push(`## ${i + 1}º Círculo`, "", ...magias.map((m) => `- **${m.nome}** — ${m.desc}`), "");
  });
  if (exclusivas?.length) {
    out.push("## Magias exclusivas de especialização", "");
    for (const e of exclusivas) out.push(`- **${e.classe}:** ${e.magias.join(", ")}`);
    out.push("");
  }
  out.push(FOOTER);
  return out.join("\n");
}

// --- Itens mágicos ---
export function notaItensMagicos(itens: ItemMagico[]): string {
  const out: string[] = [frontmatter("item-magico"), "# Itens Mágicos", ""];
  const categorias = [...new Set(itens.map((i) => i.categoria))];
  for (const cat of categorias) {
    out.push(`## ${cat}`, "");
    for (const i of itens.filter((x) => x.categoria === cat)) {
      out.push(`- **${i.nome}** — ${i.efeito}`);
    }
    out.push("");
  }
  out.push(FOOTER);
  return out.join("\n");
}

export function notaIndice(titulo: string, secoes: Array<{ titulo: string; nomes: string[] }>): string {
  const out: string[] = [frontmatter("indice"), `# ${titulo}`, ""];
  out.push(
    "> [!abstract] Compêndio do Old Dragon 2",
    "> Referência gerada a partir do **SRD gratuito** do OD2. Regenere pelo comando",
    "> *“Gerar compêndio OD2 (SRD)”*. As notas com `od2_compendio: true` são sobrescritas",
    "> ao regenerar; notas suas com o mesmo nome são preservadas.",
    "",
  );
  for (const s of secoes) {
    if (!s.nomes.length) continue;
    out.push(`## ${s.titulo}`, "", ...s.nomes.map((n) => `- [[${n}]]`), "");
  }
  out.push(FOOTER);
  return out.join("\n");
}
