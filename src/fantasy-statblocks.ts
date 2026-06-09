// Exportação do bestiário OD2 para o Fantasy Statblocks (id: obsidian-5e-statblocks).
// A API pública do FS é só de leitura (sem addCreature), então a ponte é por
// arquivo: geramos (1) um array de criaturas no formato dele — importável em
// "Generic JSON" — e (2) um Layout "Old Dragon 2" que exibe os campos próprios do
// sistema (DV, JP, Moral, XP, Encontro, Tesouro). O usuário importa os dois nas
// configurações do plugin. Campos canônicos (name/ac/hp/hit_dice) são lidos também
// pelo Initiative Tracker e pelo construtor de encontros do FS.

import { MonstroSeed } from "./od2";

// Criatura no formato do Fantasy Statblocks. Os campos não-canônicos (dv, jp,
// moral, xp, encontro, tesouro, habitat, descricao, habilidades) são preservados
// no import e renderizados pelo OD2_LAYOUT abaixo.
export interface FSMonster {
  name: string;
  source: string;
  layout: string;
  type?: string;
  size?: string;
  alignment?: string;
  ac?: number;
  hp?: number;
  hit_dice?: string;
  speed?: string;
  dv?: string;
  jp?: number;
  moral?: number;
  xp?: number;
  encontro?: string;
  tesouro?: string;
  habitat?: string;
  descricao?: string;
  actions?: Array<{ name: string; desc: string }>;
  habilidades?: Array<{ name: string; desc: string }>;
}

const sinal = (n: number): string => (n >= 0 ? `+${n}` : `${n}`);

const numOuUndef = (x: unknown): number | undefined => {
  const n = Number(x);
  return Number.isFinite(n) ? n : undefined;
};

// Converte os Dados de Vida do OD2 em expressão de dados (d8; ½ = 1d4) para o
// rolador de PV do Fantasy Statblocks.
function dvParaHitDice(dv: string | number | undefined): string | undefined {
  if (dv == null) return undefined;
  const s = String(dv).trim();
  if (s === "½" || s === "1/2") return "1d4";
  const m = s.match(/^(\d+)\s*([+-]\d+)?/);
  if (!m) return undefined;
  return `${m[1]}d8${m[2] ?? ""}`;
}

// Mapeia uma criatura-semente do bestiário OD2 para o formato do FS.
export function monstroParaFS(m: MonstroSeed): FSMonster {
  const movimento =
    m.movimento != null
      ? /^\d+$/.test(String(m.movimento).trim())
        ? `${m.movimento} m`
        : String(m.movimento)
      : undefined;

  const actions = (m.ataques ?? [])
    .filter((a) => a && a.nome)
    .map((a) => {
      const nome = `${a.qtd ? `${a.qtd} × ` : ""}${a.nome}`;
      const partes: string[] = [];
      if (a.bonus != null) partes.push(`ataque ${sinal(a.bonus)}`);
      if (a.dano) partes.push(`dano ${a.dano}`); // dice:true detecta a expressão
      return { name: nome, desc: partes.join(", ") };
    });

  const habilidades = (m.habilidades ?? [])
    .filter((h) => h && h.nome)
    .map((h) => ({ name: h.nome, desc: h.desc ?? "" }));

  const fs: FSMonster = {
    name: m.nome,
    source: "Old Dragon 2 SRD",
    layout: "Old Dragon 2",
  };
  if (m.tipo) fs.type = m.tipo;
  if (m.tamanho) fs.size = m.tamanho;
  if (m.alinhamento) fs.alignment = m.alinhamento;
  const ac = numOuUndef(m.ca);
  if (ac != null) fs.ac = ac;
  if (m.pv != null) fs.hp = m.pv;
  const hd = dvParaHitDice(m.dv);
  if (hd) fs.hit_dice = hd;
  if (m.dv != null) fs.dv = String(m.dv);
  if (movimento) fs.speed = movimento;
  if (m.jp != null) fs.jp = m.jp;
  if (m.moral != null) fs.moral = m.moral;
  if (m.xp != null) fs.xp = m.xp;
  if (m.encontro) fs.encontro = String(m.encontro);
  if (m.tesouro) fs.tesouro = String(m.tesouro);
  if (m.habitat) fs.habitat = String(m.habitat);
  if (m.descricao) fs.descricao = String(m.descricao);
  if (actions.length) fs.actions = actions;
  if (habilidades.length) fs.habilidades = habilidades;
  return fs;
}

