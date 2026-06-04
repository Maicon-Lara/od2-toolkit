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

  // --- Especializações (Cap. 3 do SRD) ---
  // Herdam a progressão de BA/JP e o perfil de magia da classe-base e somam poderes próprios.
  // Guerreiro
  {
    nome: "Bárbaro", base: "Guerreiro", dado_vida: 10, ba: guerreiro.ba, jp: guerreiro.jp,
    herda: [{ nome: "Aparar" }, { nome: "Maestria em Arma", sem_evolucao: true }],
    poderes: [
      { nivel: 1, nome: "Aparar", desc: "sacrifica escudo/arma para absorver todo o dano de um ataque físico (vs Grande ou menor)" },
      { nivel: 1, nome: "Maestria em Arma", desc: "+1 de dano com uma arma à escolha"},
      { nivel: 1, nome: "Vigor Bárbaro", desc: "+2 adicional em todas as Jogadas de Proteção" },
      { nivel: 3, nome: "Talentos Selvagens", desc: "escala e se camufla em ambientes naturais" },
      { nivel: 6, nome: "Surpresa Selvagem", desc: "surpreende inimigos em ambientes naturais (1-4 em 1d6)" },
      { nivel: 10, nome: "Força do Totem", desc: "atinge criaturas que só são feridas por arma mágica +1 ou melhor" },
    ],
  },
  {
    nome: "Paladino", base: "Guerreiro", dado_vida: 10, ba: guerreiro.ba, jp: guerreiro.jp,
    herda: [{ nome: "Aparar" }, { nome: "Maestria em Arma", sem_evolucao: true }],
    poderes: [
      { nivel: 1, nome: "Aparar", desc: "sacrifica escudo/arma para absorver todo o dano de um ataque físico (vs Grande ou menor)" },
      { nivel: 1, nome: "Maestria em Arma", desc: "+1 de dano com uma arma à escolha"},
      { nivel: 1, nome: "Imunidade a Doenças", desc: "imune a doenças mundanas e mágicas" },
      { nivel: 3, nome: "Cura pelas Mãos", desc: "cura 1 PV por nível, 1×/dia" },
      { nivel: 6, nome: "Aura de Proteção", desc: "proteção contra criaturas caóticas" },
      { nivel: 10, nome: "Espada Sagrada", desc: "empunha espada mágica com +5 contra o caos" },
    ],
  },
  {
    nome: "Anão Aventureiro", base: "Guerreiro", dado_vida: 10, ba: guerreiro.ba, jp: guerreiro.jp,
    poderes: [
      { nivel: 1, nome: "Arma Racial", desc: "+2 de dano com machado ou martelo" },
      { nivel: 3, nome: "Duro na Queda", desc: "passa a usar d12 de Dado de Vida (pode optar pelo valor médio, 6)" },
      { nivel: 6, nome: "Bastião Racial", desc: "ataques de Orcs, Ogros e Hobgoblins contra ele são Difíceis" },
      { nivel: 10, nome: "Ataque Extra", desc: "segundo ataque por rodada com a arma racial" },
    ],
  },
  {
    nome: "Arqueiro", base: "Guerreiro", dado_vida: 10, ba: guerreiro.ba, jp: guerreiro.jp,
    herda: [{ nome: "Aparar" }, { nome: "Maestria em Arma", sem_evolucao: true }],
    poderes: [
      { nivel: 1, nome: "Aparar", desc: "sacrifica escudo/arma para absorver todo o dano de um ataque físico (vs Grande ou menor)" },
      { nivel: 1, nome: "Maestria em Arma", desc: "+1 de dano com uma arma à escolha"},
      { nivel: 1, nome: "Tiros em Curva", desc: "tiros contra cobertura, à distância ou em combate não são Difíceis" },
      { nivel: 3, nome: "Puxada Aprimorada", desc: "soma o modificador de Força ao dano com arcos" },
      { nivel: 6, nome: "Truques com Flechas", desc: "realiza efeitos especiais com disparos (desarmar, prender etc.)" },
      { nivel: 10, nome: "Tiro Rápido", desc: "segundo disparo por ação de combate" },
    ],
  },
  // Clérigo
  {
    nome: "Druida", base: "Clérigo", dado_vida: 8, ba: clerigo.ba, jp: clerigo.jp, magias: clerigoMagias,
    herda: [{ nome: "Magias Divinas" }],
    poderes: [
      { nivel: 1, nome: "Herbalismo", desc: "identifica plantas, animais e água pura" },
      { nivel: 3, nome: "Previdência", desc: "acampamentos nos ermos são sempre seguros" },
      { nivel: 6, nome: "Transformação", desc: "assume forma animal de até 6 DV, 3×/dia" },
      { nivel: 10, nome: "Transformação Melhorada", desc: "forma animal de até 10 DV, 3×/dia" },
    ],
  },
  {
    nome: "Acadêmico", base: "Clérigo", dado_vida: 8, ba: clerigo.ba, jp: clerigo.jp, magias: clerigoMagias,
    herda: [{ nome: "Magias Divinas" }],
    poderes: [
      { nivel: 1, nome: "Conhecimento Acadêmico", desc: "identifica monstros e fraquezas (1-2 em 1d6)" },
      { nivel: 3, nome: "Decifrar Linguagens", desc: "decodifica textos e idiomas (1-3 em 1d6)" },
      { nivel: 6, nome: "Lendas e Tradições", desc: "conhece eventos históricos e perigos locais (1-4 em 1d6)" },
      { nivel: 10, nome: "Identificar Itens", desc: "reconhece o propósito geral de itens mágicos (1-2 em 1d6)" },
    ],
  },
  {
    nome: "Xamã", base: "Clérigo", dado_vida: 8, ba: clerigo.ba, jp: clerigo.jp, magias: clerigoMagias,
    herda: [{ nome: "Magias Divinas" }],
    poderes: [
      { nivel: 1, nome: "Animal Sagrado", desc: "o símbolo divino concede ataques Fáceis aos aliados" },
      { nivel: 3, nome: "Cura Totêmica", desc: "troca magia memorizada por Curar Ferimentos de 1º círculo (1d8)" },
      { nivel: 6, nome: "Fúria", desc: "leva um aliado à fúria (dado superior, ataques Muito Fáceis)" },
      { nivel: 10, nome: "Fúria da Natureza", desc: "conjura Controlar o Clima (magia de 7º círculo)" },
    ],
  },
  {
    nome: "Proscrito", base: "Clérigo", dado_vida: 8, ba: clerigo.ba, jp: clerigo.jp,
    poderes: [
      { nivel: 1, nome: "Cura Natural", desc: "aumenta a cura natural (2 PV, ou 1d4+1 em repouso)" },
      { nivel: 3, nome: "Treinamento em Combate", desc: "+1 em BA; usa qualquer arma e armadura" },
      { nivel: 6, nome: "Afetar Mortos-Vivos", desc: "força Teste de Moral em mortos-vivos, 1×/dia" },
      { nivel: 10, nome: "Misticismo", desc: "passa a conjurar magias divinas de 1º círculo normalmente" },
    ],
  },
  // Ladrão
  {
    nome: "Ranger", base: "Ladrão", dado_vida: 6, ba: ladrao.ba, jp: ladrao.jp,
    talentos: ["Armadilha", "Arrombar", "Escalar", "Furtividade", "Punga"], talentos_atributo: "destreza",
    poderes: [
      { nivel: 1, nome: "Inimigo Mortal", desc: "ataques contra Orcs, Goblins, Homens-Lagarto, Trolls ou Gigantes são Fáceis" },
      { nivel: 3, nome: "Combativo", desc: "usa armas grandes e escudos sem penalidade" },
      { nivel: 6, nome: "Previdência", desc: "raramente surpreendido nos ermos (1 em 1d6); acampamentos seguros" },
      { nivel: 10, nome: "Companheiro Animal", desc: "ganha uma criatura dos ermos como aliada" },
    ],
  },
  {
    nome: "Bardo", base: "Ladrão", dado_vida: 6, ba: ladrao.ba, jp: ladrao.jp,
    talentos: ["Armadilha", "Arrombar", "Escalar", "Furtividade", "Punga"], talentos_atributo: "destreza",
    herda: [{ nome: "Ouvir Ruídos" }],
    poderes: [
      { nivel: 1, nome: "Influenciar", desc: "modifica reações de NPCs com música/oratória (±1 no teste)" },
      { nivel: 3, nome: "Inspirar", desc: "aliados inspirados fazem testes como um grau mais fácil" },
      { nivel: 6, nome: "Fascinar", desc: "concentra audiência não-hostil (até 2 DV por 3 níveis)" },
      { nivel: 10, nome: "Usar Pergaminhos", desc: "conjura pergaminhos arcanos como Mago de metade dos níveis" },
    ],
  },
  {
    nome: "Assassino", base: "Ladrão", dado_vida: 6, ba: ladrao.ba, jp: ladrao.jp,
    talentos: ["Armadilha", "Arrombar", "Escalar", "Furtividade", "Punga"], talentos_atributo: "destreza",
    poderes: [
      { nivel: 1, nome: "Ataque Assassino", desc: "ataque furtivo causa dano ×2" },
      { nivel: 3, nome: "Espreitar", desc: "observar 1 rodada torna o ataque Fácil; 4 rodadas, Muito Fácil" },
      { nivel: 6, nome: "Assassinato", desc: "golpe potencialmente fatal via furtivo (1-2 em 1d6)" },
      { nivel: 10, nome: "Ataque Mortal", desc: "ataque assassino causa dano ×3" },
    ],
  },
  {
    nome: "Halfling Aventureiro", base: "Ladrão", dado_vida: 6, ba: ladrao.ba, jp: ladrao.jp,
    talentos: ["Armadilha", "Arrombar", "Escalar", "Furtividade", "Punga"], talentos_atributo: "destreza",
    poderes: [
      { nivel: 1, nome: "Arma Racial", desc: "+2 de dano com uma arma de arremesso à escolha" },
      { nivel: 3, nome: "Valente", desc: "imune a medo/terror; testes contra intimidação são Fáceis" },
      { nivel: 6, nome: "No Alvo", desc: "ataques à distância com a arma racial são Muito Fáceis" },
      { nivel: 10, nome: "Arremesso Extra", desc: "segundo arremesso por ataque com a arma racial" },
    ],
  },
  // Mago
  {
    nome: "Ilusionista", base: "Mago", dado_vida: 4, ba: mago.ba, jp: mago.jp, magias: magoMagias,
    herda: [{ nome: "Magias Arcanas" }, { nome: "Ler Magias" }, { nome: "Detectar Magias" }],
    poderes: [
      { nivel: 1, nome: "Magias Exclusivas", desc: "acesso a Ilusão e Som Ilusório (1×/dia, sem memorizar)" },
      { nivel: 3, nome: "Ilusão Melhorada", desc: "magia exclusiva adicional" },
      { nivel: 6, nome: "Miragem", desc: "magia exclusiva adicional" },
      { nivel: 10, nome: "Ilusão Permanente", desc: "magia exclusiva adicional" },
    ],
  },
  {
    nome: "Necromante", base: "Mago", dado_vida: 4, ba: mago.ba, jp: mago.jp, magias: magoMagias,
    herda: [{ nome: "Magias Arcanas" }, { nome: "Ler Magias" }, { nome: "Detectar Magias" }],
    poderes: [
      { nivel: 1, nome: "Magias Exclusivas", desc: "acesso a Toque Sombrio e Aterrorizar (1×/dia, sem memorizar)" },
      { nivel: 3, nome: "Criar Mortos-Vivos", desc: "magia exclusiva adicional" },
      { nivel: 6, nome: "Drenar Vida", desc: "magia exclusiva adicional" },
      { nivel: 10, nome: "Magia da Morte", desc: "magia exclusiva adicional" },
    ],
  },
  {
    nome: "Bruxo", base: "Mago", dado_vida: 4, ba: mago.ba, jp: mago.jp,
    herda: [{ nome: "Ler Magias" }, { nome: "Detectar Magias" }],
    poderes: [
      { nivel: 1, nome: "Iniciado", desc: "conjura magias via rituais (1 rodada); usa armas médias e armaduras leves" },
      { nivel: 3, nome: "Médium", desc: "acesso a magias de 2º círculo; usa armas grandes" },
      { nivel: 6, nome: "Conjurador", desc: "acesso a magias de 3º círculo; usa armaduras médias" },
      { nivel: 10, nome: "Entidade", desc: "acesso a magias de 4º a 6º círculo; usa todas as armas e armaduras" },
    ],
  },
  {
    nome: "Elfo Aventureiro", base: "Mago", dado_vida: 4, ba: mago.ba, jp: mago.jp, magias: magoMagias,
    poderes: [
      { nivel: 1, nome: "Treinamento Racial", desc: "+2 de dano com a arma racial (cimitarra ou arco)" },
      { nivel: 3, nome: "Brilho Mágico", desc: "conjura 1 magia de 1º círculo por dia" },
      { nivel: 6, nome: "Esplendor Arcano", desc: "conjura magias como Mago 5 níveis abaixo" },
      { nivel: 10, nome: "Ataque Extra", desc: "segundo ataque por rodada com a arma racial" },
    ],
  },
];

