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
  requestUrl,
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
  xpComBonusPovo,
  xpDoNivel,
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
import { INSTRUCOES_FS, OD2_LAYOUT, monstroParaFS } from "./fantasy-statblocks";

interface OD2Settings {
  mostrarCalculo: boolean;
  pastaCompendio: string;
}
const DEFAULT_SETTINGS: OD2Settings = {
  mostrarCalculo: true,
  pastaCompendio: "Compêndio OD2",
};

const norm = (x: unknown): string => String(x ?? "").trim().toLowerCase();
const atLevel = (arr: number[] | undefined, nivel: number): number | undefined =>
  Array.isArray(arr) && arr.length ? arr[Math.min(Math.max(nivel, 1), arr.length) - 1] : undefined;

// Grava um campo numérico vindo de um formulário; vazio (ou 0, salvo keepZero) remove
// a chave para manter o YAML limpo.
function setNumField(d: FichaData, key: keyof FichaData, raw: unknown, keepZero = false): void {
  const rec = d as Record<string, unknown>;
  const s = String(raw ?? "").trim();
  if (s === "") {
    delete rec[key];
    return;
  }
  const n = num(s);
  if (n === 0 && !keepZero) delete rec[key];
  else rec[key] = n;
}

// Grava um campo de texto; vazio remove a chave.
function setStrField(d: FichaData, key: keyof FichaData, raw: unknown): void {
  const rec = d as Record<string, unknown>;
  const s = String(raw ?? "").trim();
  if (s === "") delete rec[key];
  else rec[key] = s;
}

// Extrai o UUID de um personagem do ODO a partir de um link, link .json ou UUID puro.
function uuidDoODO(input: string): string | null {
  const s = String(input ?? "").trim();
  const m = s.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
  return m ? m[0] : null;
}

// Forma parcial do JSON de personagem do Old Dragon Online (ODO) — apenas os campos lidos.
interface OdoItem {
  equipped?: boolean;
  concept?: string;
  bonus_ca?: number;
  name?: string;
  shoot_range?: unknown;
  throw_range?: unknown;
  bonus_damage?: number;
  damage?: unknown;
  weight_in_load?: number;
  increases_load_by?: number;
}
interface OdoChar {
  name?: string;
  forca?: number;
  destreza?: number;
  constituicao?: number;
  inteligencia?: number;
  sabedoria?: number;
  carisma?: number;
  ac?: number;
  bac?: number;
  bad?: number;
  jpd?: number;
  jpc?: number;
  jps?: number;
  level?: number;
  max_hp?: number;
  health_points?: number;
  experience_points?: number;
  money_gp?: number;
  picture?: string;
  alignment?: string;
  inventory_items?: OdoItem[];
  owner?: { handler?: string };
  character_race?: { name?: string };
  character_class?: { name?: string };
}

// Mapeia o JSON de um personagem do Old Dragon Online (ODO) para o formato da ficha.
// CA/BA/JP do ODO são valores FINAIS; como o plugin re-soma o modificador, gravamos
// como override "descontando o mod" para a ficha exibir exatamente os números do ODO.
function odoParaFicha(j: OdoChar): FichaData {
  const modFor = mod(j.forca);
  const modDes = mod(j.destreza);
  const modCon = mod(j.constituicao);
  const modSab = mod(j.sabedoria);

  const itens: OdoItem[] = Array.isArray(j.inventory_items) ? j.inventory_items : [];
  const equipados = itens.filter((it) => it.equipped);
  const somaCa = (concept: string) =>
    equipados.filter((it) => it.concept === concept).reduce((a, it) => a + num(it.bonus_ca), 0);
  const bonusArmadura = somaCa("armor");
  const bonusEscudo = somaCa("shield");
  const caBase = 10;
  const acFinal = num(j.ac, 10);
  // outros_ca fecha a diferença entre o ac do ODO e o que o plugin calcularia.
  const outrosCa = acFinal - (caBase + modDes + bonusArmadura + bonusEscudo);

  const ataques = itens
    .filter((it) => it.concept === "weapon")
    .map((it) => {
      const distancia = it.shoot_range || it.throw_range;
      const bonus = distancia ? num(j.bad) : num(j.bac);
      const bd = num(it.bonus_damage);
      const dano = String(it.damage ?? "") + (bd > 0 ? `+${bd}` : "");
      return { nome: String(it.name ?? "Arma"), bonus, dano };
    });

  // Tudo que tem peso entra no equipamento (carga); container vira mochila.
  const equipamento = itens
    .filter((it) => it.concept !== "container" && it.name)
    .map((it) => ({ nome: String(it.name), carga: num(it.weight_in_load) }));
  const mochila = itens.some((it) => it.concept === "container" && num(it.increases_load_by) > 0);

  const raw: Record<string, unknown> = {
    nome: j.name,
    jogador: j.owner?.handler,
    retrato: j.picture,
    povo: j.character_race?.name,
    classe: j.character_class?.name,
    nivel: num(j.level, 1),
    alinhamento: j.alignment ? String(j.alignment).charAt(0).toUpperCase() + String(j.alignment).slice(1) : undefined,
    forca: num(j.forca, 10),
    destreza: num(j.destreza, 10),
    constituicao: num(j.constituicao, 10),
    inteligencia: num(j.inteligencia, 10),
    sabedoria: num(j.sabedoria, 10),
    carisma: num(j.carisma, 10),
    pv_max: num(j.max_hp),
    pv_atual: num(j.health_points, num(j.max_hp)),
    ca_base: caBase,
    bonus_armadura: bonusArmadura,
    bonus_escudo: bonusEscudo,
    outros_ca: outrosCa,
    ba: num(j.bac) - modFor,
    jpd: num(j.jpd) - modDes,
    jpc: num(j.jpc) - modCon,
    jps: num(j.jps) - modSab,
    xp: num(j.experience_points),
    po: num(j.money_gp),
    ataques,
    equipamento,
    mochila,
  };
  // Remove campos vazios/zerados que poluiriam o YAML (mantém atributos e nível).
  const manterZero = new Set(["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma", "nivel", "ca_base"]);
  const ficha: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v == null || v === "") continue;
    if (v === 0 && !manterZero.has(k)) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (v === false) continue;
    ficha[k] = v;
  }
  return ficha;
}

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
  // Lista de sugestões para autocomplete (vira um <datalist>).
  options?: string[];
}

