import { describe, it, expect } from "vitest";
import {
  ataqueCorpo,
  ataqueDistancia,
  caTotal,
  jpFinal,
  magiasExtras,
  mod,
  num,
  sinal,
} from "../src/od2";

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
