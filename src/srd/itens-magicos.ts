// Itens mágicos do SRD do Old Dragon 2 (Cap. 9 — Mestrando). Conteúdo CC BY-SA 4.0.
// Old Dragon 2ª edição © 2023 da Old Dragon Editora.
// Encantamentos genéricos de arma são listados uma vez (aplicam-se a vários tipos de arma).

export interface ItemMagico {
  nome: string;
  categoria: string;
  efeito: string;
}

export const ITENS_MAGICOS: ItemMagico[] = [
  // Espadas distintas
  { nome: "Espada da Cura", categoria: "Espada", efeito: "cura 1d8+4 PV por dia ao tocar um alvo" },
  { nome: "Espada de Drenar Energia", categoria: "Espada", efeito: "drena 1d4+4 níveis/DV; possui 1d6+6 cargas" },
  { nome: "Espada Defensora", categoria: "Espada", efeito: "alterna o bônus entre CA e ataque" },
  { nome: "Espada Flamejante", categoria: "Espada", efeito: "+1d6 de dano contra criaturas de gelo; ilumina como tocha" },
  { nome: "Espada Gélida", categoria: "Espada", efeito: "+1d6 de dano contra criaturas de fogo; protege do fogo" },
  { nome: "Espada da Luz", categoria: "Espada", efeito: "acende como tocha (raio 6m) por 6 turnos" },
  { nome: "Espada Matadora", categoria: "Espada", efeito: "+1 adicional contra um tipo (orcs, mortos-vivos, gigantes, dragões, licantropos, regeneradores, conjuradores ou extraplanares)" },
  { nome: "Espada da Respiração", categoria: "Espada", efeito: "permite respirar em qualquer ambiente por 6 turnos, 1×/dia" },
  { nome: "Espada da Velocidade", categoria: "Espada", efeito: "dobra movimento, +2 CA e ataque extra; envelhece o usuário" },
  { nome: "Espada Vorpal", categoria: "Espada", efeito: "no acerto crítico (20) decapita o alvo" },
  { nome: "Espada Inteligente", categoria: "Espada", efeito: "dotada de inteligência, personalidade e poderes próprios" },
  { nome: "Espada Amaldiçoada", categoria: "Espada", efeito: "−1 ou −2 em ataque e dano até remover a maldição" },

  // Encantamentos genéricos de arma (aplicáveis a vários tipos)
  { nome: "Arma Defensora", categoria: "Encantamento de Arma", efeito: "o bônus de proteção também soma à CA" },
  { nome: "Arma de Desarme", categoria: "Encantamento de Arma", efeito: "alvo que falhar na JPC perde a arma das mãos" },
  { nome: "Arma Vigilante", categoria: "Encantamento de Arma", efeito: "vibra ao detectar um tipo específico de monstro em 18m" },
  { nome: "Arma de Retorno", categoria: "Encantamento de Arma", efeito: "retorna à mão após ser arremessada" },
  { nome: "Arma de Explosão", categoria: "Encantamento de Arma", efeito: "+1d6 de dano em área de até 1d4 m" },
  { nome: "Arma de Voo", categoria: "Encantamento de Arma", efeito: "concede voo de 36m/turno por até 3 turnos" },
  { nome: "Arma Crítica", categoria: "Encantamento de Arma", efeito: "acerto crítico com 19-20, causando dano dobrado" },
  { nome: "Arma da Velocidade", categoria: "Encantamento de Arma", efeito: "dobra movimento, +2 CA e ataque extra; envelhece o usuário" },
  { nome: "Arma Curadora", categoria: "Encantamento de Arma", efeito: "cura 1d8+4 PV por dia" },
  { nome: "Projétil de Atordoamento", categoria: "Encantamento de Arma", efeito: "alvo que falhar na JPC fica atordoado 1d6 rodadas" },
  { nome: "Projétil Penetrante", categoria: "Encantamento de Arma", efeito: "ignora proteções menores que paredes" },

  // Armaduras e escudos
  { nome: "Armadura/Escudo da Absorção", categoria: "Armadura", efeito: "absorve ataques de dreno, consumindo o bônus de proteção" },
  { nome: "Armadura/Escudo da Velocidade", categoria: "Armadura", efeito: "dobra movimento, +2 CA e ataque extra; envelhece o usuário" },
  { nome: "Armadura/Escudo Curadora", categoria: "Armadura", efeito: "cura 1d8 PV por dia" },
  { nome: "Armadura/Escudo da Retribuição", categoria: "Armadura", efeito: "redireciona um ataque recebido por dia" },
  { nome: "Armadura/Escudo da Invisibilidade", categoria: "Armadura", efeito: "torna o usuário invisível 2×/dia" },
  { nome: "Armadura/Escudo da Reflexão", categoria: "Armadura", efeito: "reflete ataques mágicos/de energia até 3×/dia" },
  { nome: "Armadura/Escudo contra Projéteis", categoria: "Armadura", efeito: "bônus dobrado contra ataques de projétil" },
  { nome: "Armadura Amaldiçoada", categoria: "Armadura", efeito: "−1 ou −2 na CA até remover a maldição" },

  // Poções
  { nome: "Poção de Cura", categoria: "Poção", efeito: "cura 1d8 PV ou uma doença" },
  { nome: "Poção de Controle", categoria: "Poção", efeito: "controla até 1d6 alvos ou um gigante" },
  { nome: "Poção de Diminuição", categoria: "Poção", efeito: "reduz o usuário a 15 cm; 1-5 em 1d6 de ficar invisível" },
  { nome: "Poção de Forma Gasosa", categoria: "Poção", efeito: "transforma em nuvem de gás" },
  { nome: "Poção de Força Gigante", categoria: "Poção", efeito: "força extraordinária; dano dobrado; disparo 3d6" },
  { nome: "Poção do Crescimento", categoria: "Poção", efeito: "dobra tamanho e força; dano dobrado" },
  { nome: "Poção da Invisibilidade", categoria: "Poção", efeito: "torna invisível, como a magia de 2º círculo" },
  { nome: "Poção de Antídoto", categoria: "Poção", efeito: "anula veneno ou repete a JPC com +10" },
  { nome: "Poção de Defesa", categoria: "Poção", efeito: "+1d4+1 na CA por 1 turno" },
  { nome: "Poção de Metamorfose", categoria: "Poção", efeito: "transforma em um animal específico" },
  { nome: "Poção da Velocidade", categoria: "Poção", efeito: "dobra movimento, +2 CA e ataque extra; envelhece" },
  { nome: "Poção da Clarividência", categoria: "Poção", efeito: "visualiza um lugar conhecido já visitado" },
  { nome: "Poção de Percepção Extrassensorial", categoria: "Poção", efeito: "ouve pensamentos em 18m" },
  { nome: "Poção de Resistência ao Fogo", categoria: "Poção", efeito: "imunidade ou grande redução a dano de fogo" },
  { nome: "Poção do Voo", categoria: "Poção", efeito: "voo de 36m/turno por até 3 turnos" },
  { nome: "Poção do Heroísmo", categoria: "Poção", efeito: "concede níveis de classe por 1d4 horas" },
  { nome: "Poção de Respirar na Água", categoria: "Poção", efeito: "respira debaixo d’água normalmente" },
  { nome: "Poção de Veneno", categoria: "Poção", efeito: "veneno de tipo variável (amaldiçoada)" },
  { nome: "Poção Amaldiçoada/Placebo", categoria: "Poção", efeito: "efeito aleatório ou nenhum efeito real (falsa percepção)" },

  // Hastes e outros
  { nome: "Pergaminho Mágico", categoria: "Pergaminho", efeito: "contém fórmulas de magias ou documentos valiosos" },
  { nome: "Anel Mágico", categoria: "Anel", efeito: "efeitos variados conforme o anel" },
  { nome: "Varinha", categoria: "Haste Mágica", efeito: "efeitos diversos; consome cargas" },
  { nome: "Bastão", categoria: "Haste Mágica", efeito: "efeitos diversos; consome cargas" },
  { nome: "Cajado", categoria: "Haste Mágica", efeito: "efeitos diversos; consome cargas" },
  { nome: "Item Maravilhoso", categoria: "Item Maravilhoso", efeito: "itens gerais que não se encaixam nas outras categorias" },
];
