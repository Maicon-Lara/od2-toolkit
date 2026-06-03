// Rolagens de dados e resolução no estilo Old Dragon 2.

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export interface RollResult {
  total: number;
  rolls: number[];
  bonus: number;
  expr: string;
}

// Avalia expressões "2d6+3", "1d20-1", "1d8" ou um número fixo "3".
export function rollExpr(expr: string): RollResult {
  const clean = String(expr).replace(/\s+/g, "");
  const m = clean.match(/^(\d*)d(\d+)([+-]\d+)?$/i);
  if (!m) {
    const flat = Number(clean);
    const v = Number.isFinite(flat) ? flat : 0;
    return { total: v, rolls: [], bonus: v, expr: clean };
  }
  const count = m[1] ? parseInt(m[1], 10) : 1;
  const sides = parseInt(m[2], 10);
  const bonus = m[3] ? parseInt(m[3], 10) : 0;
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) rolls.push(rollDie(sides));
  const total = rolls.reduce((a, b) => a + b, 0) + bonus;
  return { total, rolls, bonus, expr: clean };
}

// Teste roll-under do OD2: 1d20 ≤ alvo. 1 sempre sucesso, 20 sempre falha.
export interface TesteResult {
  d20: number;
  alvo: number;
  sucesso: boolean;
  critico: "sucesso" | "falha" | null;
}

export function testeRollUnder(alvo: number): TesteResult {
  const d = rollDie(20);
  let sucesso: boolean;
  let critico: "sucesso" | "falha" | null = null;
  if (d === 1) {
    sucesso = true;
    critico = "sucesso";
  } else if (d === 20) {
    sucesso = false;
    critico = "falha";
  } else {
    sucesso = d <= alvo;
  }
  return { d20: d, alvo, sucesso, critico };
}

// Ataque do OD2 (CA ascendente): 1d20 + bônus ≥ CA do alvo.
export interface AtaqueResult {
  d20: number;
  bonus: number;
  total: number;
  caAlvo: number | null;
  acerta: boolean | null;
  critico: "acerto" | "erro" | null;
}

export function rolarAtaque(bonus: number, caAlvo: number | null): AtaqueResult {
  const d = rollDie(20);
  const total = d + bonus;
  let critico: "acerto" | "erro" | null = null;
  if (d === 20) critico = "acerto";
  else if (d === 1) critico = "erro";
  let acerta: boolean | null = caAlvo != null ? total >= caAlvo : null;
  if (critico === "acerto") acerta = true;
  if (critico === "erro") acerta = false;
  return { d20: d, bonus, total, caAlvo, acerta, critico };
}
