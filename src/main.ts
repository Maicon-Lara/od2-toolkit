import {
  App,
  MarkdownPostProcessorContext,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  TFolder,
  normalizePath,
  parseYaml,
  stringifyYaml,
} from "obsidian";
import {
  ClasseDef,
  FichaData,
  PovoDef,
  jpFinal,
  magiasExtras,
  mod,
  num,
  sinal,
} from "./od2";
import { BASE_CLASSES, BASE_POVOS } from "./basedata";
import { BESTIARIO } from "./srd/bestiario";
import { HUMANOIDES } from "./srd/humanoides";
import { ARMADURAS, ARMAS, ITENS_GERAIS, SISTEMA_MONETARIO } from "./srd/equipamento";
import { MAGIAS_ARCANAS, MAGIAS_DIVINAS, MAGIAS_EXCLUSIVAS } from "./srd/magias";
import { ITENS_MAGICOS } from "./srd/itens-magicos";
import {
  notaArmaduras,
  notaArmas,
  notaClasse,
  notaEquipamento,
  notaFormulasDiceRoller,
  notaIndice,
  notaItens,
  notaItensMagicos,
  notaMagias,
  notaMonstro,
  notaPovo,
} from "./compendio";
import { avaliarAtaque, avaliarTeste, rollDie, rollExpr } from "./roller";

interface OD2Settings {
  mostrarCalculo: boolean;
  pastaCompendio: string;
  dados3d: boolean;
}
const DEFAULT_SETTINGS: OD2Settings = {
  mostrarCalculo: true,
  pastaCompendio: "Compêndio OD2",
  dados3d: true,
};

const norm = (x: unknown): string => String(x ?? "").trim().toLowerCase();
const atLevel = (arr: number[] | undefined, nivel: number): number | undefined =>
  Array.isArray(arr) && arr.length ? arr[Math.min(Math.max(nivel, 1), arr.length) - 1] : undefined;

// Renderiza marcação mínima (<b>/<i>) como nós DOM seguros, sem innerHTML
// (a revisão de plugins do Obsidian desaconselha innerHTML por segurança).
function setRich(el: HTMLElement, markup: string): void {
  el.empty();
  const re = /<(b|i)>([\s\S]*?)<\/\1>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markup)) !== null) {
    if (m.index > last) el.appendText(markup.slice(last, m.index));
    el.createEl(m[1] as "b" | "i", { text: m[2] });
    last = m.index + m[0].length;
  }
  if (last < markup.length) el.appendText(markup.slice(last));
}

// Campo de um formulário simples (modal de adicionar/editar).
interface CampoForm {
  key: string;
  label: string;
  type?: "text" | "number";
  value?: string | number;
  placeholder?: string;
}

// Modal genérico de formulário: coleta os campos e devolve os valores no onSubmit.
class OD2FormModal extends Modal {
  private valores: Record<string, string> = {};
  constructor(
    app: App,
    private titulo: string,
    private campos: CampoForm[],
    private onSubmit: (vals: Record<string, string>) => void,
  ) {
    super(app);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: this.titulo });
    const submit = () => {
      this.close();
      this.onSubmit(this.valores);
    };
    for (const f of this.campos) {
      this.valores[f.key] = f.value != null ? String(f.value) : "";
      new Setting(contentEl).setName(f.label).addText((t) => {
        if (f.type === "number") t.inputEl.type = "number";
        if (f.placeholder) t.setPlaceholder(f.placeholder);
        t.setValue(this.valores[f.key]);
        t.onChange((v) => (this.valores[f.key] = v));
        t.inputEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        });
      });
    }
    new Setting(contentEl).addButton((b) =>
      b.setButtonText("Salvar").setCta().onClick(submit),
    );
  }
  onClose() {
    this.contentEl.empty();
  }
}

const SKELETON = [
  "```od2-ficha",
  "nome: Novo Personagem",
  "retrato: ",
  "povo: ",
  "classe: ",
  "nivel: 1",
  "alinhamento: Neutro",
  "forca: 10",
  "destreza: 10",
  "constituicao: 10",
  "inteligencia: 10",
  "sabedoria: 10",
  "carisma: 10",
  "pv_max: 8",
  "pv_atual: 8",
  "ca_base: 10",
  "bonus_armadura: 0",
  "bonus_escudo: 0",
  "outros_ca: 0",
  "po: 0",
  "ataques:",
  "  - nome: Espada longa",
  "    bonus: 1",
  "    dano: 1d8",
  "```",
  "",
].join("\n");

interface MonstroData {
  nome?: string;
  tipo?: string;
  tamanho?: string;
  alinhamento?: string;
  habitat?: string;
  descricao?: string;
  encontro?: string;
  xp?: number | string;
  tesouro?: string;
  movimento?: string;
  dv?: string | number;
  pv?: number;
  ca?: number;
  jp?: number;
  moral?: number;
  ataques?: Array<{ nome?: string; qtd?: number; bonus?: number; dano?: string }>;
  habilidades?: Array<{ nome?: string; desc?: string }>;
}

const SKELETON_MONSTRO = [
  "```od2-monstro",
  "nome: Goblin",
  "tipo: Humanoide",
  "tamanho: Pequeno",
  "alinhamento: Caótico",
  "habitat: Cavernas e ruínas",
  "descricao: Pequeno humanoide covarde que ataca em bandos.",
  "encontro: 2d4 (6d10)",
  "xp: 15",
  "tesouro: incomum",
  "movimento: 9",
  "dv: 1",
  "pv: 5",
  "ca: 13",
  "jp: 5",
  "moral: 7",
  "ataques:",
  "  - { nome: Arma pequena, qtd: 1, bonus: 1, dano: 1d6 }",
  "habilidades:",
  "  - { nome: Visão no escuro, desc: enxerga no escuro a 18m }",
  "```",
  "",
].join("\n");

// Rola PV a partir dos Dados de Vida (DV em d8; ½ = 1d4).
function rolarPVdeDV(dv: string | number): { total: number; rolls: number[] } {
  const s = String(dv).trim();
  if (s === "½" || s === "1/2") return { total: rollDie(4), rolls: [] };
  const m = s.match(/^(\d+)\s*([+-]\d+)?/);
  if (!m) return { total: 0, rolls: [] };
  const n = parseInt(m[1], 10);
  const bonus = m[2] ? parseInt(m[2], 10) : 0;
  const rolls: number[] = [];
  let total = bonus;
  for (let i = 0; i < n; i++) {
    const r = rollDie(8);
    rolls.push(r);
    total += r;
  }
  return { total: Math.max(1, total), rolls };
}

export default class OD2Plugin extends Plugin {
  settings: OD2Settings = DEFAULT_SETTINGS;
  private classes = new Map<string, ClasseDef>();
  private povos = new Map<string, PovoDef>();

