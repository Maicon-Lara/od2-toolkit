import { ClasseDef, MonstroSeed, PovoDef } from "./od2";

// Progressões base do OD2 (BA/JP por nível 1..15). Números do SRD gratuito.
const guerreiro = { ba: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], jp: [5, 5, 6, 6, 8, 8, 10, 10, 11, 11, 13, 13, 14, 14, 16] };
const clerigo = { ba: [1, 1, 1, 3, 3, 3, 5, 5, 5, 7, 7, 7, 9, 9, 9], jp: [5, 5, 5, 7, 7, 7, 9, 9, 9, 11, 11, 11, 13, 13, 13] };
const mago = { ba: [0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5], jp: [5, 5, 5, 5, 7, 7, 7, 7, 7, 10, 10, 10, 10, 13, 13] };
const ladrao = { ba: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8], jp: [5, 5, 5, 5, 8, 8, 8, 8, 11, 11, 11, 11, 14, 14, 14] };

// Magias por dia (slots por círculo, nível 1..15).
const clerigoMagias: number[][] = [
  [1,0,0,0,0,0,0],[1,0,0,0,0,0,0],[2,1,0,0,0,0,0],[2,2,0,0,0,0,0],[2,2,1,0,0,0,0],
  [3,2,1,0,0,0,0],[3,2,2,1,0,0,0],[3,3,2,1,0,0,0],[3,3,2,2,1,0,0],[4,3,3,2,1,0,0],
  [4,4,3,3,2,1,0],[5,4,3,3,3,2,0],[5,4,4,3,3,2,0],[5,5,4,3,3,2,1],[6,5,4,4,6,5,1],
];
const magoMagias: number[][] = [
  [1,0,0,0,0],[2,0,0,0,0],[2,1,0,0,0],[2,2,0,0,0],[2,2,1,0,0],
  [3,2,2,0,0],[3,2,2,1,0],[3,3,2,2,0],[3,3,2,2,1],[3,3,3,2,2],
  [4,3,3,2,2],[4,3,3,3,2],[5,4,3,3,2],[5,5,4,3,3],[5,5,4,3,3],
];

// Classes-base do Old Dragon 2 (embutidas). Notas do vault sobrescrevem por nome.
export const BASE_CLASSES: ClasseDef[] = [
  {
    nome: "Guerreiro", base: "Guerreiro", dado_vida: 10, ba: guerreiro.ba, jp: guerreiro.jp,
    poderes: [
      { nivel: 1, nome: "Aparar", desc: "sacrifica escudo/arma para absorver todo o dano de um ataque físico (vs Grande ou menor)" },
      {
        nivel: 1,
        nome: "Maestria em Arma",
        desc: "+1 de dano com uma arma à escolha",
        melhorias: [
          { nivel: 3, desc: "+2 de dano com duas armas escolhidas" },
          { nivel: 10, desc: "+3 de dano com todas as armas dos grupos escolhidos" },
        ],
      },
      { nivel: 6, nome: "Ataque Extra", desc: "um segundo ataque por rodada com a arma de maestria (mesma BA)" },
    ],
  },
  {
    nome: "Clérigo", base: "Clérigo", dado_vida: 8, ba: clerigo.ba, jp: clerigo.jp, magias: clerigoMagias,
    poderes: [
      { nivel: 1, nome: "Magias Divinas", desc: "prepara e conjura magias divinas (limite por nível e SAB)" },
      {
        nivel: 1,
        nome: "Afastar Mortos-Vivos",
        desc: "1×/dia, 18m: mortos-vivos fazem Teste de Moral ou fogem (dados iguais = reduzidos a pó)",
        melhorias: [
          { nivel: 3, desc: "+1 na penalidade e 2×/dia" },
          { nivel: 10, desc: "+2 na penalidade e 3×/dia" },
        ],
      },
      {
        nivel: 1,
        nome: "Cura Milagrosa",
        desc: "troca magia memorizada por Curar Ferimentos de 1º círculo (1d8)",
        melhorias: [
          { nivel: 6, desc: "Curar Ferimentos de 3º círculo (2d8)" },
          { nivel: 10, desc: "Curar Ferimentos de 5º círculo (3d8)" },
        ],
      },
    ],
  },
  {
    nome: "Mago", base: "Mago", dado_vida: 4, ba: mago.ba, jp: mago.jp, magias: magoMagias,
    poderes: [
      { nivel: 1, nome: "Magias Arcanas", desc: "estuda o grimório; começa com 3 magias + 1 de 1º círculo aleatória" },
      { nivel: 1, nome: "Ler Magias", desc: "1×/dia por nível: decifra inscrições e pergaminhos mágicos" },
      {
        nivel: 1,
        nome: "Detectar Magias",
        desc: "1×/dia por nível: sente magia em 9m + 3m/nível (concentração 1d8 rodadas)",
        melhorias: [
          { nivel: 6, desc: "concentração cai para 1d4 rodadas" },
          { nivel: 10, desc: "concentração de apenas 1 rodada" },
        ],
      },
    ],
  },
  {
    nome: "Ladrão", base: "Ladrão", dado_vida: 6, ba: ladrao.ba, jp: ladrao.jp,
    talentos: ["Armadilha", "Arrombar", "Escalar", "Furtividade", "Punga"],
    talentos_atributo: "destreza",
    poderes: [
      {
        nivel: 1,
        nome: "Ataque Furtivo",
        desc: "ataque após aproximação furtiva com dano ×2",
        melhorias: [
          { nivel: 6, desc: "dano ×3" },
          { nivel: 10, desc: "dano ×4" },
        ],
      },
      {
        nivel: 1,
        nome: "Talentos de Ladrão",
        desc: "Armadilha, Arrombar, Escalar, Furtividade e Punga (2 pts cada + 2 extras + mod DES)",
        melhorias: [
          { nivel: 3, desc: "+2 pontos de talento" },
          { nivel: 6, desc: "+2 pontos de talento" },
          { nivel: 10, desc: "+2 pontos de talento" },
        ],
      },
      {
        nivel: 1,
        nome: "Ouvir Ruídos",
        desc: "1-2 em 1d6 para ouvir através de portas",
        melhorias: [
          { nivel: 3, desc: "1-3 em 1d6" },
          { nivel: 6, desc: "1-4 em 1d6" },
          { nivel: 10, desc: "1-5 em 1d6" },
        ],
      },
    ],
  },
];

