// Motor de regras do Old Dragon 2 (mecânicas/números — não é texto do SRD).

export interface FichaData {
  nome?: string;
  jogador?: string;
  retrato?: string;
  povo?: string;
  classe?: string;
  nivel?: number;
  xp?: number;
  alinhamento?: string;
  forca?: number;
  destreza?: number;
  constituicao?: number;
  inteligencia?: number;
  sabedoria?: number;
  carisma?: number;
  pv_max?: number;
  pv_atual?: number;
  ca_base?: number;
  bonus_armadura?: number;
  bonus_escudo?: number;
  outros_ca?: number;
  ba?: number;
  deslocamento?: number;
  jpd?: number;
  jpc?: number;
  jps?: number;
  po?: number;
  ataques?: Array<{ nome: string; bonus?: number; dano?: string }>;
  // Magias memorizadas por círculo (ex.: {"1": ["Sono", ""], "2": ["Escudo Arcano"]}).
  magias_preparadas?: Record<string, string[]>;
  equipamento?: Array<{ nome?: string; carga?: number }>;
  mochila?: boolean;
  // Pontos gastos por talento (ex.: {"Furtividade": 4, "Arrombar": 3}).
  talentos_pontos?: Record<string, number>;
}

// Bônus mecânicos fixos (somados aos cálculos da ficha).
export interface Bonus {
  jpd?: number;
  jpc?: number;
  jps?: number;
  ba?: number;
  ca?: number;
  ca_base?: number;
  deslocamento?: number;
}

export function num(x: unknown, def = 0): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : def;
}

// Tabela 1.1 — modificador por valor de atributo (Old Dragon 2).
export function mod(v: unknown): number {
  const n = num(v);
  if (n <= 3) return -3;
  if (n <= 5) return -2;
  if (n <= 8) return -1;
  if (n <= 12) return 0;
  if (n <= 14) return 1;
  if (n <= 16) return 2;
  if (n <= 18) return 3;
  return 4;
}

export const sinal = (m: number): string => (m >= 0 ? `+${m}` : `${m}`);

// Magias extras por dia por valor de atributo (Tabela 1.1): [1º, 2º, 3º círculo].
export function magiasExtras(v: unknown): number[] {
  const n = num(v);
  if (n >= 19) return [2, 2, 1];
  if (n >= 17) return [2, 1, 1];
  if (n >= 15) return [1, 1, 0];
  if (n >= 13) return [1, 0, 0];
  return [0, 0, 0];
}

// CA ascendente: 10 + mod DES + armadura + escudo + outros.
export function caTotal(d: FichaData): number {
  return (
    num(d.ca_base, 10) +
    mod(d.destreza) +
    num(d.bonus_armadura) +
    num(d.bonus_escudo) +
    num(d.outros_ca)
  );
}

export const ataqueCorpo = (d: FichaData): number => num(d.ba) + mod(d.forca);
export const ataqueDistancia = (d: FichaData): number => num(d.ba) + mod(d.destreza);

// JP final (roll-under): base da classe/nível + modificador do atributo.
export const jpFinal = (base: unknown, atributo: unknown): number =>
  num(base) + mod(atributo);

// Definições de classe/povo (de notas do vault ou embutidas no plugin).
export interface ClasseDef {
  nome: string;
  base?: string;
  dado_vida?: number;
  ba?: number[];
  jp?: number[];
  // Magias por dia: índice = nível-1; cada item = slots por círculo [1º, 2º, ...].
  magias?: number[][];
  // Bônus de classe ganhos por nível (somados quando nivel >= o indicado).
  bonus_por_nivel?: Array<{ nivel?: number } & Bonus>;
  // Talentos/perícias da classe e o atributo que dá pontos extras no 1º nível.
  talentos?: string[];
  talentos_atributo?: "destreza" | "carisma" | "maior";
  poderes?: Array<{
    nivel?: number;
    nome?: string;
    desc?: string;
    melhorias?: Array<{ nivel?: number; desc?: string }>;
  }>;
}
export interface PovoDef {
  nome: string;
  deslocamento?: number;
  infravisao?: string;
  alinhamento?: string;
  habilidades?: Array<{ nome?: string; desc?: string }>;
  bonus?: Bonus;
}

// --- Equipamento (Cap. 5 do SRD) ---
export interface ArmaDef {
  nome: string;
  dano: string; // "1d8" ou "por flecha"
  categoria?: string; // "Média, Cortante"
  alcance?: string; // "Arremesso 9m", "30m", "Haste 3m"
  custo?: string; // "10 PO"
  carga?: string; // número ou "#" (carga desprezível)
}
export interface ArmaduraDef {
  nome: string;
  ca: string; // bônus de CA, ex. "+4"
  tipo?: string; // "Média, Metal"
  custo?: string;
  carga?: string;
}
export interface ItemDef {
  nome: string;
  peso?: string;
  custo?: string;
}

// Monstro embutido para semear o bestiário do compêndio (mesma forma do bloco od2-monstro).
export interface MonstroSeed {
  nome: string;
  tipo?: string;
  tamanho?: string;
  alinhamento?: string;
  habitat?: string;
  descricao?: string;
  encontro?: string;
  xp?: number;
  tesouro?: string;
  movimento?: string;
  dv?: string | number;
  pv?: number;
  ca?: number;
  jp?: number;
  moral?: number;
  ataques?: Array<{ nome: string; qtd?: number; bonus?: number; dano?: string }>;
  habilidades?: Array<{ nome: string; desc?: string }>;
}