  async onload() {
    await this.loadSettings();

    this.app.workspace.onLayoutReady(() => this.buildIndex());
    this.registerEvent(this.app.metadataCache.on("resolved", () => this.buildIndex()));

    this.registerMarkdownCodeBlockProcessor("od2-ficha", (source, el, ctx) => {
      let data: FichaData = {};
      try {
        data = (parseYaml(source) as FichaData) ?? {};
      } catch (e) {
        el.createEl("pre", { text: "Erro no YAML da ficha OD2:\n" + (e as Error).message });
        return;
      }
      this.renderFicha(el, data, ctx);
    });

    this.registerMarkdownCodeBlockProcessor("od2-monstro", (source, el) => {
      let m: MonstroData = {};
      try {
        m = (parseYaml(source) as MonstroData) ?? {};
      } catch (e) {
        el.createEl("pre", { text: "Erro no YAML do monstro OD2:\n" + (e as Error).message });
        return;
      }
      this.renderMonstro(el, m);
    });

    this.addCommand({
      id: "inserir-ficha-od2",
      name: "Inserir ficha de personagem (OD2)",
      editorCallback: (editor) => editor.replaceSelection(SKELETON),
    });

    this.addCommand({
      id: "inserir-monstro-od2",
      name: "Inserir statblock de monstro (OD2)",
      editorCallback: (editor) => editor.replaceSelection(SKELETON_MONSTRO),
    });

    this.addCommand({
      id: "gerar-compendio-od2",
      name: "Gerar compêndio OD2 (SRD)",
      callback: () => this.gerarCompendio(),
    });

    this.addSettingTab(new OD2SettingTab(this.app, this));
  }

  // Varre o vault e indexa definições de classe/povo pelo frontmatter.
  private buildIndex() {
    this.classes.clear();
    this.povos.clear();
    // Semeia com as classes/raças-base do OD2 (embutidas); notas do vault sobrescrevem.
    for (const c of BASE_CLASSES) this.classes.set(norm(c.nome), c);
    for (const p of BASE_POVOS) this.povos.set(norm(p.nome), p);
    for (const f of this.app.vault.getMarkdownFiles()) {
      const fm = this.app.metadataCache.getFileCache(f)?.frontmatter as Record<string, unknown> | undefined;
      if (!fm) continue;
      if (fm["od2-classe"]) {
        this.classes.set(norm(fm["od2-classe"]), { nome: String(fm["od2-classe"]), ...fm } as ClasseDef);
      }
      if (fm["od2-povo"]) {
        this.povos.set(norm(fm["od2-povo"]), { nome: String(fm["od2-povo"]), ...fm } as PovoDef);
      }
    }
  }

