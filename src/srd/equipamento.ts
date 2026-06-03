// Equipamento do SRD do Old Dragon 2 (Cap. 5). Conteúdo CC BY-SA 4.0.
// Old Dragon 2ª edição © 2023 da Old Dragon Editora.
// Extraído do SRD; conferir valores por amostragem.

import { ArmaDef, ArmaduraDef, ItemDef } from "../od2";

export const SISTEMA_MONETARIO: string[] = [
  "10 Peças de Cobre (PC) = 1 Peça de Prata (PP)",
  "10 PP = 1 Peça de Ouro (PO)  ·  100 PC = 1 PO",
  "100 PC = 1 kg de peso (em moedas)",
  "Renda inicial de um aventureiro: 3d6 × 10 PO",
];

export const ARMAS: ArmaDef[] = [
  { nome: "Adaga", dano: "1d4", categoria: "Pequena, Perfurante", alcance: "Arremesso 9m", custo: "2 PO", carga: "1" },
  { nome: "Alabarda", dano: "1d10", categoria: "Grande, Cortante, Duas Mãos", alcance: "Haste 3m", custo: "8 PO", carga: "3" },
  { nome: "Arco Curto", dano: "por flecha", categoria: "Média, Disparo", alcance: "30m", custo: "25 PO", carga: "2" },
  { nome: "Arco Longo", dano: "por flecha", categoria: "Grande, Disparo", alcance: "45m", custo: "60 PO", carga: "3" },
  { nome: "Flecha de Caça", dano: "1d6", categoria: "Perfurante (munição)", custo: "1 PP/20", carga: "#" },
  { nome: "Flecha de Guerra", dano: "1d8", categoria: "Perfurante (munição)", custo: "1 PO/20", carga: "#" },
  { nome: "Azagaia", dano: "1d4", categoria: "Pequena, Perfurante", alcance: "Arremesso 18m", custo: "1 PO", carga: "1" },
  { nome: "Besta de Mão", dano: "por virote", categoria: "Pequena, Disparo", alcance: "36m", custo: "30 PO", carga: "1" },
  { nome: "Virote Pequeno", dano: "1d4", categoria: "Perfurante (munição)", custo: "2 PP/20", carga: "#" },
  { nome: "Besta", dano: "por virote", categoria: "Média, Disparo", alcance: "54m", custo: "50 PO", carga: "2" },
  { nome: "Virote", dano: "1d6", categoria: "Perfurante (munição)", custo: "4 PP/20", carga: "#" },
  { nome: "Bordão/Cajado", dano: "1d4", categoria: "Pequena, Impactante, Duas Mãos", custo: "1 PP", carga: "1" },
  { nome: "Cimitarra", dano: "1d6", categoria: "Média, Cortante", custo: "15 PO", carga: "2" },
  { nome: "Espada Bastarda", dano: "1d8", categoria: "Média, Versátil, Cortante", custo: "15 PO", carga: "2" },
  { nome: "Espada Curta", dano: "1d6", categoria: "Pequena, Cortante", custo: "6 PO", carga: "1" },
  { nome: "Espada Longa", dano: "1d8", categoria: "Média, Cortante", custo: "10 PO", carga: "2" },
  { nome: "Funda", dano: "1d4", categoria: "Pequena, Impactante", alcance: "Arremesso 27m", custo: "5 PP", carga: "1" },
  { nome: "Lança", dano: "1d6", categoria: "Média, Perfurante", alcance: "Arremesso 12m, Haste 3m", custo: "4 PO", carga: "2" },
  { nome: "Lança Montada", dano: "1d8", categoria: "Grande, Perfurante, Haste, Duas Mãos", custo: "5 PO", carga: "3" },
  { nome: "Maça", dano: "1d8", categoria: "Média, Impactante", custo: "6 PO", carga: "2" },
  { nome: "Machado", dano: "1d8", categoria: "Média, Cortante", custo: "6 PO", carga: "2" },
  { nome: "Machado de Batalha", dano: "2d6", categoria: "Grande, Cortante, Duas Mãos", custo: "16 PO", carga: "3" },
  { nome: "Mangual", dano: "1d8", categoria: "Grande, Impactante", custo: "10 PO", carga: "3" },
  { nome: "Martelo", dano: "1d6", categoria: "Média, Impactante", alcance: "Arremesso 6m", custo: "6 PO", carga: "2" },
  { nome: "Martelo de Batalha", dano: "2d4", categoria: "Grande, Impactante", custo: "12 PO", carga: "3" },
  { nome: "Montante", dano: "1d12", categoria: "Grande, Cortante, Duas Mãos", custo: "16 PO", carga: "3" },
  { nome: "Pique", dano: "1d10", categoria: "Grande, Perfurante, Haste, Duas Mãos", custo: "8 PO", carga: "3" },
  { nome: "Porrete/Clava", dano: "1d4", categoria: "Média, Versátil, Impactante", custo: "5 PP", carga: "2" },
];