// Modal genérico de formulário: coleta os campos e devolve os valores no onSubmit.
class OD2FormModal extends Modal {
  private valores: Record<string, string> = {};
  private inputs: Record<string, HTMLInputElement> = {};
  constructor(
    app: App,
    private titulo: string,
    private campos: CampoForm[],
    private onSubmit: (vals: Record<string, string>) => void | Promise<void>,
    // Chamado quando um campo muda; pode preencher outros campos via `set`
    // (ex.: escolher uma arma preenche a carga automaticamente).
    private onChange?: (
      key: string,
      value: string,
      set: (k: string, v: string) => void,
    ) => void,
  ) {
    super(app);
  }
  // Atualiza um campo programaticamente (valor interno + input visível).
  private set = (k: string, v: string) => {
    this.valores[k] = v;
    if (this.inputs[k]) this.inputs[k].value = v;
  };
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: this.titulo });
    const submit = () => {
      this.close();
      void this.onSubmit(this.valores);
    };
    for (const f of this.campos) {
      this.valores[f.key] = f.value != null ? String(f.value) : "";
      new Setting(contentEl).setName(f.label).addText((t) => {
        if (f.type === "number") t.inputEl.type = "number";
        if (f.placeholder) t.setPlaceholder(f.placeholder);
        this.inputs[f.key] = t.inputEl;
        // Autocomplete via <datalist> nativo.
        if (f.options?.length) {
          const listId = `od2-form-${f.key}-${Math.random().toString(36).slice(2, 8)}`;
          const dl = contentEl.createEl("datalist");
          dl.id = listId;
          for (const opt of f.options) dl.createEl("option", { attr: { value: opt } });
          t.inputEl.setAttribute("list", listId);
        }
        t.setValue(this.valores[f.key]);
        t.onChange((v) => {
          this.valores[f.key] = v;
          this.onChange?.(f.key, v, this.set);
        });
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
  "  - nome: Arma pequena",
  "    qtd: 1",
  "    bonus: 1",
  "    dano: 1d6",
  "habilidades:",
  "  - nome: Visão no escuro",
  "    desc: enxerga no escuro a 18m",
  "```",
  "",
].join("\n");

// Template de CLASSE homebrew (frontmatter). Cole no topo de uma NOTA NOVA; o plugin
// indexa qualquer nota com `od2-classe` e a torna usável em fichas (sobrescreve o SRD).
const SKELETON_CLASSE = [
  "---",
  "od2-classe: Minha Classe",
  "base: Guerreiro            # opcional: herda perfil de Guerreiro/Clérigo/Mago/Ladrão",
  "dado_vida: 10              # 4, 6, 8, 10...",
  "ba: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]            # bônus de ataque por nível",
  "jp: [5, 5, 6, 6, 8, 8, 10, 10, 11, 11]         # jogada de proteção base por nível",
  "xp: [0, 2000, 4000, 7000, 10000, 20000, 30000, 40000, 50000, 100000]  # XP p/ cada nível",
  "# magias:                  # só p/ conjuradores — slots por círculo, por nível",
  "#   - [1, 0, 0]",
  "#   - [2, 0, 0]",
  "poderes:",
  "  - nivel: 1",
  "    nome: Poder de Exemplo",
  "    desc: O que o poder faz.",
  "    melhorias:",
  "      - nivel: 6",
  "        desc: Como evolui no 6º nível.",
  "# herda:                   # p/ especializações: poderes da base que mantém",
  "#   - nome: Aparar",
  "#   - nome: Maestria em Arma",
  "#     sem_evolucao: true",
  "# talentos: [Furtividade, Escalar]    # perícias estilo Ladrão",
  "# talentos_atributo: destreza",
  "---",
  "",
  "# Minha Classe",
  "",
  "Lore e descrição. Use em uma ficha com `classe: Minha Classe`.",
  "",
].join("\n");

// Template de POVO/raça homebrew (frontmatter). Mesma ideia: cole no topo de uma nota nova.
const SKELETON_POVO = [
  "---",
  "od2-povo: Meu Povo",
  "deslocamento: 9",
  'infravisao: "não possui"   # ou "18m"',
  "alinhamento: qualquer",
  "bonus_xp: 0                # modificador percentual de XP (ex.: 10 = +10%)",
  "bonus:                     # bônus fixos de raça",
  "  jpd: 0",
  "  jpc: 0",
  "  jps: 0",
  "habilidades:",
  "  - nome: Habilidade Racial",
  "    desc: O que ela faz.",
  "descricao: Lore do povo.",
  "---",
  "",
  "# Meu Povo",
  "",
  "Lore e descrição. Use em uma ficha com `povo: Meu Povo`.",
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

// Tipagem mínima de APIs de terceiros não cobertas pela API pública do Obsidian.
interface AppWithPlugins extends App {
  plugins?: { getPlugin?(id: string): unknown };
}
interface InitiativeTrackerPlugin {
  api?: { addCreatures(creatures: Record<string, unknown>[]): void };
}
interface DiceRollerView {
  addResult?: (entry: Record<string, unknown>) => void;
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
      id: "inserir-classe-homebrew-od2",
      name: "Nova classe homebrew (OD2)",
      callback: () => void this.criarNotaHomebrew("Classe homebrew", SKELETON_CLASSE),
    });

    this.addCommand({
      id: "inserir-povo-homebrew-od2",
      name: "Novo povo homebrew (OD2)",
      callback: () => void this.criarNotaHomebrew("Povo homebrew", SKELETON_POVO),
    });

    this.addCommand({
      id: "importar-odo",
      name: "Importar personagem do ODO (Old Dragon Online)",
      editorCallback: (editor) => {
        new OD2FormModal(
          this.app,
          "Importar personagem do Old Dragon Online",
          [
            {
              key: "url",
              label: "Link ou ID do personagem",
              placeholder: "https://olddragon.com.br/personagens/…",
            },
          ],
          async (v) => {
            const bloco = await this.importarODO(v.url);
            if (bloco) editor.replaceSelection(bloco);
          },
        ).open();
      },
    });

    this.addCommand({
      id: "gerar-compendio-od2",
      name: "Gerar compêndio OD2 (SRD)",
      callback: () => this.gerarCompendio(),
    });

    this.addCommand({
      id: "exportar-fantasy-statblocks",
      name: "Exportar bestiário para Fantasy Statblocks (JSON)",
      callback: () => this.exportarFantasyStatblocks(),
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
      const fm = this.app.metadataCache.getFileCache(f)?.frontmatter;
      if (!fm) continue;
      if (fm["od2-classe"]) {
        this.classes.set(norm(fm["od2-classe"]), { ...fm, nome: String(fm["od2-classe"]) });
      }
      if (fm["od2-povo"]) {
        this.povos.set(norm(fm["od2-povo"]), { ...fm, nome: String(fm["od2-povo"]) });
      }
    }
  }

  // Cria uma NOTA NOVA com o template homebrew e a abre. O frontmatter (od2-classe/
  // od2-povo) só é reconhecido pelo Obsidian no topo do arquivo, então criar a nota
  // — em vez de inserir no cursor — garante que a definição seja indexada.
  private async criarNotaHomebrew(nomeBase: string, conteudo: string) {
    const ativo = this.app.workspace.getActiveFile();
    const pasta = ativo?.parent?.path && ativo.parent.path !== "/" ? ativo.parent.path + "/" : "";
    let caminho = normalizePath(`${pasta}${nomeBase}.md`);
    for (let i = 2; this.app.vault.getAbstractFileByPath(caminho); i++) {
      caminho = normalizePath(`${pasta}${nomeBase} ${i}.md`);
    }
    try {
      const file = await this.app.vault.create(caminho, conteudo);
      await this.app.workspace.getLeaf(true).openFile(file);
    } catch (e) {
      new Notice("OD2: não foi possível criar a nota — " + (e as Error).message);
    }
  }

  private renderFicha(el: HTMLElement, d: FichaData, ctx: MarkdownPostProcessorContext) {
    const root = el.createDiv({ cls: "od2-ficha" });
    const nivel = Math.max(1, num(d.nivel, 1));
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

    // Auto-preenchimento (override manual da ficha) + bônus de raça/classe + bônus manuais.
    // Os campos bonus_* somam POR CIMA do cálculo automático (não substituem).
    const baAuto = atLevel(classeDef?.ba, nivel);
    const jpBaseAuto = atLevel(classeDef?.jp, nivel);
    const ba = (d.ba != null ? num(d.ba) : (baAuto ?? 0) + num(rb.ba) + cb.ba) + num(d.bonus_ba);
    const jpdBase = (d.jpd != null ? num(d.jpd) : (jpBaseAuto ?? 0) + num(rb.jpd) + cb.jpd) + num(d.bonus_jpd);
    const jpcBase = (d.jpc != null ? num(d.jpc) : (jpBaseAuto ?? 0) + num(rb.jpc) + cb.jpc) + num(d.bonus_jpc);
    const jpsBase = (d.jps != null ? num(d.jps) : (jpBaseAuto ?? 0) + num(rb.jps) + cb.jps) + num(d.bonus_jps);
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

    // --- XP: valor + botão "+XP" (aplica o bônus de povo) + aviso de subida de nível ---
    const xpAtual = num(d.xp);
    const bonusXp = num(povoDef?.bonus_xp);
    const xpLine = head.createDiv({ cls: "od2-sub od2-xp-line" });
    xpLine.createSpan({ text: `XP: ${xpAtual}` });
    const addXpBtn = xpLine.createEl("button", {
      cls: "od2-mini",
      text: "+XP",
      attr: { title: bonusXp ? `Registrar XP ganho (o povo soma +${bonusXp}%)` : "Registrar XP ganho" },
    });
    addXpBtn.onclick = () =>
      this.openEdit(
        ctx,
        el,
        "Ganhar XP",
        [{ key: "ganho", label: bonusXp ? `XP ganho (o povo soma +${bonusXp}%)` : "XP ganho", type: "number", value: "" }],
        (data, v) => {
          const ganho = num(v.ganho);
          if (!ganho) return;
          const somado = xpComBonusPovo(ganho, bonusXp);
          data.xp = num(data.xp) + somado;
          new Notice(
            bonusXp
              ? `OD2: +${somado} XP (${ganho} +${bonusXp}% do povo) → ${num(data.xp)}`
              : `OD2: +${somado} XP → ${num(data.xp)}`,
          );
        },
      );

    // Aviso de subida de nível (manual): só quando há XP suficiente para o próximo nível.
    const xpProx = xpDoNivel(classeDef?.xp, nivel + 1);
    if (xpProx != null) {
      if (xpAtual >= xpProx) {
        const up = head.createDiv({ cls: "od2-sub od2-levelup" });
        up.createSpan({ text: `✦ XP suficiente para o nível ${nivel + 1}! ` });
        const upBtn = up.createEl("button", { cls: "od2-roll", text: `Subir para nível ${nivel + 1}` });
        upBtn.onclick = () =>
          this.rewriteFicha(ctx, el, (data) => {
            data.nivel = num(data.nivel, 1) + 1;
          }).then(() => new Notice(`OD2: nível ${nivel + 1}! Lembre de rolar os PV do novo nível.`));
      } else {
        head.createDiv({
          cls: "od2-sub od2-xp-faltam",
          text: `Faltam ${xpProx - xpAtual} XP para o nível ${nivel + 1}`,
        });
      }
    }

    if (d.jogador) head.createDiv({ cls: "od2-sub", text: `Jogador: ${d.jogador}` });
    this.editBtn(
      head,
      ctx,
      el,
      "Identificação",
      [
        { key: "jogador", label: "Jogador", value: d.jogador ?? "" },
        { key: "retrato", label: "Retrato (wikilink/URL)", value: d.retrato ?? "" },
        { key: "povo", label: "Povo", value: d.povo ?? "" },
        { key: "classe", label: "Classe", value: d.classe ?? "" },
        { key: "nivel", label: "Nível", type: "number", value: num(d.nivel, 1) },
        { key: "xp", label: "XP", type: "number", value: d.xp ?? "" },
        { key: "alinhamento", label: "Alinhamento", value: d.alinhamento ?? "" },
      ],
      (data, v) => {
        setStrField(data, "jogador", v.jogador);
        setStrField(data, "retrato", v.retrato);
        setStrField(data, "povo", v.povo);
        setStrField(data, "classe", v.classe);
        setNumField(data, "nivel", v.nivel, true);
        setNumField(data, "xp", v.xp, true);
        setStrField(data, "alinhamento", v.alinhamento);
      },
    );

    root.createDiv({
      cls: "od2-out",
      text: "Os resultados aparecem no painel do Dice Roller (ou no aviso do canto).",
    });
    const showResult = (html: string, _ok?: boolean | null) => this.mostrarResultado("PV", html);

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

    // --- Atributos ---
    const attrSec = root.createDiv({ cls: "od2-section od2-attrs-sec" });
    const attrHead = attrSec.createDiv({ cls: "od2-sec-head" });
    attrHead.createEl("h3", { text: "Atributos" });
    this.editBtn(
      attrHead,
      ctx,
      el,
      "Atributos",
      [
        { key: "forca", label: "Força (FOR)", type: "number", value: num(d.forca, 10) },
        { key: "destreza", label: "Destreza (DES)", type: "number", value: num(d.destreza, 10) },
        { key: "constituicao", label: "Constituição (CON)", type: "number", value: num(d.constituicao, 10) },
        { key: "inteligencia", label: "Inteligência (INT)", type: "number", value: num(d.inteligencia, 10) },
        { key: "sabedoria", label: "Sabedoria (SAB)", type: "number", value: num(d.sabedoria, 10) },
        { key: "carisma", label: "Carisma (CAR)", type: "number", value: num(d.carisma, 10) },
      ],
      (data, v) => {
        setNumField(data, "forca", v.forca, true);
        setNumField(data, "destreza", v.destreza, true);
        setNumField(data, "constituicao", v.constituicao, true);
        setNumField(data, "inteligencia", v.inteligencia, true);
        setNumField(data, "sabedoria", v.sabedoria, true);
        setNumField(data, "carisma", v.carisma, true);
      },
    );
    const grid = attrSec.createDiv({ cls: "od2-attrs" });
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
      btn.onclick = () => this.rolarRollUnder(20, v + ajuste, label);
    }

    // A partir daqui as seções ficam lado a lado em 2 colunas, pra encurtar a ficha.
    // Cabeçalho, atributos e Notas ficam fora (largura total). As seções são criadas
    // todas em colL; um balanceador (no fim) move parte pra colR equilibrando a altura.
    const cols = root.createDiv({ cls: "od2-cols" });
    const colL = cols.createDiv({ cls: "od2-col" });
    const colR = cols.createDiv({ cls: "od2-col" });

    // --- Combate ---
    const comb = colL.createDiv({ cls: "od2-section" });
    const combHead = comb.createDiv({ cls: "od2-sec-head" });
    combHead.createEl("h3", { text: "Combate" });
    const autoDesloc = num(rb.deslocamento ?? povoDef?.deslocamento, 9);
    this.editBtn(
      combHead,
      ctx,
      el,
      "Combate",
      [
        { key: "ca_base", label: "CA base", type: "number", value: num(d.ca_base, 10) },
        { key: "bonus_armadura", label: "Bônus de armadura", type: "number", value: num(d.bonus_armadura) },
        { key: "bonus_escudo", label: "Bônus de escudo", type: "number", value: num(d.bonus_escudo) },
        { key: "outros_ca", label: "Outros bônus de CA", type: "number", value: num(d.outros_ca) },
        { key: "bonus_ba", label: "Bônus manual de BA (+ tabela)", type: "number", value: num(d.bonus_ba) },
        {
          key: "deslocamento",
          label: "Deslocamento (vazio = automático)",
          type: "number",
          value: d.deslocamento ?? "",
          placeholder: `${autoDesloc} m (povo)`,
        },
      ],
      (data, v) => {
        setNumField(data, "ca_base", v.ca_base, true);
        setNumField(data, "bonus_armadura", v.bonus_armadura);
        setNumField(data, "bonus_escudo", v.bonus_escudo);
        setNumField(data, "outros_ca", v.outros_ca);
        setNumField(data, "bonus_ba", v.bonus_ba);
        setNumField(data, "deslocamento", v.deslocamento);
      },
    );
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
      b.onclick = () => this.rolarAtaqueBtn(label, bonus + ajuste);
    };
    mkAtk("Corpo a corpo", ac);
    mkAtk("À distância", ad);

    // Iniciativa (OD2, LB1 p.81): teste roll-under 1d20 ≤ MAIOR entre DES e SAB.
    // Botão único: sempre rola e informa antes/depois; se o Initiative Tracker estiver
    // instalado, já adiciona o PC na faixa correta (sucesso 20 / falha 1).
    const atribIniciativa = Math.max(num(d.destreza, 10), num(d.sabedoria, 10));
    const temIT = this.temInitiativeTracker();
    const iniBtn = atkRow.createEl("button", {
      cls: "od2-roll od2-ini",
      text: temIT ? "⚔️ Iniciativa" : "Iniciativa",
    });
    iniBtn.onclick = () =>
      this.rolarIniciativa(
        atribIniciativa + ajuste,
        temIT
          ? {
              nome: d.nome || "Personagem",
              hp: num(d.pv_atual, num(d.pv_max)),
              ca,
              // No OD2 o atributo de iniciativa é o maior entre DES e SAB.
              mod: Math.max(mod(d.destreza), mod(d.sabedoria)),
            }
          : undefined,
      );

    if (this.settings.mostrarCalculo) {
      const fonte = classeDef ? ` · BA/JP de ${classeDef.nome} (nível ${nivel})` : "";
      const baManual = num(d.bonus_ba) ? ` · BA inclui ${sinal(num(d.bonus_ba))} manual` : "";
      const extraCa = num(d.outros_ca) + num(rb.ca) + cb.ca;
      comb.createDiv({
        cls: "od2-calc",
        text: `CA = ${caBaseEff} ${sinal(mod(d.destreza))} (DES) + ${num(d.bonus_armadura)} arm. + ${num(d.bonus_escudo)} esc.${extraCa ? ` + ${extraCa} outros` : ""}${fonte}${baManual}`,
      });
    }

    // --- Ataques listados (com adicionar/editar/remover) ---
    {
      const sec = colL.createDiv({ cls: "od2-section" });
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
        ba2.onclick = () => this.rolarAtaqueBtn(a.nome || "Ataque", atkBonus + ajuste);
        if (a.dano) {
          const bd = row.createEl("button", { cls: "od2-roll od2-dmg", text: `dano (${a.dano})` });
          bd.onclick = () => this.rolarDano(a.nome || "Ataque", String(a.dano));
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
    const jp = colL.createDiv({ cls: "od2-section" });
    const jpHead = jp.createDiv({ cls: "od2-sec-head" });
    jpHead.createEl("h3", { text: "Jogadas de Proteção" });
    this.editBtn(
      jpHead,
      ctx,
      el,
      "Bônus de Jogadas de Proteção",
      [
        { key: "bonus_jpd", label: "Bônus JPD — esquiva (+ tabela)", type: "number", value: num(d.bonus_jpd) },
        { key: "bonus_jpc", label: "Bônus JPC — vigor (+ tabela)", type: "number", value: num(d.bonus_jpc) },
        { key: "bonus_jps", label: "Bônus JPS — firmeza (+ tabela)", type: "number", value: num(d.bonus_jps) },
      ],
      (data, v) => {
        setNumField(data, "bonus_jpd", v.bonus_jpd);
        setNumField(data, "bonus_jpc", v.bonus_jpc);
        setNumField(data, "bonus_jps", v.bonus_jps);
      },
    );
    const jpRows: Array<[string, number, keyof FichaData, number]> = [
      ["JPD — esquiva", jpdBase, "destreza", num(d.bonus_jpd)],
      ["JPC — vigor", jpcBase, "constituicao", num(d.bonus_jpc)],
      ["JPS — firmeza", jpsBase, "sabedoria", num(d.bonus_jps)],
    ];
    for (const [label, base, attrKey, bonus] of jpRows) {
      const final = jpFinal(base, d[attrKey]);
      const row = jp.createDiv({ cls: "od2-jp" });
      row.createSpan({ cls: "od2-jp-label", text: label });
      const valTxt = `role ≤ ${final}` + (bonus ? ` (inclui ${sinal(bonus)} manual)` : "");
      row.createSpan({ cls: "od2-jp-val", text: valTxt });
      const b = row.createEl("button", { cls: "od2-roll", text: "rolar" });
      b.onclick = () => this.rolarRollUnder(20, final + ajuste, label);
    }

    // --- Magias por dia (classes conjuradoras) ---
    const magiasNivel = classeDef?.magias?.[Math.min(nivel, classeDef.magias.length) - 1];
    if (magiasNivel && magiasNivel.some((n) => n > 0)) {
      const prep: Record<string, string[]> =
        d.magias_preparadas && typeof d.magias_preparadas === "object"
          ? d.magias_preparadas
          : {};
      const magicAttr =
        classeDef?.base === "Clérigo"
          ? d.sabedoria
          : classeDef?.base === "Mago"
            ? d.inteligencia
            : undefined;
      const semExtra = classeDef?.magias_sem_extra_atributo === true;
      const extras = magicAttr != null && !semExtra ? magiasExtras(magicAttr) : [0, 0, 0];
      const sec = colL.createDiv({ cls: "od2-section od2-magias-sec" });
      sec.createEl("h3", { text: "Magias por dia" });
      // Sufixo único por ficha pra não colidir ids de <datalist> entre fichas abertas.
      const uid = Math.random().toString(36).slice(2, 8);
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
        // Autocomplete: sugere as magias do SRD daquele círculo (filtradas por tipo da classe).
        const listId = `od2-magia-${uid}-c${circ}`;
        const datalist = block.createEl("datalist");
        datalist.id = listId;
        for (const nome of this.nomesDeMagia(classeDef, circ)) {
          datalist.createEl("option", { attr: { value: nome } });
        }
        const salvas = Array.isArray(prep[String(circ)]) ? prep[String(circ)] : [];
        for (let j = 0; j < total; j++) {
          const inp = block.createEl("input", {
            cls: "od2-magia-input",
            attr: { type: "text", list: listId, placeholder: `${circ}º círculo — espaço ${j + 1}` },
          });
          inp.value = salvas[j] ?? "";
          inp.dataset.circ = String(circ);
          inp.dataset.idx = String(j);
          inp.addEventListener("change", () => void this.saveMagias(ctx, el));
        }
      });
    }

    // --- Poderes (povo + classe + herdados da classe-base) ---
    type Poder = NonNullable<ClasseDef["poderes"]>[number];
    const poderesPovo = (povoDef?.habilidades ?? []).filter((h) => h && h.nome);
    const poderesClasse = (classeDef?.poderes ?? []).filter(
      (p) => p && p.nome && num(p.nivel, 1) <= nivel,
    );
    // Poderes que a especialização mantém da classe-base (declarados em `herda`).
    const poderesHerdados: Poder[] = [];
    if (classeDef?.herda?.length && classeDef.base && norm(classeDef.base) !== norm(classeDef.nome)) {
      const baseDef = this.classes.get(norm(classeDef.base));
      const porNome = new Map((baseDef?.poderes ?? []).map((p) => [norm(p.nome), p]));
      for (const h of classeDef.herda) {
        const p = porNome.get(norm(h.nome));
        if (!p || num(p.nivel, 1) > nivel) continue;
        poderesHerdados.push(h.sem_evolucao ? { ...p, melhorias: [] } : p);
      }
    }

    // Renderiza um poder (com suas melhorias até o nível atual) como item de lista.
    const renderPoder = (ul: HTMLElement, p: Poder) => {
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
    };

    if (poderesPovo.length || poderesClasse.length || poderesHerdados.length) {
      const sec = colL.createDiv({ cls: "od2-section od2-poderes" });
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
        for (const p of poderesClasse) renderPoder(ul, p);
      }
      if (poderesHerdados.length) {
        sec.createEl("h4", { text: `Herdado de ${classeDef?.base}` });
        const ul = sec.createEl("ul");
        for (const p of poderesHerdados) renderPoder(ul, p);
      }
    } else if (d.povo || d.classe) {
      colL
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
          ? d.talentos_pontos
          : {};
      const sec = colL.createDiv({ cls: "od2-section od2-talentos" });
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
        inp.addEventListener("change", () => void this.saveTalentos(ctx, el));
        const btn = row.createEl("button", { cls: "od2-roll", text: "testar" });
        btn.onclick = () => this.rolarRollUnder(6, Number(inp.value) || 2, t);
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
      const sec = colL.createDiv({ cls: "od2-section" });
      const sh = sec.createDiv({ cls: "od2-sec-head" });
      sh.createEl("h3", { text: "Equipamento e Carga" });
      // Lista de autocomplete e a regra de autopreenchimento de carga, computadas uma
      // vez e reusadas por todos os modais de item (novo e editar).
      const equipOptions = this.nomesDeEquipamento();
      const autofillCarga = (key: string, value: string, set: (k: string, v: string) => void) => {
        // Escolheu uma arma/armadura do SRD: preenche a carga automaticamente.
        if (key === "nome") {
          const carga = this.cargaDoItem(value);
          if (carga != null) set("carga", String(carga));
        }
      };
      const addBtn = sh.createEl("button", { cls: "od2-roll od2-add", text: "+ item" });
      addBtn.onclick = () =>
        new OD2FormModal(
          this.app,
          "Novo item",
          [
            { key: "nome", label: "Item", placeholder: "Corda (15 m)", options: equipOptions },
            { key: "carga", label: "Carga", type: "number", value: 1 },
          ],
          (v) =>
            this.rewriteFicha(ctx, el, (data) => {
              const arr = Array.isArray(data.equipamento) ? data.equipamento : [];
              arr.push({ nome: v.nome || "Item", carga: num(v.carga) });
              data.equipamento = arr;
            }),
          autofillCarga,
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
                { key: "nome", label: "Item", value: it?.nome ?? "", options: equipOptions },
                { key: "carga", label: "Carga", type: "number", value: num(it?.carga) },
              ],
              (v) =>
                this.rewriteFicha(ctx, el, (data) => {
                  if (Array.isArray(data.equipamento) && data.equipamento[i]) {
                    data.equipamento[i] = { nome: v.nome || "Item", carga: num(v.carga) };
                  }
                }),
              autofillCarga,
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
    const pvSec = colL.createDiv({ cls: "od2-section od2-pv" });
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

    // --- Notas (texto livre, gravado no YAML; largura total, fora das colunas) ---
    const notasSec = root.createDiv({ cls: "od2-section od2-notas" });
    notasSec.createEl("h3", { text: "Notas" });
    const notasArea = notasSec.createEl("textarea", {
      cls: "od2-notas-input",
      attr: {
        rows: "4",
        placeholder: "Anotações livres: ganchos, segredos, relações, lembretes…",
      },
    });
    notasArea.value = typeof d.notas === "string" ? d.notas : "";
    // Salva ao sair do campo (igual aos espaços de magia/talentos).
    notasArea.addEventListener("change", () =>
      void this.rewriteFicha(ctx, el, (data) => setStrField(data, "notas", notasArea.value)),
    );

    // Balanceia as duas colunas por altura: cada seção é movida inteira (nunca
    // fragmentada), então não há vazamento de botões entre colunas. As colunas
    // já têm 50% de largura (flex), então a medição reflete a largura final.
    // Em telas estreitas o CSS empilha as colunas; aí não movemos nada.
    window.requestAnimationFrame(() => {
      if (cols.offsetWidth < 560) return; // empilhado (mobile) → coluna única
      const secoes = Array.from(colL.children) as HTMLElement[];
      const alturas = secoes.map((s) => s.offsetHeight);
      const total = alturas.reduce((a, h) => a + h, 0);
      if (total === 0) return; // ainda não renderizado → mantém coluna única
      let acc = 0;
      secoes.forEach((s, i) => {
        // Tudo que começa depois da metade da altura vai pra coluna direita,
        // preservando a ordem de leitura (esquerda em cima, direita embaixo).
        if (acc >= total / 2) colR.appendChild(s);
        acc += alturas[i];
      });
    });
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

  // Nomes de magia do SRD para autocomplete, por círculo e filtrados pelo tipo da
  // classe: Mago → arcanas (+ exclusivas da especialização); Clérigo → divinas;
  // classe desconhecida/autoral → arcanas + divinas. Ordenado e sem repetição.
  private nomesDeMagia(classeDef: ClasseDef | undefined, circ: number): string[] {
    const arc = MAGIAS_ARCANAS[circ - 1]?.map((m) => m.nome) ?? [];
    const div = MAGIAS_DIVINAS[circ - 1]?.map((m) => m.nome) ?? [];
    const base = norm(classeDef?.base);
    let nomes: string[];
    if (base === "mago") {
      const exc = MAGIAS_EXCLUSIVAS.find((e) => norm(e.classe) === norm(classeDef?.nome))?.magias ?? [];
      nomes = [...arc, ...exc];
    } else if (base === "clérigo") {
      nomes = div;
    } else {
      nomes = [...arc, ...div];
    }
    return Array.from(new Set(nomes)).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  // Nomes de equipamento do SRD (armas, armaduras e itens gerais) para autocomplete.
  private nomesDeEquipamento(): string[] {
    const nomes = [...ARMAS, ...ARMADURAS, ...ITENS_GERAIS].map((e) => e.nome);
    return Array.from(new Set(nomes)).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }

  // Carga (espaços) de um item do SRD pelo nome. Armas/armaduras trazem `carga`
  // ("#" = desprezível → 0); itens gerais só têm peso em kg, então ficam sem carga
  // automática (retorna null e o jogador ajusta). null = sem dado para autopreencher.
  private cargaDoItem(nome: string): number | null {
    const alvo = norm(nome);
    const item = [...ARMAS, ...ARMADURAS].find((e) => norm(e.nome) === alvo);
    if (!item?.carga) return null;
    if (item.carga.trim() === "#") return 0;
    const n = parseInt(item.carga, 10);
    return Number.isFinite(n) ? n : null;
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

    root.createDiv({
      cls: "od2-out",
      text: "Os resultados aparecem no painel do Dice Roller (ou no aviso do canto).",
    });
    const showResult = (html: string, _ok?: boolean | null) => this.mostrarResultado("PV", html);

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
      // Monstros agem entre os PCs que passaram (20) e os que falharam (1) → faixa 10.
      itBtn.onclick = () => this.adicionarAoTracker(m.nome || "Criatura", num(m.pv), m.ca ?? 10, 0, 10);
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
        ba.onclick = () => this.rolarAtaqueBtn(label, bonus);
        if (a.dano) {
          const bd = row.createEl("button", { cls: "od2-roll od2-dmg", text: `dano (${a.dano})` });
          bd.onclick = () => this.rolarDano(a.nome ?? "ataque", String(a.dano));
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

  // Baixa um personagem do Old Dragon Online (ODO) e devolve o bloco od2-ficha pronto.
  // Usa requestUrl (API do Obsidian) para evitar bloqueio de CORS.
  private async importarODO(input: string): Promise<string | null> {
    const uuid = uuidDoODO(input);
    if (!uuid) {
      new Notice("OD2: link/ID inválido. Cole o link da ficha em olddragon.com.br.");
      return null;
    }
    const url = `https://olddragon.com.br/personagens/${uuid}.json`;
    try {
      const resp = await requestUrl({ url });
      const j = resp.json as OdoChar | null;
      if (!j?.name) {
        new Notice("OD2: resposta inesperada do ODO — o personagem é público?");
        return null;
      }
      const ficha = odoParaFicha(j);
      const yaml = stringifyYaml(ficha).replace(/\n+$/, "");
      new Notice(`OD2: “${j.name}” importado do ODO.`);
      return "```od2-ficha\n" + yaml + "\n```\n";
    } catch (e) {
      new Notice("OD2: falha ao importar do ODO — " + (e as Error).message);
      return null;
    }
  }

  // Abre um modal de formulário e grava as alterações no bloco da ficha.
  private openEdit(
    ctx: MarkdownPostProcessorContext,
    el: HTMLElement,
    titulo: string,
    campos: CampoForm[],
    apply: (d: FichaData, vals: Record<string, string>) => void,
  ) {
    new OD2FormModal(this.app, titulo, campos, (vals) =>
      this.rewriteFicha(ctx, el, (d) => apply(d, vals)),
    ).open();
  }

  // Cria um botão ✎ que abre o modal de edição de uma seção.
  private editBtn(
    parent: HTMLElement,
    ctx: MarkdownPostProcessorContext,
    el: HTMLElement,
    titulo: string,
    campos: CampoForm[],
    apply: (d: FichaData, vals: Record<string, string>) => void,
  ): HTMLButtonElement {
    const b = parent.createEl("button", {
      cls: "od2-mini od2-edit",
      text: "✎",
      attr: { title: `Editar — ${titulo}` },
    });
    b.onclick = () => this.openEdit(ctx, el, titulo, campos, apply);
    return b;
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
    // vault.process: read-modify-write atômico e serializado. Sem ele, edições
    // disparadas em sequência (ex.: cliques rápidos em PV −/+) leem o arquivo
    // antes da escrita anterior terminar e uma delas se perde.
    let erro: string | null = null;
    await this.app.vault.process(file, (content) => {
      const lines = content.split("\n");
      // info.lineStart aponta para a cerca de abertura; o corpo vem logo depois.
      const bodyStart = info.lineStart + 1;
      // A cerca de fechamento pode ter "andado" se uma edição anterior na fila
      // mudou o tamanho do bloco; reencontramos a ``` em vez de confiar no lineEnd.
      let bodyEnd = info.lineEnd;
      for (let i = bodyStart; i < lines.length; i++) {
        if (/^\s*(```|~~~)/.test(lines[i])) {
          bodyEnd = i;
          break;
        }
      }
      const body = lines.slice(bodyStart, bodyEnd).join("\n");
      let data: FichaData;
      try {
        data = (parseYaml(body) as FichaData) ?? {};
      } catch {
        erro = "OD2: não consegui ler o YAML da ficha para editar.";
        return content; // mantém o arquivo intacto
      }
      mutate(data);
      const newBody = stringifyYaml(data).replace(/\n+$/, "");
      lines.splice(bodyStart, bodyEnd - bodyStart, ...newBody.split("\n"));
      return lines.join("\n");
    });
    if (erro) new Notice(erro);
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

  // Escreve um arquivo qualquer (ex.: .json), criando ou sobrescrevendo.
  private async writeRaw(path: string, content: string): Promise<void> {
    const norm = normalizePath(path);
    const existing = this.app.vault.getAbstractFileByPath(norm);
    if (existing instanceof TFile) await this.app.vault.modify(existing, content);
    else await this.app.vault.create(norm, content);
  }

  // Exporta o bestiário (SRD) para o Fantasy Statblocks: array de criaturas
  // (import "Generic JSON") + o Layout "Old Dragon 2" + uma nota com o passo a passo.
  private async exportarFantasyStatblocks() {
    const base = normalizePath((this.settings.pastaCompendio || "Compêndio OD2").trim());
    const dir = `${base}/Fantasy Statblocks`;
    try {
      await this.ensureFolder(dir);
      const monstros = [...BESTIARIO, ...HUMANOIDES].map(monstroParaFS);
      await this.writeRaw(
        `${dir}/Bestiário OD2 (import Generic JSON).json`,
        JSON.stringify(monstros, null, 2),
      );
      await this.writeRaw(
        `${dir}/Layout Old Dragon 2 (import Layout).json`,
        JSON.stringify(OD2_LAYOUT, null, 2),
      );
      await this.writeRaw(`${dir}/Como importar no Fantasy Statblocks.md`, INSTRUCOES_FS);
      new Notice(
        `OD2: ${monstros.length} criaturas exportadas para “${dir}”. ` +
          "Veja a nota “Como importar no Fantasy Statblocks”.",
      );
    } catch (e) {
      new Notice("OD2: erro ao exportar para o Fantasy Statblocks — " + (e as Error).message);
    }
  }

  // --- Integrações com outros plugins (feature-detection + fallback) ---

  // Initiative Tracker disponível com a API de adicionar criaturas?
  private getPlugin(id: string): unknown {
    // `plugins` é API interna (não tipada): mantém o optional-chaining defensivo —
    // temInitiativeTracker() roda no render da ficha/statblock, então um throw aqui
    // quebraria a renderização inteira.
    return (this.app as AppWithPlugins).plugins?.getPlugin?.(id);
  }

  private temInitiativeTracker(): boolean {
    const it = this.getPlugin("initiative-tracker") as InitiativeTrackerPlugin | null;
    return typeof it?.api?.addCreatures === "function";
  }

  // Adiciona uma criatura/PJ ao Initiative Tracker (nome, PV, CA, modificador de iniciativa).
  // `initiativeFixa` (opcional): grava a iniciativa diretamente como estática — o IT
  // pula a re-rolagem de criaturas com `static && initiative`, preservando a ordem do
  // OD2 (sucessos 20 → monstros 10 → falhas 1).
  private adicionarAoTracker(
    nome: string,
    hp: number,
    ca: number | string,
    modifier: number,
    initiativeFixa?: number,
  ) {
    const it = this.getPlugin("initiative-tracker") as InitiativeTrackerPlugin | null;
    if (!it?.api?.addCreatures) {
      new Notice("Initiative Tracker não está disponível.");
      return;
    }
    try {
      const acNum = typeof ca === "number" ? ca : parseInt(String(ca), 10) || 10;
      const creature: Record<string, unknown> = {
        name: nome || "Criatura",
        hp: Number(hp) || 0,
        ac: acNum,
        modifier: Number(modifier) || 0,
      };
      if (initiativeFixa != null) {
        creature.initiative = initiativeFixa; // lido direto pelo Creature do IT
        creature.static = true; // impede o IT de re-rolar por cima
      }
      it.api.addCreatures([creature]);
      new Notice(`${nome} adicionado ao Initiative Tracker.`);
    } catch (e) {
      new Notice("OD2: falha ao adicionar ao Initiative Tracker — " + (e as Error).message);
    }
  }

  // Mostra o resultado no popup lateral do Obsidian (Notice), sem as tags <b>/<i>.
  private notificar(html: string) {
    new Notice(html.replace(/<[^>]+>/g, ""), 8000);
  }

  // Injeta uma entrada no painel "Results" do Dice Roller (Dice Tray), se ele estiver aberto.
  // `result` é o texto principal (negrito); `formula` aparece pequeno e é o que o "Roll Again" rerola.
  private adicionarResultadoNoTray(formula: string, result: string): boolean {
    const leaves = this.app.workspace.getLeavesOfType("DICE_ROLLER_VIEW");
    for (const leaf of leaves) {
      const view = leaf.view as DiceRollerView | undefined;
      if (view && typeof view.addResult === "function") {
        try {
          view.addResult({
            result,
            original: formula,
            resultText: result,
            timestamp: Date.now(),
            id: Math.random().toString(36).slice(2, 14),
          });
          return true;
        } catch {
          /* ignora e tenta o próximo / fallback */
        }
      }
    }
    return false;
  }

  // Mostra o resultado: no painel do Dice Roller (se aberto), senão no popup (Notice).
  private mostrarResultado(formula: string, texto: string) {
    if (!this.adicionarResultadoNoTray(formula, texto)) this.notificar(texto);
  }

  // Teste roll-under (1dN ≤ alvo) com regras OD2; mostra "sucesso/falha" no painel/popup.
  private rolarRollUnder(lados: number, alvo: number, label: string) {
    const v = rollDie(lados);
    const r = lados === 20 ? avaliarTeste(v, alvo) : { sucesso: v <= alvo, critico: null as string | null };
    const crit = r.critico ? ` (${r.critico} crítico)` : "";
    this.mostrarResultado(
      `1d${lados}`,
      `${label} — 1d${lados} = ${v} (≤ ${alvo}) → ${r.sucesso ? "✅ sucesso" : "❌ falha"}${crit}`,
    );
  }

  // Iniciativa (OD2): teste roll-under 1d20 ≤ maior(DES, SAB). Sucesso = age antes
  // dos inimigos; falha = age depois. 1 sempre sucesso, 20 sempre falha.
  // Se `tracker` vier, adiciona o PC ao Initiative Tracker na faixa do resultado.
  private rolarIniciativa(
    alvo: number,
    tracker?: { nome: string; hp: number; ca: number | string; mod: number },
  ) {
    const v = rollDie(20);
    const r = avaliarTeste(v, alvo);
    if (tracker) {
      const banda = r.sucesso ? 20 : 1; // sucesso age antes dos monstros (10); falha depois
      this.adicionarAoTracker(tracker.nome, tracker.hp, tracker.ca, tracker.mod, banda);
    }
    const crit = r.critico ? ` (${r.critico} crítico)` : "";
    const ordem = r.sucesso ? "age ANTES dos inimigos" : "age DEPOIS dos inimigos";
    this.mostrarResultado(
      "1d20",
      `Iniciativa — 1d20 = ${v} (≤ ${alvo}) → ${r.sucesso ? "✅" : "❌"} ${ordem}${tracker ? " · no Tracker" : ""}${crit}`,
    );
  }

  // Ataque (1d20 + bônus): mostra o total e o crítico no painel/popup.
  private rolarAtaqueBtn(label: string, bonus: number) {
    const r = avaliarAtaque(rollDie(20), bonus, null);
    const crit = r.critico === "acerto" ? " 🎯 crítico!" : r.critico === "erro" ? " 💥 erro!" : "";
    this.mostrarResultado(
      `1d20${sinal(bonus)}`,
      `${label} — 1d20 (${r.d20}) ${sinal(bonus)} = ${r.total}${crit} (vs CA do alvo)`,
    );
  }

  private rolarDano(label: string, dano: string) {
    const r = rollExpr(String(dano));
    if (!r.ok) {
      this.mostrarResultado(
        String(dano),
        `${label} — não entendi o dano “${dano}”. Use algo como 1d8+2 ou 2d6+1d4.`,
      );
      return;
    }
    this.mostrarResultado(
      String(dano),
      `${label} — dano ${dano} = ${r.total}` + (r.rolls.length ? ` [${r.rolls.join(", ")}]` : ""),
    );
  }

  async loadSettings() {
    const data = (await this.loadData()) as Partial<OD2Settings> | null;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
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