// Raças-base do Old Dragon 2 (embutidas).
export const BASE_POVOS: PovoDef[] = [
  {
    nome: "Humano", deslocamento: 9, infravisao: "não possui", alinhamento: "qualquer",
    habilidades: [
      { nome: "Aprendizado", desc: "+10% em todo XP ganho" },
      { nome: "Adaptabilidade", desc: "+1 em uma JP à escolha" },
    ],
  },
  {
    nome: "Elfo", deslocamento: 9, infravisao: "18m", alinhamento: "tende a Neutro",
    bonus: { jpd: 1 },
    habilidades: [
      { nome: "Percepção Natural", desc: "detecta portas secretas a 6m (1 em 1d6; 1-2 procurando)" },
      { nome: "Graciosos", desc: "+1 em JPD" },
      { nome: "Arma Racial", desc: "+1 de dano com ataques de arco" },
      { nome: "Imunidades", desc: "imune a sono e à paralisia de Ghoul" },
    ],
  },
  {
    nome: "Anão", deslocamento: 6, infravisao: "18m", alinhamento: "tende a Ordeiro",
    bonus: { jpc: 1 },
    habilidades: [
      { nome: "Mineradores", desc: "detecta anomalias em pedra/armadilhas (1 em 1d6; 1-2 procurando)" },
      { nome: "Vigoroso", desc: "+1 em JPC" },
      { nome: "Armas Grandes", desc: "usa armas médias; armas grandes anãs contam como médias" },
      { nome: "Inimigos", desc: "ataques contra orcs, ogros e hobgoblins são Fáceis" },
    ],
  },
  {
    nome: "Halfling", deslocamento: 6, infravisao: "não possui", alinhamento: "tende a Neutro",
    bonus: { jps: 1 },
    habilidades: [
      { nome: "Furtivos", desc: "esconde-se (1-2 em 1d6); Ladrões somam +1 em Furtividade" },
      { nome: "Destemidos", desc: "+1 em JPS" },
      { nome: "Bons de Mira", desc: "ataques com armas de arremesso são Fáceis" },
      { nome: "Pequenos", desc: "ataques de criaturas Grandes ou maiores são Difíceis contra ele" },
      { nome: "Restrições", desc: "só armadura de couro; armas pequenas/médias (médias = 2 mãos)" },
    ],
  },
  {
    nome: "Meio-Elfo", deslocamento: 9, infravisao: "9m", alinhamento: "tende a Caótico",
    habilidades: [
      { nome: "Aprendizado", desc: "+5% em todo XP ganho" },
      { nome: "Graciosos e Vigorosos", desc: "+1 em JPC ou JPD (à escolha)" },
      { nome: "Idioma Extra", desc: "um idioma adicional" },
      { nome: "Imunidades", desc: "imune a sono e à paralisia de Ghoul" },
    ],
  },
  {
    nome: "Gnomo", deslocamento: 6, infravisao: "18m", alinhamento: "tende a Neutro",
    habilidades: [
      { nome: "Avaliadores", desc: "avalia o valor de arte, gemas e joias (1-4 em 1d6)" },
      { nome: "Sagazes e Vigorosos", desc: "+1 em JPC ou JPS (à escolha)" },
      { nome: "Restrições", desc: "armas pequenas/médias (médias = 2 mãos)" },
    ],
  },
];