  private renderFicha(el: HTMLElement, d: FichaData, ctx: MarkdownPostProcessorContext) {
    const root = el.createDiv({ cls: "od2-ficha" });
    const nivel = num(d.nivel, 1);
    const classeDef = this.classes.get(norm(d.classe));
    const povoDef = this.povos.get(norm(d.povo));
    const rb = povoDef?.bonus ?? {};

    // Bônus de classe por nível (somados até o nível atual).
    const cb = { jpd: 0, jpc: 0, jps: 0, ba: 0, ca: 0 };
    for (const b of classeDef?.bonus_por_nivel ?? []) {
      if (num(b.nivel, 1) <= nivel) {
        cb.jpd += num(b.jpd);
        cb.jpc += num(b.jpc);
        cb.jps += num(b.jps);
        cb.ba += num(b.ba);
        cb.ca += num(b.ca);
      }
    }

    // Auto-preenchimento (override manual da ficha) + bônus de raça/classe.
    const baAuto = atLevel(classeDef?.ba, nivel);
    const jpBaseAuto = atLevel(classeDef?.jp, nivel);
    const ba = d.ba != null ? num(d.ba) : (baAuto ?? 0) + num(rb.ba) + cb.ba;
    const jpdBase = d.jpd != null ? num(d.jpd) : (jpBaseAuto ?? 0) + num(rb.jpd) + cb.jpd;
    const jpcBase = d.jpc != null ? num(d.jpc) : (jpBaseAuto ?? 0) + num(rb.jpc) + cb.jpc;
    const jpsBase = d.jps != null ? num(d.jps) : (jpBaseAuto ?? 0) + num(rb.jps) + cb.jps;
    let desloc = d.deslocamento != null ? num(d.deslocamento) : num(rb.deslocamento ?? povoDef?.deslocamento, 9);

    // Carga: capacidade = maior entre FOR e CON (+5 com mochila); excesso = sobrecarga.
    const equip = Array.isArray(d.equipamento) ? d.equipamento : [];
    const cargaTotal = equip.reduce((acc, it) => acc + num(it?.carga), 0);
    const capacidade = Math.max(num(d.forca, 10), num(d.constituicao, 10)) + (d.mochila ? 5 : 0);
    const sobrecarga = cargaTotal > capacidade;
    if (sobrecarga) desloc = Math.max(0, desloc - 3);

    // --- Cabeçalho (retrato + identificação) ---
    const headRow = root.createDiv({ cls: "od2-header-row" });
    const retratoSrc = d.retrato ? this.resolveImg(String(d.retrato), ctx.sourcePath) : null;
    if (retratoSrc) {
      const fig = headRow.createDiv({ cls: "od2-portrait" });
      fig.createEl("img", { attr: { src: retratoSrc, alt: d.nome || "Retrato" } });
    }
    const head = headRow.createDiv({ cls: "od2-head" });
    head.createEl("h2", { text: d.nome || "Personagem", cls: "od2-name" });
    const sub = [
      d.povo && `Povo: ${d.povo}`,
      d.classe && `Classe: ${d.classe}`,
      d.nivel != null && `Nível ${d.nivel}`,
      d.alinhamento,
    ]
      .filter(Boolean)
      .join("  ·  ");
    if (sub) head.createDiv({ cls: "od2-sub", text: sub });
    if (d.jogador) head.createDiv({ cls: "od2-sub", text: `Jogador: ${d.jogador}` });

    const out = root.createDiv({ cls: "od2-out", text: "Clique em um botão para rolar." });
    const showResult = (html: string, ok?: boolean | null) => {
      out.empty();
      out.toggleClass("ok", ok === true);
      out.toggleClass("fail", ok === false);
      setRich(out, html);
    };

    // Seletor de ajuste (OD2): Fácil +2, Difícil −2, etc. Aplica à próxima rolagem.
    let ajuste = 0;
    const ctrl = root.createDiv({ cls: "od2-ajuste" });
    ctrl.createSpan({ cls: "od2-ajuste-label", text: "Ajuste: " });
    const sel = ctrl.createEl("select", { cls: "od2-ajuste-sel" });
    const ajustes: Array<[string, number]> = [
      ["Normal", 0],
      ["Fácil +2", 2],
      ["Muito Fácil +5", 5],
      ["Difícil −2", -2],
      ["Muito Difícil −5", -5],
    ];
    for (const [lab, val] of ajustes) {
      const o = sel.createEl("option", { text: lab });
      o.value = String(val);
    }
    sel.onchange = () => {
      ajuste = Number(sel.value) || 0;
    };
    const ajusteTxt = () => (ajuste ? ` <i>(ajuste ${sinal(ajuste)})</i>` : "");

    // --- Atributos ---
    const grid = root.createDiv({ cls: "od2-attrs" });
    const attrs: Array<[string, keyof FichaData]> = [
      ["FOR", "forca"],
      ["DES", "destreza"],
      ["CON", "constituicao"],
      ["INT", "inteligencia"],
      ["SAB", "sabedoria"],
      ["CAR", "carisma"],
    ];
    for (const [label, key] of attrs) {
      const v = num(d[key], 10);
      const card = grid.createDiv({ cls: "od2-attr" });
      card.createDiv({ cls: "od2-attr-label", text: label });
      card.createDiv({ cls: "od2-attr-val", text: String(v) });
      card.createDiv({ cls: "od2-attr-mod", text: sinal(mod(v)) });
      const btn = card.createEl("button", { cls: "od2-roll", text: "teste" });
      btn.onclick = () =>
        this.rolarD20(out, (d20) => {
          const alvo = v + ajuste;
          const r = avaliarTeste(d20, alvo);
          return {
            html:
              `<b>${label}</b> — 1d20 = <b>${r.d20}</b> (≤ ${alvo})${ajusteTxt()} → ${r.sucesso ? "✅ sucesso" : "❌ falha"}` +
              (r.critico ? ` <i>(${r.critico} crítico)</i>` : ""),
            ok: r.sucesso,
          };
        });
    }

    // --- Combate ---
    const comb = root.createDiv({ cls: "od2-section" });
    comb.createEl("h3", { text: "Combate" });
    const caBaseEff = rb.ca_base != null ? num(rb.ca_base) : num(d.ca_base, 10);
    const ca =
      caBaseEff +
      mod(d.destreza) +
      num(d.bonus_armadura) +
      num(d.bonus_escudo) +
      num(d.outros_ca) +
      num(rb.ca) +
      cb.ca;
    const ac = ba + mod(d.forca);
    const ad = ba + mod(d.destreza);
    const stats = comb.createDiv({ cls: "od2-stats" });
    const stat = (label: string, value: string) => {
      const s = stats.createDiv({ cls: "od2-stat" });
      s.createSpan({ cls: "od2-stat-label", text: label });
      s.createSpan({ cls: "od2-stat-value", text: value });
    };
    stat("CA", String(ca));
    stat("BA", sinal(ba));
    stat("Desloc.", `${desloc} m`);

    const atkRow = comb.createDiv({ cls: "od2-btn-row" });
    const mkAtk = (label: string, bonus: number) => {
      const b = atkRow.createEl("button", { cls: "od2-roll", text: `${label} (${sinal(bonus)})` });
      b.onclick = () =>
        this.rolarD20(out, (d20) => {
          const total = bonus + ajuste;
          const r = avaliarAtaque(d20, total, null);
          const crit =
            r.critico === "acerto"
              ? " — 🎯 <b>Acerto Crítico!</b> (dano dobrado)"
              : r.critico === "erro"
                ? " — 💥 <b>Erro Crítico!</b>"
                : "";
          return {
            html: `<b>${label}</b> — 1d20 (${r.d20}) ${sinal(total)} = <b>${r.total}</b>${ajusteTxt()}  <i>vs CA do alvo</i>${crit}`,
            ok: r.critico === "acerto" ? true : r.critico === "erro" ? false : null,
          };
        });
    };
    mkAtk("Corpo a corpo", ac);
    mkAtk("À distância", ad);

    if (this.temInitiativeTracker()) {
      const itBtn = atkRow.createEl("button", { cls: "od2-roll od2-it", text: "⚔️ + Initiative Tracker" });
      itBtn.onclick = () =>
        this.adicionarAoTracker(d.nome || "Personagem", num(d.pv_atual, num(d.pv_max)), ca, mod(d.destreza));
    }

    if (this.settings.mostrarCalculo) {
      const fonte = classeDef ? ` · BA/JP de ${classeDef.nome} (nível ${nivel})` : "";
      const extraCa = num(d.outros_ca) + num(rb.ca) + cb.ca;
      comb.createDiv({
        cls: "od2-calc",
        text: `CA = ${caBaseEff} ${sinal(mod(d.destreza))} (DES) + ${num(d.bonus_armadura)} arm. + ${num(d.bonus_escudo)} esc.${extraCa ? ` + ${extraCa} outros` : ""}${fonte}`,
      });
    }

    // --- Ataques listados (com adicionar/editar/remover) ---
    {
      const sec = root.createDiv({ cls: "od2-section" });
      const sh = sec.createDiv({ cls: "od2-sec-head" });
      sh.createEl("h3", { text: "Ataques" });
      const addBtn = sh.createEl("button", { cls: "od2-roll od2-add", text: "+ ataque" });
      addBtn.onclick = () =>
        new OD2FormModal(
          this.app,
          "Novo ataque",
          [
            { key: "nome", label: "Nome", placeholder: "Espada longa" },
            { key: "bonus", label: "Bônus de ataque", type: "number", value: ac },
            { key: "dano", label: "Dano", placeholder: "1d8+2" },
          ],
          (v) =>
            this.rewriteFicha(ctx, el, (data) => {
              const arr = Array.isArray(data.ataques) ? data.ataques : [];
              arr.push({ nome: v.nome || "Ataque", bonus: num(v.bonus), dano: v.dano || "" });
              data.ataques = arr;
            }),
        ).open();

      const ataques = Array.isArray(d.ataques) ? d.ataques : [];
      if (!ataques.length) {
        sec.createDiv({ cls: "od2-calc", text: "Nenhum ataque. Use “+ ataque” para adicionar." });
      }
      ataques.forEach((a, i) => {
        const row = sec.createDiv({ cls: "od2-atk" });
        row.createSpan({ cls: "od2-atk-name", text: a.nome || "—" });
        const atkBonus = num(a.bonus);
        const ba2 = row.createEl("button", { cls: "od2-roll", text: `atacar (${sinal(atkBonus)})` });
        ba2.onclick = () =>
          this.rolarD20(out, (d20) => {
            const total = atkBonus + ajuste;
            const r = avaliarAtaque(d20, total, null);
            const crit =
              r.critico === "acerto"
                ? " — 🎯 <b>Acerto Crítico!</b>"
                : r.critico === "erro"
                  ? " — 💥 <b>Erro Crítico!</b>"
                  : "";
            return {
              html: `<b>${a.nome}</b> — ataque: 1d20 (${r.d20}) ${sinal(total)} = <b>${r.total}</b>${ajusteTxt()}${crit}`,
              ok: r.critico === "acerto" ? true : r.critico === "erro" ? false : null,
            };
          });
        if (a.dano) {
          const bd = row.createEl("button", { cls: "od2-roll od2-dmg", text: `dano (${a.dano})` });
          bd.onclick = () => this.rolarDano(out, a.nome || "Ataque", String(a.dano), ctx.sourcePath);
        }
        const edit = row.createEl("button", { cls: "od2-mini", text: "✎", attr: { title: "Editar" } });
        edit.onclick = () =>
          new OD2FormModal(
            this.app,
            "Editar ataque",
            [
              { key: "nome", label: "Nome", value: a.nome ?? "" },
              { key: "bonus", label: "Bônus de ataque", type: "number", value: num(a.bonus) },
              { key: "dano", label: "Dano", value: a.dano ?? "" },
            ],
            (v) =>
              this.rewriteFicha(ctx, el, (data) => {
                if (Array.isArray(data.ataques) && data.ataques[i]) {
                  data.ataques[i] = { nome: v.nome || "Ataque", bonus: num(v.bonus), dano: v.dano || "" };
                }
              }),
          ).open();
        const del = row.createEl("button", { cls: "od2-mini od2-del", text: "✕", attr: { title: "Remover" } });
        del.onclick = () =>
          this.rewriteFicha(ctx, el, (data) => {
            if (Array.isArray(data.ataques)) data.ataques.splice(i, 1);
          });
      });
    }

    // --- Jogadas de Proteção ---
    const jp = root.createDiv({ cls: "od2-section" });
    jp.createEl("h3", { text: "Jogadas de Proteção" });
    const jpRows: Array<[string, number, keyof FichaData]> = [
      ["JPD — esquiva", jpdBase, "destreza"],
      ["JPC — vigor", jpcBase, "constituicao"],
      ["JPS — firmeza", jpsBase, "sabedoria"],
    ];
    for (const [label, base, attrKey] of jpRows) {
      const final = jpFinal(base, d[attrKey]);
      const row = jp.createDiv({ cls: "od2-jp" });
      row.createSpan({ cls: "od2-jp-label", text: label });
      row.createSpan({ cls: "od2-jp-val", text: `role ≤ ${final}` });
      const b = row.createEl("button", { cls: "od2-roll", text: "rolar" });
      b.onclick = () =>
        this.rolarD20(out, (d20) => {
          const alvo = final + ajuste;
          const r = avaliarTeste(d20, alvo);
          return {
            html: `<b>${label}</b> — 1d20 = <b>${r.d20}</b> (≤ ${alvo})${ajusteTxt()} → ${r.sucesso ? "✅ sucesso" : "❌ falha"}`,
            ok: r.sucesso,
          };
        });
    }

    // --- Magias por dia (classes conjuradoras) ---
    const magiasNivel = classeDef?.magias?.[Math.min(nivel, classeDef.magias.length) - 1];
    if (magiasNivel && magiasNivel.some((n) => n > 0)) {
      const prep: Record<string, string[]> =
        d.magias_preparadas && typeof d.magias_preparadas === "object"
          ? (d.magias_preparadas as Record<string, string[]>)
          : {};
      const magicAttr =
        classeDef?.base === "Clérigo"
          ? d.sabedoria
          : classeDef?.base === "Mago"
            ? d.inteligencia
            : undefined;
      const extras = magicAttr != null ? magiasExtras(magicAttr) : [0, 0, 0];
      const sec = root.createDiv({ cls: "od2-section od2-magias-sec" });
      sec.createEl("h3", { text: "Magias por dia" });
      magiasNivel.forEach((qtd, i) => {
        if (qtd <= 0) return;
        const circ = i + 1;
        const extra = i < 3 ? num(extras[i]) : 0;
        const total = qtd + extra;
        const block = sec.createDiv({ cls: "od2-magia-circulo" });
        block.createDiv({
          cls: "od2-magia-circ-titulo",
          text: `${circ}º círculo — ${total} espaço(s)` + (extra ? ` (${qtd} + ${extra} por atributo)` : ""),
        });
        const salvas = Array.isArray(prep[String(circ)]) ? prep[String(circ)] : [];
        for (let j = 0; j < total; j++) {
          const inp = block.createEl("input", {
            cls: "od2-magia-input",
            attr: { type: "text", placeholder: `${circ}º círculo — espaço ${j + 1}` },
          });
          inp.value = salvas[j] ?? "";
          inp.dataset.circ = String(circ);
          inp.dataset.idx = String(j);
          inp.addEventListener("change", () => this.saveMagias(ctx, el));
        }
      });
    }

    // --- Poderes (povo + classe, automáticos) ---
    const poderesPovo = (povoDef?.habilidades ?? []).filter((h) => h && h.nome);
    const poderesClasse = (classeDef?.poderes ?? []).filter(
      (p) => p && p.nome && num(p.nivel, 1) <= nivel,
    );
    if (poderesPovo.length || poderesClasse.length) {
      const sec = root.createDiv({ cls: "od2-section od2-poderes" });
      sec.createEl("h3", { text: "Poderes" });
      if (poderesPovo.length) {
        sec.createEl("h4", { text: `Povo — ${povoDef?.nome ?? d.povo}` });
        const ul = sec.createEl("ul");
        for (const h of poderesPovo) {
          const li = ul.createEl("li");
          li.createEl("b", { text: h.nome! });
          if (h.desc) li.appendText(` — ${h.desc}`);
        }
      }
      if (poderesClasse.length) {
        sec.createEl("h4", { text: `Classe — ${classeDef?.nome ?? d.classe}` });
        const ul = sec.createEl("ul");
        for (const p of poderesClasse) {
          const li = ul.createEl("li");
          li.createSpan({ cls: "od2-nivel", text: `[${num(p.nivel, 1)}º] ` });
          li.createEl("b", { text: p.nome! });
          if (p.desc) li.appendText(` — ${p.desc}`);
          const melhorias = (p.melhorias ?? []).filter(
            (m) => m && m.desc && num(m.nivel, 1) <= nivel,
          );
          if (melhorias.length) {
            const sub = li.createEl("ul", { cls: "od2-melhorias" });
            for (const m of melhorias) {
              const sli = sub.createEl("li");
              sli.createSpan({ cls: "od2-nivel", text: `${num(m.nivel, 1)}º: ` });
              sli.appendText(m.desc!);
            }
          }
        }
      }
    } else if (d.povo || d.classe) {
      root
        .createDiv({ cls: "od2-section" })
        .createDiv({
          cls: "od2-calc",
          text: "Poderes não encontrados. Crie notas de definição (frontmatter od2-povo / od2-classe) em Sistema/ para o povo/classe desta ficha.",
        });
    }

    // --- Talentos / Perícias (Ladrão e especializações) ---
    if (classeDef?.talentos?.length) {
      const talentos = classeDef.talentos;
      const attrSel = classeDef.talentos_atributo ?? "destreza";
      const attrMod =
        attrSel === "carisma"
          ? mod(d.carisma)
          : attrSel === "maior"
            ? Math.max(mod(d.destreza), mod(d.carisma))
            : mod(d.destreza);
      const niveisGanho = [3, 6, 10].filter((l) => l <= nivel).length;
      const distribuir = 2 + attrMod + 2 * niveisGanho; // pontos acima do piso (2 por talento)
      const pontos: Record<string, number> =
        d.talentos_pontos && typeof d.talentos_pontos === "object"
          ? (d.talentos_pontos as Record<string, number>)
          : {};
      const sec = root.createDiv({ cls: "od2-section od2-talentos" });
      sec.createEl("h3", { text: "Talentos" });
      let usados = 0;
      for (const t of talentos) {
        const val = pontos[t] != null ? num(pontos[t], 2) : 2;
        usados += Math.max(0, val - 2);
        const row = sec.createDiv({ cls: "od2-talento" });
        row.createSpan({ cls: "od2-talento-nome", text: t });
        const inp = row.createEl("input", {
          cls: "od2-talento-input",
          attr: { type: "number", min: "2", max: "5" },
        });
        inp.value = String(val);
        inp.dataset.talento = t;
        inp.addEventListener("change", () => this.saveTalentos(ctx, el));
      }
      const restam = distribuir - usados;
      const fonteAttr =
        attrSel === "maior" ? "maior mod. DES/CAR" : attrSel === "carisma" ? "mod. CAR" : "mod. DES";
      const resumo = sec.createDiv({ cls: restam < 0 ? "od2-out fail" : "od2-calc" });
      setRich(
        resumo,
        `Pontos para distribuir (acima do piso 2): <b>${distribuir}</b> ` +
        `(2 + ${attrMod} ${fonteAttr}${niveisGanho ? ` + ${2 * niveisGanho} por níveis 3/6/10` : ""})` +
        ` · usados ${usados} · <b>restam ${restam}</b>` +
        (restam < 0 ? " — ⚠️ acima do limite" : ""),
      );
    }

    // --- Equipamento e Carga (com adicionar/editar/remover) ---
    {
      const sec = root.createDiv({ cls: "od2-section" });
      const sh = sec.createDiv({ cls: "od2-sec-head" });
      sh.createEl("h3", { text: "Equipamento e Carga" });
      const addBtn = sh.createEl("button", { cls: "od2-roll od2-add", text: "+ item" });
      addBtn.onclick = () =>
        new OD2FormModal(
          this.app,
          "Novo item",
          [
            { key: "nome", label: "Item", placeholder: "Corda (15 m)" },
            { key: "carga", label: "Carga", type: "number", value: 1 },
          ],
          (v) =>
            this.rewriteFicha(ctx, el, (data) => {
              const arr = Array.isArray(data.equipamento) ? data.equipamento : [];
              arr.push({ nome: v.nome || "Item", carga: num(v.carga) });
              data.equipamento = arr;
            }),
        ).open();

      if (equip.length) {
        equip.forEach((it, i) => {
          const row = sec.createDiv({ cls: "od2-atk" });
          row.createSpan({ cls: "od2-atk-name", text: it?.nome ?? "—" });
          row.createSpan({ cls: "od2-calc", text: `carga ${num(it?.carga)}` });
          const edit = row.createEl("button", { cls: "od2-mini", text: "✎", attr: { title: "Editar" } });
          edit.onclick = () =>
            new OD2FormModal(
              this.app,
              "Editar item",
              [
                { key: "nome", label: "Item", value: it?.nome ?? "" },
                { key: "carga", label: "Carga", type: "number", value: num(it?.carga) },
              ],
              (v) =>
                this.rewriteFicha(ctx, el, (data) => {
                  if (Array.isArray(data.equipamento) && data.equipamento[i]) {
                    data.equipamento[i] = { nome: v.nome || "Item", carga: num(v.carga) };
                  }
                }),
            ).open();
          const del = row.createEl("button", { cls: "od2-mini od2-del", text: "✕", attr: { title: "Remover" } });
          del.onclick = () =>
            this.rewriteFicha(ctx, el, (data) => {
              if (Array.isArray(data.equipamento)) data.equipamento.splice(i, 1);
            });
        });
      } else {
        sec.createDiv({ cls: "od2-calc", text: "Nenhum item. Use “+ item” para adicionar." });
      }
      const resumo = sec.createDiv({ cls: sobrecarga ? "od2-out fail" : "od2-calc" });
      setRich(
        resumo,
        `Carga: <b>${cargaTotal}</b> / ${capacidade}${d.mochila ? " (mochila +5)" : ""}` +
          (sobrecarga ? " — ⚠️ <b>Sobrecarga!</b> −3 de deslocamento e Exausto" : ""),
      );
    }

    // --- Pontos de Vida (grava no arquivo) ---
    const pvSec = root.createDiv({ cls: "od2-section od2-pv" });
    pvSec.createEl("h3", { text: "Pontos de Vida" });
    const pvLine = pvSec.createDiv({ cls: "od2-pv-line" });
    const maxv = num(d.pv_max);
    const atual = num(d.pv_atual, maxv);
    const minus = pvLine.createEl("button", { cls: "od2-roll", text: "−" });
    pvLine.createSpan({ cls: "od2-pv-val", text: `${atual} / ${maxv}` });
    const plus = pvLine.createEl("button", { cls: "od2-roll", text: "+" });
    minus.onclick = () => this.updatePv(ctx, el, -1);
    plus.onclick = () => this.updatePv(ctx, el, +1);

    if (classeDef?.dado_vida) {
      const hd = num(classeDef.dado_vida);
      pvSec.createDiv({
        cls: "od2-calc",
        text: `Dado de vida: d${hd} (nível 1 = máximo + CON; +1d${hd} + CON por nível)`,
      });
      const rollBtn = pvSec.createEl("button", { cls: "od2-roll", text: `rolar PV (nível ${nivel})` });
      rollBtn.onclick = async () => {
        const conMod = mod(d.constituicao);
        const rolls = [hd];
        let total = hd + conMod;
        for (let l = 2; l <= nivel; l++) {
          const r = rollDie(hd);
          rolls.push(r);
          total += Math.max(1, r + conMod);
        }
        total = Math.max(nivel, total);
        await this.rewriteFicha(ctx, el, (data) => {
          data.pv_max = total;
          data.pv_atual = total;
        });
        showResult(`PV (nível ${nivel}, d${hd} ${sinal(conMod)}/nível): <b>${total}</b> [${rolls.join(", ")}]`);
      };
    }
  }

