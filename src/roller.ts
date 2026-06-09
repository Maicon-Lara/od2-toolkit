// Rolagens de dados e resolução no estilo Old Dragon 2.

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export interface RollResult {
  total: number;
  rolls: number[];
  bonus: number;
  expr: string;
  ok: boolean; // false quando a expressão não pôde ser interpretada
}

// Avalia uma soma de termos: cada termo é uma rolagem "XdY" ou um número fixo,
// com sinais. Aceita compostos como "2d6+1d4", "1d8+2", "1d6-1" e "3".
// `ok=false` quando a string tem algo que não casa (ex.: "1d6/1d6") — assim o
// chamador avisa em vez de devolver 0 silenciosamente.
export function rollExpr(expr: string): RollResult {
  const clean = String(expr).replace(/\s+/g, "");
  const termRe = /([+-]?)(\d*d\d+|\d+)/gi;
  const rolls: number[] = [];
  let total = 0;
  let bonus = 0;
  let matched = false;
  let m: RegExpExecArray | null;
  while ((m = termRe.exec(clean)) !== null) {
    matched = true;
    const sign = m[1] === "-" ? -1 : 1;
    const dice = m[2].match(/^(\d*)d(\d+)$/i);
    if (dice) {
      const count = dice[1] ? parseInt(dice[1], 10) : 1;
      const sides = parseInt(dice[2], 10);
      for (let i = 0; i < count; i++) {
        const r = rollDie(sides);
        rolls.push(r); // faces roladas (positivas); o sinal entra só no total
        total += sign * r;
      }
    } else {
      const flat = parseInt(m[2], 10);
      bonus += sign * flat;
      total += sign * flat;
    }
  }
  // A expressão precisa ser inteiramente consumida pelos termos; sobra = inválida.
  const ok = matched && clean.replace(termRe, "") === "";
  if (!ok) return { total: 0, rolls: [], bonus: 0, expr: clean, ok: false };
  return { total, rolls, bonus, expr: clean, ok: true };
}

// Teste roll-under do OD2: 1d20 ≤ alvo. 1 sempre sucesso, 20 sempre falha.
export interface TesteResult {
  d20: number;
  alvo: number;
  sucesso: boolean;
  critico: "sucesso" | "falha" | null;
}

// Interpreta um d20 já rolado (permite usar o dado de outra fonte, ex.: Dice Roller).
export function avaliarTeste(d: number, alvo: number): TesteResult {
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

export function testeRollUnder(alvo: number): TesteResult {
  return avaliarTeste(rollDie(20), alvo);
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

// Interpreta um ataque a partir de um d20 já rolado.
export function avaliarAtaque(d: number, bonus: number, caAlvo: number | null): AtaqueResult {
  const total = d + bonus;
  let critico: "acerto" | "erro" | null = null;
  if (d === 20) critico = "acerto";
  else if (d === 1) critico = "erro";
  let acerta: boolean | null = caAlvo != null ? total >= caAlvo : null;
  if (critico === "acerto") acerta = true;
  if (critico === "erro") acerta = false;
  return { d20: d, bonus, total, caAlvo, acerta, critico };
}

export function rolarAtaque(bonus: number, caAlvo: number | null): AtaqueResult {
  return avaliarAtaque(rollDie(20), bonus, caAlvo);
}
