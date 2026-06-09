import { describe, it, expect } from "vitest";
import { avaliarAtaque, avaliarTeste, rollDie, rollExpr } from "../src/roller";

describe("rollDie", () => {
  it("fica dentro do intervalo [1, lados]", () => {
    for (let i = 0; i < 200; i++) {
      const r = rollDie(8);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(8);
    }
  });
});

describe("rollExpr — soma de termos", () => {
  it("interpreta uma rolagem simples com bônus", () => {
    const r = rollExpr("1d8+2");
    expect(r.ok).toBe(true);
    expect(r.rolls).toHaveLength(1);
    expect(r.bonus).toBe(2);
    expect(r.total).toBeGreaterThanOrEqual(3);
    expect(r.total).toBeLessThanOrEqual(10);
  });
  it("interpreta dados compostos (2d6+1d4)", () => {
    const r = rollExpr("2d6+1d4");
    expect(r.ok).toBe(true);
    expect(r.rolls).toHaveLength(3);
    expect(r.total).toBeGreaterThanOrEqual(3); // 2*1 + 1
    expect(r.total).toBeLessThanOrEqual(16); // 2*6 + 4
  });
  it("aceita modificador negativo", () => {
    const r = rollExpr("1d6-1");
    expect(r.ok).toBe(true);
    expect(r.bonus).toBe(-1);
    expect(r.total).toBeGreaterThanOrEqual(0);
    expect(r.total).toBeLessThanOrEqual(5);
  });
  it("aceita um número fixo", () => {
    const r = rollExpr("3");
    expect(r.ok).toBe(true);
    expect(r.rolls).toHaveLength(0);
    expect(r.total).toBe(3);
    expect(r.bonus).toBe(3);
  });
  it("ignora espaços", () => {
    expect(rollExpr(" 1d4 + 1 ").ok).toBe(true);
  });
  it("sinaliza ok:false quando a expressão tem sobras (1d6/1d6)", () => {
    const r = rollExpr("1d6/1d6");
    expect(r.ok).toBe(false);
    expect(r.total).toBe(0);
  });
  it("sinaliza ok:false para texto inválido e vazio", () => {
    expect(rollExpr("abc").ok).toBe(false);
    expect(rollExpr("").ok).toBe(false);
  });
});

describe("avaliarTeste — roll-under 1d20", () => {
  it("1 é sempre sucesso crítico; 20 sempre falha crítica", () => {
    expect(avaliarTeste(1, 5)).toMatchObject({ sucesso: true, critico: "sucesso" });
    expect(avaliarTeste(20, 19)).toMatchObject({ sucesso: false, critico: "falha" });
  });
  it("sucesso quando d ≤ alvo, falha caso contrário", () => {
    expect(avaliarTeste(10, 12).sucesso).toBe(true);
    expect(avaliarTeste(15, 12).sucesso).toBe(false);
  });
});

describe("avaliarAtaque — CA ascendente", () => {
  it("20 é acerto crítico, 1 é erro crítico", () => {
    expect(avaliarAtaque(20, 0, 99)).toMatchObject({ critico: "acerto", acerta: true });
    expect(avaliarAtaque(1, 50, 5)).toMatchObject({ critico: "erro", acerta: false });
  });
  it("compara total contra a CA do alvo quando informada", () => {
    expect(avaliarAtaque(10, 5, 14).acerta).toBe(true); // 15 >= 14
    expect(avaliarAtaque(8, 2, 14).acerta).toBe(false); // 10 < 14
  });
  it("acerta=null quando não há CA do alvo", () => {
    expect(avaliarAtaque(10, 3, null).acerta).toBeNull();
    expect(avaliarAtaque(10, 3, null).total).toBe(13);
  });
});