export const ARMADURAS: ArmaduraDef[] = [
  { nome: "Armadura Acolchoada", ca: "+1", tipo: "Leve, Couro", custo: "5 PO", carga: "1" },
  { nome: "Armadura de Couro", ca: "+2", tipo: "Leve, Couro", custo: "20 PO", carga: "1" },
  { nome: "Armadura de Couro Batido", ca: "+3", tipo: "Média, Couro", custo: "30 PO", carga: "2" },
  { nome: "Cota de Malha", ca: "+4", tipo: "Média, Metal", custo: "60 PO", carga: "2" },
  { nome: "Armadura de Placas", ca: "+5", tipo: "Pesada, Metal", custo: "300 PO", carga: "3" },
  { nome: "Armadura Completa", ca: "+7", tipo: "Pesada, Metal", custo: "2.000 PO", carga: "3" },
  { nome: "Escudo", ca: "+1", tipo: "Leve, Madeira", custo: "8 PO", carga: "1" },
];

export const ITENS_GERAIS: ItemDef[] = [
  { nome: "Água Benta (500ml)", peso: "0,5 kg", custo: "25 PO" },
  { nome: "Apito", custo: "1 PO" },
  { nome: "Arpéu", peso: "1 kg", custo: "2 PO" },
  { nome: "Cadeado", peso: "0,5 kg", custo: "12 PO" },
  { nome: "Coberta de Inverno", peso: "1 kg", custo: "1 PO" },
  { nome: "Corda (15m)", peso: "2 kg", custo: "1 PO" },
  { nome: "Corrente (15m)", peso: "20 kg", custo: "5 PO" },
  { nome: "Escada (3m)", peso: "5 kg", custo: "1 PO" },
  { nome: "Ferramentas de Ladrão", peso: "0,5 kg", custo: "25 PO" },
  { nome: "Ganchos/Cravos (5 un)", peso: "0,5 kg", custo: "1 PO" },
  { nome: "Grimório", peso: "1 kg", custo: "25 PO" },
  { nome: "Lamparina", peso: "1 kg", custo: "1 PO" },
  { nome: "Lanterna Furta-Fogo", peso: "2 kg", custo: "2 PO" },
  { nome: "Martelo (ferramenta)", peso: "0,5 kg", custo: "5 PP" },
  { nome: "Manto", peso: "0,5 kg", custo: "5 PP" },
  { nome: "Óleo (500ml)", peso: "0,5 kg", custo: "5 PP" },
  { nome: "Pá/Picareta", peso: "1 kg", custo: "5 PP" },
  { nome: "Pé de Cabra", peso: "1 kg", custo: "1 PO" },
  { nome: "Ração de Viagem", peso: "0,5 kg", custo: "1 PO" },
  { nome: "Rede", peso: "2 kg", custo: "2 PO" },
  { nome: "Saco de Dormir", peso: "0,5 kg", custo: "5 PP" },
  { nome: "Símbolo Divino", peso: "0,5 kg", custo: "1 PO" },
  { nome: "Tenda Pequena", peso: "3 kg", custo: "10 PO" },
  { nome: "Tochas (5 un)", peso: "0,5 kg", custo: "1 PO" },
  { nome: "Traje de Exploração", peso: "2 kg", custo: "3 PO" },
  { nome: "Traje Nobre", peso: "1,5 kg", custo: "20 PO" },
  { nome: "Traje de Inverno", peso: "3 kg", custo: "5 PO" },
];