  // Resolve um retrato: wikilink [[arquivo]], caminho do vault ou URL → src utilizável.
  private resolveImg(raw: string, sourcePath: string): string | null {
    const s = String(raw).trim();
    if (!s) return null;
    const wl = s.match(/^!?\[\[([^\]|]+)(?:\|[^\]]*)?\]\]$/);
    const linkpath = wl ? wl[1].trim() : s;
    if (/^(https?:|data:|app:)/.test(linkpath)) return linkpath;
    const dest = this.app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath);
    return dest ? this.app.vault.getResourcePath(dest) : null;
  }

  private async updatePv(ctx: MarkdownPostProcessorContext, el: HTMLElement, delta: number) {
    await this.rewriteFicha(ctx, el, (d) => {
      d.pv_atual = num(d.pv_atual, num(d.pv_max)) + delta;
    });
  }

  // Coleta os nomes digitados nas magias e grava no bloco.
  private async saveMagias(ctx: MarkdownPostProcessorContext, el: HTMLElement) {
    const inputs = Array.from(el.querySelectorAll<HTMLInputElement>(".od2-magia-input"));
    const obj: Record<string, string[]> = {};
    for (const inp of inputs) {
      const c = inp.dataset.circ ?? "0";
      const j = Number(inp.dataset.idx ?? 0);
      if (!obj[c]) obj[c] = [];
      obj[c][j] = inp.value;
    }
    for (const c of Object.keys(obj)) {
      for (let k = 0; k < obj[c].length; k++) if (obj[c][k] == null) obj[c][k] = "";
    }
    await this.rewriteFicha(ctx, el, (d) => {
      d.magias_preparadas = obj;
    });
  }

  // Salva os pontos gastos em cada talento no bloco.
  private async saveTalentos(ctx: MarkdownPostProcessorContext, el: HTMLElement) {
    const inputs = Array.from(el.querySelectorAll<HTMLInputElement>(".od2-talento-input"));
    const obj: Record<string, number> = {};
    for (const inp of inputs) {
      const t = inp.dataset.talento ?? "";
      let v = Number(inp.value) || 2;
      v = Math.max(2, Math.min(5, v));
      obj[t] = v;
    }
    await this.rewriteFicha(ctx, el, (d) => {
      d.talentos_pontos = obj;
    });
  }

  private renderMonstro(el: HTMLElement, m: MonstroData) {
    const root = el.createDiv({ cls: "od2-ficha od2-statblock" });
    root.createEl("h3", { cls: "od2-name", text: m.nome || "Criatura" });
    const tipo = [m.tipo, m.tamanho, m.alinhamento].filter(Boolean).join(", ");
    if (tipo || m.habitat) {
      root.createDiv({ cls: "od2-sub", text: tipo + (m.habitat ? ` ◆ ${m.habitat}` : "") });
    }
    if (m.descricao) root.createEl("p", { cls: "od2-mob-desc", text: String(m.descricao) });

    const out = root.createDiv({ cls: "od2-out", text: "Clique para rolar." });
    const showResult = (html: string, ok?: boolean | null) => {
      out.empty();
      out.toggleClass("ok", ok === true);
      out.toggleClass("fail", ok === false);
      setRich(out, html);
    };

    const stats = root.createDiv({ cls: "od2-stats" });
    const stat = (label: string, value: string) => {
      if (!value) return;
      const s = stats.createDiv({ cls: "od2-stat" });
      s.createSpan({ cls: "od2-stat-label", text: label });
      s.createSpan({ cls: "od2-stat-value", text: value });
    };
    stat("Encontro", m.encontro ? String(m.encontro) : "");
    stat("XP", m.xp != null ? String(m.xp) : "");
    stat("Tesouro", m.tesouro ? String(m.tesouro) : "");
    stat("Movimento", m.movimento ? String(m.movimento) : "");
    stat("DV [PV]", m.dv != null ? `${m.dv}${m.pv != null ? ` [${m.pv}]` : ""}` : "");
    stat("CA", m.ca != null ? String(m.ca) : "");
    stat("JP", m.jp != null ? String(m.jp) : "");
    stat("MO", m.moral != null ? String(m.moral) : "");

    if (m.dv != null) {
      const b = root.createEl("button", { cls: "od2-roll", text: "rolar PV (DV)" });
      b.onclick = () => {
        const r = rolarPVdeDV(m.dv as string | number);
        showResult(`PV: <b>${r.total}</b>${r.rolls.length ? ` [${r.rolls.join(", ")}]` : ""}`);
      };
    }

    if (this.temInitiativeTracker()) {
      const itBtn = root.createEl("button", { cls: "od2-roll od2-it", text: "⚔️ + Initiative Tracker" });
      itBtn.onclick = () => this.adicionarAoTracker(m.nome || "Criatura", num(m.pv), m.ca ?? 10, 0);
    }

    if (Array.isArray(m.ataques) && m.ataques.length) {
      const sec = root.createDiv({ cls: "od2-section" });
      sec.createEl("h4", { text: "Ataques" });
      for (const a of m.ataques) {
        const row = sec.createDiv({ cls: "od2-atk" });
        const label = `${a.qtd ? `${a.qtd} × ` : ""}${a.nome ?? "ataque"}`;
        row.createSpan({ cls: "od2-atk-name", text: label });
        const bonus = num(a.bonus);
        const ba = row.createEl("button", { cls: "od2-roll", text: `atacar (${sinal(bonus)})` });
        ba.onclick = () =>
          this.rolarD20(out, (d20) => {
            const r = avaliarAtaque(d20, bonus, null);
            const crit =
              r.critico === "acerto" ? " — 🎯 <b>Crítico!</b>" : r.critico === "erro" ? " — 💥 <b>Erro!</b>" : "";
            return {
              html: `<b>${a.nome ?? "ataque"}</b>: 1d20 (${r.d20}) ${sinal(bonus)} = <b>${r.total}</b>${crit}`,
              ok: r.critico === "acerto" ? true : r.critico === "erro" ? false : null,
            };
          });
        if (a.dano) {
          const bd = row.createEl("button", { cls: "od2-roll od2-dmg", text: `dano (${a.dano})` });
          bd.onclick = () => this.rolarDano(out, a.nome ?? "ataque", String(a.dano), "");
        }
      }
    }

    const habs = (m.habilidades ?? []).filter((h) => h && h.nome);
    if (habs.length) {
      const sec = root.createDiv({ cls: "od2-section od2-poderes" });
      sec.createEl("h4", { text: "Habilidades" });
      const ul = sec.createEl("ul");
      for (const h of habs) {
        const li = ul.createEl("li");
        li.createEl("b", { text: h.nome! });
        if (h.desc) li.appendText(` — ${h.desc}`);
      }
    }
  }

  // Lê o YAML do bloco od2-ficha, aplica `mutate` ao objeto e regrava o bloco inteiro.
  // Robusto para listas (ataques, equipamento) e mapas (magias) — evita cirurgia linha-a-linha.
  private async rewriteFicha(
    ctx: MarkdownPostProcessorContext,
    el: HTMLElement,
    mutate: (d: FichaData) => void,
  ) {
    const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
    if (!(file instanceof TFile)) {
      new Notice("OD2: arquivo não encontrado para salvar.");
      return;
    }
    const info = ctx.getSectionInfo(el);
    if (!info) {
      new Notice("OD2: bloco da ficha não localizado.");
      return;
    }
    const content = await this.app.vault.read(file);
    const lines = content.split("\n");
    // info.lineStart/lineEnd apontam para as cercas ```; o corpo fica entre elas.
    const bodyStart = info.lineStart + 1;
    const body = lines.slice(bodyStart, info.lineEnd).join("\n");
    let data: FichaData;
    try {
      data = (parseYaml(body) as FichaData) ?? {};
    } catch (e) {
      new Notice("OD2: não consegui ler o YAML da ficha para editar.");
      return;
    }
    mutate(data);
    const newBody = stringifyYaml(data).replace(/\n+$/, "");
    lines.splice(bodyStart, info.lineEnd - bodyStart, ...newBody.split("\n"));
    await this.app.vault.modify(file, lines.join("\n"));
  }

  // Cria a pasta se ainda não existir (cria também os pais, na ordem).
  private async ensureFolder(path: string) {
    const norm = normalizePath(path);
    if (this.app.vault.getAbstractFileByPath(norm) instanceof TFolder) return;
    const partes = norm.split("/");
    let acc = "";
    for (const p of partes) {
      acc = acc ? `${acc}/${p}` : p;
      if (!(this.app.vault.getAbstractFileByPath(acc) instanceof TFolder)) {
        try {
          await this.app.vault.createFolder(acc);
        } catch {
          /* já existe (corrida) — ignora */
        }
      }
    }
  }

  // Escreve a nota gerada. Só sobrescreve notas marcadas com `od2_compendio: true`;
  // preserva notas do usuário com o mesmo nome.
  private async writeNote(
    path: string,
    content: string,
  ): Promise<"criado" | "atualizado" | "pulado"> {
    const norm = normalizePath(path);
    const existing = this.app.vault.getAbstractFileByPath(norm);
    if (existing instanceof TFile) {
      const fm = this.app.metadataCache.getFileCache(existing)?.frontmatter;
      if (fm?.od2_compendio !== true) return "pulado";
      await this.app.vault.modify(existing, content);
      return "atualizado";
    }
    await this.app.vault.create(norm, content);
    return "criado";
  }

  // Gera/atualiza o compêndio (classes, povos e bestiário) a partir dos dados do SRD.
  private async gerarCompendio() {
    const base = normalizePath((this.settings.pastaCompendio || "Compêndio OD2").trim());
    const tituloIndice = base.split("/").pop() || "Compêndio OD2";
    const tally = { criado: 0, atualizado: 0, pulado: 0 };
    const conta = (r: "criado" | "atualizado" | "pulado") => tally[r]++;
    // Nome de arquivo seguro (sem caracteres inválidos de caminho, ex.: "Jumento/Mula").
    const safe = (n: string) => n.replace(/[\\/:*?"<>|]/g, "-").trim();

    try {
      await this.ensureFolder(base);
      await this.ensureFolder(`${base}/Classes`);
      await this.ensureFolder(`${base}/Povos`);
      await this.ensureFolder(`${base}/Equipamento`);
      await this.ensureFolder(`${base}/Magias`);
      await this.ensureFolder(`${base}/Bestiário`);
      await this.ensureFolder(`${base}/Humanos e Semi-humanos`);

      for (const c of BASE_CLASSES) {
        conta(await this.writeNote(`${base}/Classes/${safe(c.nome)}.md`, notaClasse(c)));
      }
      for (const p of BASE_POVOS) {
        conta(await this.writeNote(`${base}/Povos/${safe(p.nome)}.md`, notaPovo(p)));
      }

      const eq = `${base}/Equipamento`;
      conta(await this.writeNote(`${eq}/Equipamento.md`, notaEquipamento(SISTEMA_MONETARIO)));
      conta(await this.writeNote(`${eq}/Armas.md`, notaArmas(ARMAS)));
      conta(await this.writeNote(`${eq}/Armaduras.md`, notaArmaduras(ARMADURAS)));
      conta(await this.writeNote(`${eq}/Itens Gerais.md`, notaItens(ITENS_GERAIS)));

      const mag = `${base}/Magias`;
      conta(await this.writeNote(`${mag}/Magias Arcanas.md`, notaMagias("Magias Arcanas", MAGIAS_ARCANAS, MAGIAS_EXCLUSIVAS)));
      conta(await this.writeNote(`${mag}/Magias Divinas.md`, notaMagias("Magias Divinas", MAGIAS_DIVINAS)));

      conta(await this.writeNote(`${base}/Itens Mágicos.md`, notaItensMagicos(ITENS_MAGICOS)));
      conta(await this.writeNote(`${base}/Fórmulas Dice Roller.md`, notaFormulasDiceRoller()));

      for (const m of BESTIARIO) {
        const body = stringifyYaml(m);
        conta(await this.writeNote(`${base}/Bestiário/${safe(m.nome)}.md`, notaMonstro(m.nome, body)));
      }
      for (const m of HUMANOIDES) {
        const body = stringifyYaml(m);
        conta(await this.writeNote(`${base}/Humanos e Semi-humanos/${safe(m.nome)}.md`, notaMonstro(m.nome, body)));
      }

      const indice = notaIndice(tituloIndice, [
        { titulo: "Classes", nomes: BASE_CLASSES.map((c) => safe(c.nome)) },
        { titulo: "Povos", nomes: BASE_POVOS.map((p) => safe(p.nome)) },
        { titulo: "Equipamento", nomes: ["Equipamento", "Armas", "Armaduras", "Itens Gerais"] },
        { titulo: "Magias", nomes: ["Magias Arcanas", "Magias Divinas"] },
        { titulo: "Itens Mágicos", nomes: ["Itens Mágicos"] },
        { titulo: "Bestiário", nomes: BESTIARIO.map((m) => safe(m.nome)) },
        { titulo: "Humanos e Semi-humanos", nomes: HUMANOIDES.map((m) => safe(m.nome)) },
        { titulo: "Ferramentas", nomes: ["Fórmulas Dice Roller"] },
      ]);
      conta(await this.writeNote(`${base}/${tituloIndice}.md`, indice));

      new Notice(
        `Compêndio OD2 em “${base}”: ${tally.criado} criadas, ${tally.atualizado} atualizadas` +
          (tally.pulado ? `, ${tally.pulado} preservadas (suas)` : "") +
          ".",
      );
    } catch (e) {
      new Notice("OD2: erro ao gerar o compêndio — " + (e as Error).message);
    }
  }

  // --- Integrações com outros plugins (feature-detection + fallback) ---

  // Initiative Tracker disponível com a API de adicionar criaturas?
  private temInitiativeTracker(): boolean {
    const it = (this.app as any).plugins?.getPlugin?.("initiative-tracker");
    return !!(it && it.api && typeof it.api.addCreatures === "function");
  }

  // Adiciona uma criatura/PJ ao Initiative Tracker (nome, PV, CA, modificador de iniciativa).
  private adicionarAoTracker(nome: string, hp: number, ca: number | string, modifier: number) {
    const it = (this.app as any).plugins?.getPlugin?.("initiative-tracker");
    if (!it?.api?.addCreatures) {
      new Notice("Initiative Tracker não está disponível.");
      return;
    }
    try {
      const acNum = typeof ca === "number" ? ca : parseInt(String(ca), 10) || 10;
      it.api.addCreatures([
        { name: nome || "Criatura", hp: Number(hp) || 0, ac: acNum, modifier: Number(modifier) || 0 },
      ]);
      new Notice(`${nome} adicionado ao Initiative Tracker.`);
    } catch (e) {
      new Notice("OD2: falha ao adicionar ao Initiative Tracker — " + (e as Error).message);
    }
  }

  // Rola dano usando o Dice Roller (se instalado) ou o motor próprio como fallback.
  // Resolve a API de rolagem do Dice Roller (getRoller fica no plugin ou em plugin.api).
  private diceRollerApi(): any {
    const p = (this.app as any).plugins?.getPlugin?.("obsidian-dice-roller");
    if (p && typeof p.getRoller === "function") return p;
    if (p?.api && typeof p.api.getRoller === "function") return p.api;
    return null;
  }

  // Sufixo de fórmula que força a animação 3D do Dice Roller (flag |render), conforme a config.
  private renderFlag(): string {
    return this.settings.dados3d ? "|render" : "";
  }

  // Rola 1d20 pelo Dice Roller (se instalado) e aplica a interpretação OD2; senão, motor próprio.
  // Cria um widget do Dice Roller, dispara a animação 3D (como o clique do usuário no dado)
  // e, opcionalmente, mostra a interpretação OD2 ao lado. false = Dice Roller indisponível.
  private async rolarComWidget(
    out: HTMLElement,
    formula: string,
    sourcePath: string,
    onResult?: (total: number) => { html: string; ok: boolean | null },
  ): Promise<boolean> {
    const dr = this.diceRollerApi();
    if (!dr) return false;
    try {
      const roller: any = await dr.getRoller(formula + this.renderFlag(), sourcePath || "");
      if (!roller) return false;
      const interpEl = onResult ? out.createSpan({ cls: "od2-interp" }) : null;
      let aplicado = false;
      const aplicar = () => {
        const total = Number(roller?.result);
        if (!Number.isFinite(total)) return;
        aplicado = true;
        if (onResult && interpEl) {
          const { html, ok } = onResult(total);
          out.toggleClass("ok", ok === true);
          out.toggleClass("fail", ok === false);
          interpEl.empty();
          setRich(interpEl, " " + html + " ");
          interpEl.createSpan({ cls: "od2-calc", text: "· Dice Roller" });
        }
      };
      if (typeof roller.on === "function") roller.on("new-result", aplicar);
      if (roller.containerEl) {
        out.insertBefore(roller.containerEl, interpEl);
        // Dispara o 3D do jeito que o clique do usuário no dado faz (após o layout).
        window.requestAnimationFrame(() => {
          try {
            roller.containerEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          } catch {
            /* ignora */
          }
        });
        // Rede de segurança: se o clique não rolar, rola direto.
        window.setTimeout(async () => {
          if (aplicado) return;
          try {
            if (typeof roller.roll === "function") await roller.roll();
          } catch {
            /* ignora */
          }
          aplicar();
        }, 400);
        return true;
      }
      if (typeof roller.roll === "function") await roller.roll();
      aplicar();
      return Number.isFinite(Number(roller?.result));
    } catch {
      return false;
    }
  }

  private async rolarD20(
    out: HTMLElement,
    interpretar: (d20: number) => { html: string; ok: boolean | null },
  ) {
    out.empty();
    out.removeClass("ok");
    out.removeClass("fail");
    if (await this.rolarComWidget(out, "1d20", "", interpretar)) return;
    out.empty();
    const d20 = rollDie(20);
    const { html, ok } = interpretar(d20);
    out.toggleClass("ok", ok === true);
    out.toggleClass("fail", ok === false);
    setRich(out, html);
  }

  private async rolarDano(out: HTMLElement, label: string, dano: string, sourcePath: string) {
    out.empty();
    out.removeClass("ok");
    out.removeClass("fail");
    out.createSpan({ text: `${label} — dano: ` });
    if (await this.rolarComWidget(out, String(dano), sourcePath)) return;
    out.empty();
    const r = rollExpr(String(dano));
    setRich(
      out,
      `<b>${label}</b> — dano: ${dano} = <b>${r.total}</b>` +
        (r.rolls.length ? ` <i>[${r.rolls.join(", ")}]</i>` : ""),
    );
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class OD2SettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: OD2Plugin,
  ) {
    super(app, plugin);
  }
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName("Mostrar detalhes de cálculo")
      .setDesc("Exibe a fórmula da CA e a fonte de BA/JP na ficha.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.mostrarCalculo).onChange(async (v) => {
          this.plugin.settings.mostrarCalculo = v;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName("Pasta do compêndio")
      .setDesc('Onde o comando "Gerar compêndio OD2" cria as notas de referência.')
      .addText((t) =>
        t
          .setPlaceholder("Compêndio OD2")
          .setValue(this.plugin.settings.pastaCompendio)
          .onChange(async (v) => {
            this.plugin.settings.pastaCompendio = v || "Compêndio OD2";
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Animar dados em 3D")
      .setDesc("Quando o Dice Roller está instalado, força a animação 3D dos dados (flag |render).")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.dados3d).onChange(async (v) => {
          this.plugin.settings.dados3d = v;
          await this.plugin.saveSettings();
        }),
      );

    const credito = containerEl.createDiv({ cls: "od2-credito" });
    credito.createSpan({
      text: "Old Dragon 2ª edição © 2023 da Old Dragon Editora está licenciado sob ",
    });
    credito.createEl("a", {
      text: "CC BY-SA 4.0",
      href: "https://creativecommons.org/licenses/by-sa/4.0/",
    });
    credito.createSpan({
      text: ". Projeto de fã, gratuito e não oficial. Regras adaptadas do SRD do OD2.",
    });
  }
}