// Bestiário inicial (semente) do compêndio — monstros clássicos de baixo nível do OD2.
// Conferir/expandir com o SRD. CA ascendente; DV em d8 (½ = 1d4).
export const BASE_MONSTROS: MonstroSeed[] = [
  {
    nome: "Goblin", tipo: "Humanoide", tamanho: "Pequeno", alinhamento: "Caótico",
    habitat: "Cavernas, ruínas e túneis",
    descricao: "Pequeno humanoide covarde e cruel que ataca em bandos e arma emboscadas.",
    encontro: "2d4 (6d10)", xp: 15, tesouro: "incomum", movimento: "9",
    dv: 1, pv: 5, ca: 13, jp: 5, moral: 7,
    ataques: [
      { nome: "Cutelo", qtd: 1, bonus: 1, dano: "1d6" },
      { nome: "Funda", qtd: 1, bonus: 1, dano: "1d4" },
    ],
    habilidades: [
      { nome: "Visão no escuro", desc: "enxerga no escuro a até 18 metros" },
      { nome: "Covardes", desc: "-1 de Moral quando lutam sob a luz do sol" },
    ],
  },
  {
    nome: "Kobold", tipo: "Humanoide", tamanho: "Pequeno", alinhamento: "Caótico",
    habitat: "Túneis e minas abandonadas",
    descricao: "Humanoide reptiliano pequeno e ardiloso, especialista em armadilhas e ataques em número.",
    encontro: "4d4 (6d10)", xp: 10, tesouro: "incomum", movimento: "9",
    dv: "½", pv: 3, ca: 12, jp: 5, moral: 6,
    ataques: [{ nome: "Arma pequena", qtd: 1, bonus: 0, dano: "1d4" }],
    habilidades: [
      { nome: "Visão no escuro", desc: "enxerga no escuro a até 18 metros" },
      { nome: "Armadilheiros", desc: "preparam armadilhas e emboscadas com vantagem em terreno conhecido" },
    ],
  },
  {
    nome: "Orc", tipo: "Humanoide", tamanho: "Médio", alinhamento: "Caótico",
    habitat: "Fortes, cavernas e terras devastadas",
    descricao: "Humanoide brutal e agressivo, organizado em tribos guerreiras.",
    encontro: "2d4 (1d10 × 10)", xp: 20, tesouro: "comum", movimento: "9",
    dv: 1, pv: 6, ca: 13, jp: 5, moral: 8,
    ataques: [{ nome: "Arma marcial", qtd: 1, bonus: 1, dano: "1d8" }],
    habilidades: [
      { nome: "Visão no escuro", desc: "enxerga no escuro a até 18 metros" },
      { nome: "Sensíveis à luz", desc: "sofrem penalidade quando lutam sob luz forte do sol" },
    ],
  },
  {
    nome: "Esqueleto", tipo: "Morto-vivo", tamanho: "Médio", alinhamento: "Caótico",
    habitat: "Tumbas, ruínas e masmorras",
    descricao: "Ossada reanimada por magia ou maldição; obedece sem hesitar a quem o ergueu.",
    encontro: "3d4 (3d10)", xp: 15, tesouro: "nenhum", movimento: "9",
    dv: 1, pv: 5, ca: 12, jp: 5, moral: 12,
    ataques: [{ nome: "Arma ou garras", qtd: 1, bonus: 1, dano: "1d6" }],
    habilidades: [
      { nome: "Morto-vivo", desc: "imune a sono, encanto e medo; não faz Teste de Moral; afetado por Afastar Mortos-Vivos" },
    ],
  },
];
