import { describe, it, expect } from "vitest";
import {
  ataqueCorpo,
  ataqueDistancia,
  caTotal,
  jpFinal,
  magiasExtras,
  mod,
  nivelPorXp,
  num,
  sinal,
  xpComBonusPovo,
  xpDoNivel,
} from "../src/od2";
import { BASE_CLASSES, BASE_POVOS } from "../src/basedata";

describe("mod — Tabela 1.1 (modificador por atributo)", () => {
  it("aplica os modificadores em cada faixa", () => {
    expect(mod(3)).toBe(-3);
    expect(mod(5)).toBe(-2);
    expect(mod(8)).toBe(-1);
    expect(mod(9)).toBe(0);
    expect(mod(12)).toBe(0);
    expect(mod(14)).toBe(1);
    expect(mod(16)).toBe(2);
    expect(mod(18)).toBe(3);
    expect(mod(20)).toBe(4);
  });
  it("trata valores fora da tabela com os extremos", () => {
    expect(mod(1)).toBe(-3);
    expect(mod(0)).toBe(-3); // 0 explícito é um valor baixo válido
    expect(mod(30)).toBe(4);
    expect(mod(undefined)).toBe(0); // ausente → tratado como 10 (média)
  });
});

describe("sinal", () => {
  it("prefixa + para não-negativos e mantém o − dos negativos", () => {
    expect(sinal(0)).toBe("+0");
    expect(sinal(3)).toBe("+3");
    expect(sinal(-2)).toBe("-2");
  });
});

describe("num", () => {
  it("converte e cai no default quando não é número finito", () => {
    expect(num("7")).toBe(7);
    expect(num("abc")).toBe(0);
    expect(num("abc", 10)).toBe(10);
    expect(num(undefined, 10)).toBe(10);
  });
});

describe("magiasExtras — magias adicionais por atributo", () => {
  it("retorna os bônus por faixa de atributo [1º,2º,3º]", () => {
    expect(magiasExtras(12)).toEqual([0, 0, 0]);
    expect(magiasExtras(13)).toEqual([1, 0, 0]);
    expect(magiasExtras(15)).toEqual([1, 1, 0]);
    expect(magiasExtras(17)).toEqual([2, 1, 1]);
    expect(magiasExtras(19)).toEqual([2, 2, 1]);
  });
});

describe("caTotal — CA ascendente", () => {
  it("soma 10 base + mod DES + armadura + escudo + outros", () => {
    expect(
      caTotal({ ca_base: 10, destreza: 16, bonus_armadura: 4, bonus_escudo: 1, outros_ca: 1 }),
    ).toBe(18); // 10 + 2 + 4 + 1 + 1
  });
  it("usa 10 como base padrão", () => {
    expect(caTotal({})).toBe(10);
  });
});

describe("ataques", () => {
  it("corpo a corpo soma BA + mod FOR; à distância BA + mod DES", () => {
    expect(ataqueCorpo({ ba: 3, forca: 16 })).toBe(5);
    expect(ataqueDistancia({ ba: 3, destreza: 18 })).toBe(6);
  });
});

describe("jpFinal", () => {
  it("soma base da classe + mod do atributo", () => {
    expect(jpFinal(13, 16)).toBe(15); // 13 + mod(16)=2
    expect(jpFinal(15, 8)).toBe(14); // 15 + mod(8)=-1
  });
});

describe("XP — limiares e subida de nível", () => {
  const tab = [0, 1000, 2000, 4000]; // tabela fictícia de 4 níveis

  it("xpDoNivel retorna o limiar do nível alvo (e undefined fora da tabela)", () => {
    expect(xpDoNivel(tab, 1)).toBe(0);
    expect(xpDoNivel(tab, 2)).toBe(1000);
    expect(xpDoNivel(tab, 4)).toBe(4000);
    expect(xpDoNivel(tab, 5)).toBeUndefined(); // acima da tabela → sem aviso
    expect(xpDoNivel(undefined, 2)).toBeUndefined();
  });

  it("nivelPorXp devolve o maior nível alcançável", () => {
    expect(nivelPorXp(tab, 0)).toBe(1);
    expect(nivelPorXp(tab, 999)).toBe(1);
    expect(nivelPorXp(tab, 1000)).toBe(2);
    expect(nivelPorXp(tab, 3500)).toBe(3);
    expect(nivelPorXp(tab, 999999)).toBe(4); // limitado ao tamanho da tabela
    expect(nivelPorXp(undefined, 5000)).toBe(1);
  });

  it("xpComBonusPovo aplica o modificador percentual (exemplo do livro)", () => {
    expect(xpComBonusPovo(230, 10)).toBe(253); // Humano: 230 +10%
    expect(xpComBonusPovo(230, 5)).toBe(242); // Meio-Elfo: 230 +5% = 241,5 → 242
    expect(xpComBonusPovo(230, 0)).toBe(230);
    expect(xpComBonusPovo(230, undefined)).toBe(230);
  });
});

describe("Tabelas de XP das classes (basedata)", () => {
  const byName = (n: string) => BASE_CLASSES.find((c) => c.nome === n)!;

  it("classes-base usam a coluna XP normal do LB1", () => {
    expect(byName("Guerreiro").xp).toEqual([0, 2000, 4000, 7000, 10000, 20000, 30000, 40000, 50000, 100000]);
    expect(byName("Ladrão").xp).toEqual([0, 1000, 2000, 4000, 7000, 14000, 24000, 34000, 44000, 88000]);
  });

  it("especializações usam a coluna XP Especial (mais cara que a base)", () => {
    // Bruxo é especialista de Mago → coluna especial do Mago.
    expect(byName("Bruxo").xp).toEqual([0, 3000, 6000, 10000, 13000, 26000, 36000, 46000, 56000, 112000]);
    // Cross-check do livro: a coluna Especial do Guerreiro == coluna normal do Mago.
    expect(byName("Bárbaro").xp).toEqual(byName("Mago").xp);
  });

  it("toda classe embutida recebe uma tabela de XP de 10 níveis", () => {
    for (const c of BASE_CLASSES) expect(c.xp).toHaveLength(10);
  });

  it("apenas Humano (+10%) e Meio-Elfo (+5%) têm bônus de XP", () => {
    const comBonus = BASE_POVOS.filter((p) => p.bonus_xp).map((p) => [p.nome, p.bonus_xp]);
    expect(comBonus).toEqual([["Humano", 10], ["Meio-Elfo", 5]]);
  });
});