// Layout do Fantasy Statblocks que renderiza os campos do OD2 na ordem do SRD.
// Formato espelha o "Basic 5e Layout" do FS (blocos inline/group/property/traits).
// `conditioned: true` = só renderiza se o campo existir; `hasRule` = linha após.
export const OD2_LAYOUT = {
  id: "old-dragon-2-layout",
  name: "Old Dragon 2",
  edited: false,
  blocks: [
    {
      type: "inline",
      id: "od2-head",
      properties: [],
      hasRule: true,
      nested: [
        {
          type: "group",
          id: "od2-ident",
          properties: ["name", "size", "type", "alignment"],
          nested: [
            { type: "heading", id: "od2-name", properties: ["name"], conditioned: true, size: 1 },
            { type: "subheading", id: "od2-sub", properties: ["size", "type", "alignment"], conditioned: true },
          ],
          conditioned: true,
        },
      ],
    },
    { type: "text", id: "od2-desc", properties: ["descricao"], conditioned: true, text: null },
    {
      type: "group",
      id: "od2-combate",
      properties: ["ac", "hp", "dv", "speed"],
      nested: [
        { type: "property", id: "od2-ca", properties: ["ac"], display: "CA", conditioned: true },
        {
          type: "property",
          id: "od2-pv",
          properties: ["hp"],
          display: "PV",
          dice: true,
          diceProperty: "hit_dice",
          diceCallback: 'return [{ text: monster["hit_dice"] }]',
          conditioned: true,
        },
        { type: "property", id: "od2-dv", properties: ["dv"], display: "DV", conditioned: true },
        { type: "property", id: "od2-mov", properties: ["speed"], display: "Movimento", conditioned: true },
      ],
      hasRule: true,
      conditioned: true,
    },
    {
      type: "group",
      id: "od2-meta",
      properties: ["jp", "moral", "xp", "encontro", "tesouro", "habitat"],
      nested: [
        { type: "property", id: "od2-jp", properties: ["jp"], display: "JP", conditioned: true },
        { type: "property", id: "od2-moral", properties: ["moral"], display: "Moral", conditioned: true },
        { type: "property", id: "od2-xp", properties: ["xp"], display: "XP", conditioned: true },
        { type: "property", id: "od2-enc", properties: ["encontro"], display: "Encontro", conditioned: true },
        { type: "property", id: "od2-tes", properties: ["tesouro"], display: "Tesouro", conditioned: true },
        { type: "property", id: "od2-hab", properties: ["habitat"], display: "Habitat", conditioned: true },
      ],
      hasRule: true,
      conditioned: true,
    },
    { type: "traits", id: "od2-ataques", properties: ["actions"], heading: "Ataques", conditioned: true, dice: true },
    { type: "traits", id: "od2-habilidades", properties: ["habilidades"], heading: "Habilidades", conditioned: true, dice: true },
  ],
};

// Nota com o passo a passo de import (gerada junto dos dois JSON).
export const INSTRUCOES_FS = [
  "---",
  "od2_compendio: true",
  "---",
  "",
  "# Importar o bestiário OD2 no Fantasy Statblocks",
  "",
  "O comando **“Exportar bestiário para Fantasy Statblocks (JSON)”** gerou dois arquivos nesta pasta:",
  "",
  "- `Layout Old Dragon 2 (import Layout).json` — o layout que mostra CA, PV, DV, JP, Moral, XP, Encontro e Tesouro.",
  "- `Bestiário OD2 (import Generic JSON).json` — todas as criaturas do compêndio.",
  "",
  "## Passo a passo (uma vez)",
  "",
  "1. **Importe o layout primeiro.** Configurações → *Fantasy Statblocks* → aba **Layouts** → **Import** → escolha `Layout Old Dragon 2 (import Layout).json`.",
  "2. **Importe as criaturas.** Configurações → *Fantasy Statblocks* → seção de **import** → **Generic JSON** → escolha `Bestiário OD2 (import Generic JSON).json`.",
  "",
  "As criaturas entram no *Bestiary* com a fonte **Old Dragon 2 SRD** e já usam o layout Old Dragon 2.",
  "Depois disso elas aparecem na busca do FS, no Initiative Tracker e no construtor de encontros.",
  "",
  "> Reexecutar o comando **regenera** os dois JSON; basta reimportar para atualizar.",
  "",
].join("\n");