// Raças-base do Old Dragon 2 (embutidas).
export const BASE_POVOS: PovoDef[] = [
  {
    nome: "Humano", deslocamento: 9, infravisao: "não possui", alinhamento: "qualquer",
    descricao: "Seres versáteis e adaptáveis, aprendem rápido e prosperam em qualquer ambiente. Sua diversidade permite ajustar-se a praticamente qualquer situação.",
    habilidades: [
      { nome: "Aprendizado", desc: "+10% em todo XP ganho" },
      { nome: "Adaptabilidade", desc: "+1 em uma JP à escolha" },
    ],
  },
  {
    nome: "Elfo", deslocamento: 9, infravisao: "18m", alinhamento: "tende a Neutro",
    descricao: "Graciosos e conectados à natureza, têm percepção aguçada e movimentos precisos. Sua tradição com o arco e a resistência a certos efeitos mágicos os tornam seres especiais e longevos.",
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
    descricao: "Resistentes e experientes em ambientes subterrâneos, são mineradores natos que detectam anomalias na pedra. Seu vigor e a inimizade natural com certos povos os fazem guerreiros formidáveis e desconfiados.",
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
    descricao: "Pequenos, ágeis e surpreendentemente destemidos, compensam a baixa estatura com furtividade e pontaria em arremessos. Cautelosos e resistentes mentalmente, são sobreviventes notáveis.",
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
    descricao: "Misturam traços de humanos e elfos: herdam o aprendizado acelerado e a graciosidade e resistência élficas. Sua natureza plural confere versatilidade e imunidades especiais.",
    habilidades: [
      { nome: "Aprendizado", desc: "+5% em todo XP ganho" },
      { nome: "Graciosos e Vigorosos", desc: "+1 em JPC ou JPD (à escolha)" },
      { nome: "Idioma Extra", desc: "um idioma adicional" },
      { nome: "Imunidades", desc: "imune a sono e à paralisia de Ghoul" },
    ],
  },
  {
    nome: "Gnomo", deslocamento: 6, infravisao: "18m", alinhamento: "tende a Neutro",
    descricao: "Pequenos mas astutos, são avaliadores precisos de objetos valiosos e desconfiados por natureza. Sagazes, vigorosos e habilidosos na mineração, são artesãos e estrategistas respeitáveis.",
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
