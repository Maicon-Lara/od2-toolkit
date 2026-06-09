import { describe, it, expect } from "vitest";
import { monstroParaFS, OD2_LAYOUT } from "../src/fantasy-statblocks";
import { BESTIARIO } from "../src/srd/bestiario";
import { HUMANOIDES } from "../src/srd/humanoides";

describe("monstroParaFS — mapeamento OD2 → Fantasy Statblocks", () => {
  it("mapeia os campos canônicos e os próprios do OD2", () => {
    const fs = monstroParaFS({
      nome: "Goblin",
      tipo: "Humanoide",
      tamanho: "Pequeno",
      alinhamento: "Caótico",
      movimento: "9",
      dv: "1",
      pv: 5,
      ca: 13,
      jp: 5,
      moral: 7,
      xp: 15,
      tesouro: "incomum",
      ataques: [{ nome: "Arma pequena", qtd: 1, bonus: 1, dano: "1d6" }],
      habilidades: [{ nome: "Visão no escuro", desc: "enxerga no escuro a 18m" }],
    });
    expect(fs.name).toBe("Goblin");
    expect(fs.ac).toBe(13);
    expect(fs.hp).toBe(5);
    expect(fs.hit_dice).toBe("1d8");
    expect(fs.speed).toBe("9 m");
    expect(fs.layout).toBe("Old Dragon 2");
    expect(fs.source).toBe("Old Dragon 2 SRD");
    expect(fs.actions?.[0]).toEqual({ name: "1 × Arma pequena", desc: "ataque +1, dano 1d6" });
    expect(fs.habilidades?.[0]).toEqual({ name: "Visão no escuro", desc: "enxerga no escuro a 18m" });
  });

  it("converte DV em hit_dice (d8; ½ = 1d4; com bônus)", () => {
    expect(monstroParaFS({ nome: "A", dv: "½" }).hit_dice).toBe("1d4");
    expect(monstroParaFS({ nome: "B", dv: "1/2" }).hit_dice).toBe("1d4");
    expect(monstroParaFS({ nome: "C", dv: "3+5" }).hit_dice).toBe("3d8+5");
    expect(monstroParaFS({ nome: "D", dv: 2 }).hit_dice).toBe("2d8");
  });

  it("omite campos ausentes (não cria chaves vazias)", () => {
    const fs = monstroParaFS({ nome: "Mínimo" });
    expect(fs).not.toHaveProperty("ac");
    expect(fs).not.toHaveProperty("actions");
    expect(fs).not.toHaveProperty("hit_dice");
  });

  it("mantém movimento não-numérico como veio (ex.: voo)", () => {
    expect(monstroParaFS({ nome: "Voador", movimento: "12V" }).speed).toBe("12V");
  });
});

describe("bestiário completo", () => {
  const todos = [...BESTIARIO, ...HUMANOIDES].map(monstroParaFS);

  it("toda criatura tem nome e o layout Old Dragon 2", () => {
    expect(todos.length).toBeGreaterThan(0);
    for (const m of todos) {
      expect(m.name, JSON.stringify(m)).toBeTruthy();
      expect(m.layout).toBe("Old Dragon 2");
    }
  });

  it("o array inteiro é serializável em JSON", () => {
    expect(() => JSON.parse(JSON.stringify(todos))).not.toThrow();
  });
});

describe("OD2_LAYOUT", () => {
  it("tem id, nome e blocos, e é serializável", () => {
    expect(OD2_LAYOUT.name).toBe("Old Dragon 2");
    expect(OD2_LAYOUT.id).toBeTruthy();
    expect(Array.isArray(OD2_LAYOUT.blocks)).toBe(true);
    expect(OD2_LAYOUT.blocks.length).toBeGreaterThan(0);
    expect(() => JSON.parse(JSON.stringify(OD2_LAYOUT))).not.toThrow();
  });
});
