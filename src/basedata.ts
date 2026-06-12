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

// Limiares de XP por nível (1..10) do OD2 — Tabelas 3.1 a 3.4 (LB1). Índice = nível-1;
// valor = XP mínimo para estar naquele nível. Cada classe-base tem uma coluna "XP" e uma
// "XP Especial" (mais cara, usada pelas especializações). As tabelas do LB1 vão até o 10º
// nível; do 11º em diante o OD2 trata como regra avançada do LB2.
const xpLadrao = [0, 1000, 2000, 4000, 7000, 14000, 24000, 34000, 44000, 88000];
const xpClerigo = [0, 1500, 3000, 5500, 8500, 17000, 27000, 37000, 47000, 94000];
const xpGuerreiro = [0, 2000, 4000, 7000, 10000, 20000, 30000, 40000, 50000, 100000];
const xpMago = [0, 2500, 5000, 8500, 11500, 23000, 33000, 43000, 53000, 106000];
const xpMagoEspecial = [0, 3000, 6000, 10000, 13000, 26000, 36000, 46000, 56000, 112000];
// A coluna "XP Especial" de cada base coincide com a coluna "XP" da base seguinte
// (Ladrão → Clérigo → Guerreiro → Mago), e o Mago tem uma coluna especial própria.
const XP_BASE: Record<string, number[]> = {
  Guerreiro: xpGuerreiro, Clérigo: xpClerigo, Mago: xpMago, Ladrão: xpLadrao,
};
const XP_ESPECIAL: Record<string, number[]> = {
  Guerreiro: xpMago, Clérigo: xpGuerreiro, Mago: xpMagoEspecial, Ladrão: xpClerigo,
};

// Classes-base do Old Dragon 2 (embutidas). Notas do vault sobrescrevem por nome.
export const BASE_CLASSES: ClasseDef[] = [
  {
    nome: "Guerreiro", base: "Guerreiro", dado_vida: 10, ba: guerreiro.ba, jp: guerreiro.jp,
    poderes: [
      { nivel: 1, nome: "Aparar", desc: "após receber um ataque físico que o atinja, antes da jogada de dano, sacrifica o escudo ou uma arma que esteja portando para absorver todo o dano do ataque. A arma ou escudo usado fica inutilizado; itens mágicos têm 1-2 em 1d6 de se danificar, perdendo 1 de bônus a cada vez (ao zerar os bônus, são destruídos). Só aparam ataques de inimigos Grandes ou menores" },
      {
        nivel: 1,
        nome: "Maestria em Arma",
        desc: "torna-se mestre em uma arma à escolha, recebendo +1 de dano com ela",
        melhorias: [
          { nivel: 3, desc: "estende a maestria a uma segunda arma à escolha e melhora o bônus de ambas para +2 de dano" },
          { nivel: 10, desc: "estende a maestria a todos os grupos de armas semelhantes aos que já domina (cortantes, perfurantes, impactantes, disparos, hastes ou arremesso), com +3 de dano em todas as armas desses grupos" },
        ],
      },
      { nivel: 6, nome: "Ataque Extra", desc: "no 6º nível ganha um segundo ataque, corpo a corpo ou à distância, com uma arma de maestria, desferido logo após o primeiro e antes da ação do próximo na iniciativa, com a mesma BA" },
    ],
  },
  {
    nome: "Clérigo", base: "Clérigo", dado_vida: 8, ba: clerigo.ba, jp: clerigo.jp, magias: clerigoMagias,
    poderes: [
      { nivel: 1, nome: "Magias Divinas", desc: "conjura magias divinas diariamente; para prepará-las, reza ao seu panteão pedindo as magias do dia, respeitando os limites de nível e de Sabedoria" },
      {
        nivel: 1,
        nome: "Afastar Mortos-Vivos",
        desc: "1×/dia, brandindo o símbolo sagrado: mortos-vivos em até 18 m que falhem num teste de moral no fim da rodada fogem do Clérigo; os que passam ficam imunes a um novo Afastar dele até ele subir de nível. Se a falha vier em dados iguais (dois 4, dois 5 ou dois 6), o morto-vivo é reduzido a pó",
        melhorias: [
          { nivel: 3, desc: "+1 no resultado do teste de moral contra o Afastar e passa a usá-lo 2×/dia" },
          { nivel: 10, desc: "+2 no resultado do teste de moral contra o Afastar e passa a usá-lo 3×/dia" },
        ],
      },
      {
        nivel: 1,
        nome: "Cura Milagrosa",
        desc: "troca uma magia memorizada por Curar Ferimentos de 1º círculo",
        melhorias: [
          { nivel: 6, desc: "pode trocar por Curar Ferimentos de 3º círculo (cura até 2d8)" },
          { nivel: 10, desc: "pode trocar por Curar Ferimentos de 5º círculo (cura até 3d8)" },
        ],
      },
    ],
  },
  {
    nome: "Mago", base: "Mago", dado_vida: 4, ba: mago.ba, jp: mago.jp, magias: magoMagias,
    poderes: [
      { nivel: 1, nome: "Magias Arcanas", desc: "conjura magias arcanas diariamente, memorizando-as ao estudar o grimório (sem ele, não memoriza). No 1º nível o grimório traz 3 magias de 1º círculo à escolha mais 1 aleatória de 1º círculo; novas magias entram copiando de grimórios ou pergaminhos. Pode registrar magias de círculos acima da sua capacidade, mas só as memoriza ao atingir o nível necessário" },
      { nivel: 1, nome: "Ler Magias", desc: "1×/dia por nível, decifra e lê inscrições mágicas em qualquer lugar, identificando qual magia está ali; não identifica itens mágicos nem é necessário para lançar magias escritas" },
      {
        nivel: 1,
        nome: "Detectar Magias",
        desc: "1×/dia por nível, concentrando-se, percebe a presença de magia numa área de 9m + 3m/nível (uma aura tênue, sem identificar a magia, o conjurador ou o efeito); exige 1d8 rodadas de concentração",
        melhorias: [
          { nivel: 6, desc: "a concentração cai para 1d4 rodadas" },
          { nivel: 10, desc: "a concentração cai para apenas 1 rodada" },
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
        desc: "ao atacar após uma aproximação furtiva, faz um ataque Muito Fácil com dano multiplicado por 2",
        melhorias: [
          { nivel: 6, desc: "o dano do ataque furtivo passa a ser multiplicado por 3" },
          { nivel: 10, desc: "o dano do ataque furtivo passa a ser multiplicado por 4" },
        ],
      },
      {
        nivel: 1,
        nome: "Talentos de Ladrão",
        desc: "domina Armadilha, Arrombar, Escalar, Furtividade e Punga: começa com 2 pontos em cada, mais 2 para distribuir e +1 por ponto de modificador de Destreza no 1º nível. O teste é rolar 1d6 igual ou abaixo do valor do talento; limite 5, no máximo 1 ponto por talento por nível",
        melhorias: [
          { nivel: 3, desc: "+2 pontos de talento (máx. 1 por talento, limite 5)" },
          { nivel: 6, desc: "+2 pontos de talento (máx. 1 por talento, limite 5)" },
          { nivel: 10, desc: "+2 pontos de talento (máx. 1 por talento, limite 5)" },
        ],
      },
      {
        nivel: 1,
        nome: "Ouvir Ruídos",
        desc: "em ambiente silencioso e fora de combate, ouve ruídos atrás de portas ou monstros se aproximando (1-2 em 1d6)",
        melhorias: [
          { nivel: 3, desc: "a chance sobe para 1-3 em 1d6" },
          { nivel: 6, desc: "a chance sobe para 1-4 em 1d6" },
          { nivel: 10, desc: "a chance sobe para 1-5 em 1d6" },
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
      { nivel: 1, nome: "Vigor Bárbaro", desc: "a cada nível recebe +2 pontos de vida adicionais à tabela de Guerreiro e +2 na JPC" },
      { nivel: 3, nome: "Talentos Selvagens", desc: "escala superfícies naturais como um Ladrão (1-3 em 1d6; na falha, cai de metade da altura, 1d6 de dano a cada 3 m) e se camufla em ambientes naturais (1-2 em 1d6, rolado em segredo pelo Mestre)" },
      { nivel: 6, nome: "Surpresa Selvagem", desc: "surpreende inimigos em ambientes naturais (1-4 em 1d6), mesmo em tocaia com aliados não-bárbaros, e só é surpreendido nesses ambientes com 1 em 1d6" },
      { nivel: 10, nome: "Força do Totem", desc: "atinge qualquer criatura que só possa ser ferida por arma mágica +1 ou melhor" },
    ],
  },
  {
    nome: "Paladino", base: "Guerreiro", dado_vida: 10, ba: guerreiro.ba, jp: guerreiro.jp,
    herda: [{ nome: "Aparar" }, { nome: "Maestria em Arma", sem_evolucao: true }],
    poderes: [
      { nivel: 1, nome: "Imunidade a Doenças", desc: "imune a qualquer doença, mundana ou mágica — danos e efeitos não o afetam, como se nunca contagiado" },
      { nivel: 3, nome: "Cura pelas Mãos", desc: "1×/dia, pela imposição das mãos, cura 1 PV por nível no alvo tocado; não cura doenças nem regenera membros, mas estabiliza quem agoniza" },
      { nivel: 6, nome: "Aura de Proteção", desc: "cria ao seu redor uma barreira permanente igual à magia Proteção contra Alinhamento, protegendo-o de criaturas caóticas" },
      { nivel: 10, nome: "Espada Sagrada", desc: "ao derrotar um grande inimigo caótico, consagra uma espada mágica como Espada Sagrada: mantém os bônus normais e ganha +5 adicional nos ataques e danos contra criaturas caóticas" },
    ],
  },
  {
    nome: "Anão Aventureiro", base: "Guerreiro", dado_vida: 10, ba: guerreiro.ba, jp: guerreiro.jp,
    poderes: [
      { nivel: 1, nome: "Arma Racial", desc: "mantém as habilidades raciais de anão e se especializa em machados ou martelos, ganhando +2 de dano com a arma escolhida, tratada como arma racial" },
      { nivel: 3, nome: "Duro na Queda", desc: "do 3º ao 10º nível, joga seus pontos de vida com 1d12 em vez de 1d10 (pode optar pelo valor médio, 6, em vez de rolar)" },
      { nivel: 6, nome: "Bastião Racial", desc: "ataques de Orcs, Ogros e Hobgoblins contra ele são considerados Difíceis" },
      { nivel: 10, nome: "Ataque Extra", desc: "ganha um segundo ataque com a arma racial (machado ou martelo), logo após o primeiro e antes da ação do próximo na iniciativa, com a mesma BA" },
    ],
  },
  {
    nome: "Arqueiro", base: "Guerreiro", dado_vida: 10, ba: guerreiro.ba, jp: guerreiro.jp,
    herda: [{ nome: "Aparar" }, { nome: "Maestria em Arma", sem_evolucao: true }],
    poderes: [
      { nivel: 1, nome: "Tiros em Curva", desc: "domina tiros em curva: não são Difíceis para ele os disparos contra alvos com cobertura, além do alcance do arco, ou engajados em combate corpo a corpo" },
      { nivel: 3, nome: "Puxada Aprimorada", desc: "soma o modificador de Força ao dano dos ataques com arcos" },
      { nivel: 6, nome: "Truques com Flechas", desc: "realiza truques com os disparos (grampear na madeira, desarmar, flecha que apita etc.): faz um ataque normal contra CA + DV do alvo e, se acertar, o alvo escolhe entre sofrer o truque ou receber o dano normal (o Mestre arbitra os efeitos)" },
      { nivel: 10, nome: "Tiro Rápido", desc: "realiza um segundo disparo durante sua ação de combate" },
    ],
  },
  // Clérigo
  {
    nome: "Druida", base: "Clérigo", dado_vida: 8, ba: clerigo.ba, jp: clerigo.jp, magias: clerigoMagias,
    herda: [{ nome: "Magias Divinas" }],
    poderes: [
      { nivel: 1, nome: "Herbalismo", desc: "identifica plantas e animais e reconhece água pura e segura para consumo" },
      { nivel: 3, nome: "Previdência", desc: "acampamentos que monta nos ermos são sempre do tipo seguro" },
      { nivel: 6, nome: "Transformação", desc: "3×/dia, assume a forma de um animal não-mágico de até 6 DV, ganhando uma habilidade especial dele (ex.: o abraço do urso), mas mantendo seus próprios BA, JP, CA e PV" },
      { nivel: 10, nome: "Transformação Melhorada", desc: "3×/dia, assume a forma de um animal não-mágico de qualquer tamanho até 10 DV e adota todas as habilidades especiais dele, mantendo seus próprios BA, JP, CA e PV" },
    ],
  },
  {
    nome: "Acadêmico", base: "Clérigo", dado_vida: 8, ba: clerigo.ba, jp: clerigo.jp, magias: clerigoMagias,
    herda: [{ nome: "Magias Divinas" }],
    poderes: [
      { nivel: 1, nome: "Conhecimento Acadêmico", desc: "identifica monstros e animais — ataques, defesas, habilidades, fraquezas e hábitos — com 1-2 em 1d6" },
      { nivel: 3, nome: "Decifrar Linguagens", desc: "decifra idiomas, alfabetos e pictogramas e decodifica documentos, captando ao menos a ideia geral; a chance de Conhecimento Acadêmico sobe para 1-3 em 1d6" },
      { nivel: 6, nome: "Lendas e Tradições", desc: "identifica lendas, eventos e figuras históricas e perigos de lugares e regiões (um rumor extra por ponto de modificador de Sabedoria); a chance de Conhecimento Acadêmico sobe para 1-4 em 1d6" },
      { nivel: 10, nome: "Identificar Itens", desc: "observando um item mágico por 1d4 turnos, com 1-2 em 1d6 identifica seu propósito geral (não as funções exatas); itens caóticos se camuflam e sempre induzem leitura errada" },
    ],
  },
  {
    nome: "Xamã", base: "Clérigo", dado_vida: 8, ba: clerigo.ba, jp: clerigo.jp, magias: clerigoMagias,
    herda: [{ nome: "Magias Divinas" }],
    poderes: [
      { nivel: 1, nome: "Animal Sagrado", desc: "escolhe um animal para simbolizar sua divindade; com o símbolo presente e enquanto entoa cânticos sagrados, faz seus seguidores realizarem ataques Fáceis em combate" },
      { nivel: 3, nome: "Cura Totêmica", desc: "como o Clérigo, troca uma magia preparada por Curar Ferimentos de 1º círculo (cura 1d8)" },
      { nivel: 6, nome: "Fúria", desc: "com um cântico ritmado, leva um aliado à fúria: enquanto mantém o canto, o aliado sobe o dado de dano da arma um grau (d6→d8 etc.) e ataca como Muito Fácil, mas vira alvo Fácil para todos os ataques que receber" },
      { nivel: 10, nome: "Fúria da Natureza", desc: "troca uma magia preparada de 5º círculo pela magia de 7º círculo Controlar o Clima, mesmo sem ter acesso ao 7º círculo ainda" },
    ],
  },
  {
    nome: "Proscrito", base: "Clérigo", dado_vida: 8, ba: clerigo.ba, jp: clerigo.jp,
    poderes: [
      { nivel: 1, nome: "Cura Natural", desc: "sem conjurar magias de cura, atua como curandeiro: aumenta a cura natural de um alvo para 2 PV (ou 1d4+1 em repouso) e pode estabilizar quem agoniza" },
      { nivel: 3, nome: "Treinamento em Combate", desc: "passa a usar qualquer arma e armadura e ganha +1 de BA em relação à do Clérigo padrão" },
      { nivel: 6, nome: "Afetar Mortos-Vivos", desc: "1×/dia força um teste de moral nos mortos-vivos próximos — não para afastá-los, mas para tornar Difíceis todos os ataques deles; os que passam não são afetados" },
      { nivel: 10, nome: "Misticismo", desc: "sua antiga divindade lhe concede conjurar magias divinas de 1º círculo, segundo a tabela de Clérigo do seu nível, sob as regras normais" },
    ],
  },
  // Ladrão
  {
    nome: "Ranger", base: "Ladrão", dado_vida: 6, ba: ladrao.ba, jp: ladrao.jp,
    talentos: ["Armadilha", "Escalar", "Furtividade", "Percepção", "Rastrear"], talentos_atributo: "destreza",
    poderes: [
      { nivel: 1, nome: "Inimigo Mortal", desc: "escolhe um inimigo da sua região dentre Orcs, Goblins, Homens-Lagarto, Trolls ou Gigantes: contra ele todo ataque é Fácil e todo teste de reação tem -2" },
      { nivel: 3, nome: "Combativo", desc: "passa a usar armas grandes e escudos sem penalidade, mas segue limitado a armaduras leves" },
      { nivel: 6, nome: "Previdência", desc: "nos ermos só é surpreendido com 1 em 1d6 e seus acampamentos são sempre do tipo seguro" },
      { nivel: 10, nome: "Companheiro Animal", desc: "uma criatura dos ermos o adota como aliada e lhe presta favores (atacar, vigiar, levar mensagens); se ela morre, há 1-4 em 1d6 de surgir outra a cada novo nível" },
    ],
  },
  {
    nome: "Bardo", base: "Ladrão", dado_vida: 6, ba: ladrao.ba, jp: ladrao.jp,
    talentos: ["Escalar", "Furtividade", "Punga", "Cultura", "Decifrar"], talentos_atributo: "destreza",
    herda: [{ nome: "Ouvir Ruídos" }],
    poderes: [
      { nivel: 1, nome: "Influenciar", desc: "com música e oratória influencia a reação de PdMs (1-2 em 1d6), aplicando +1 para melhorá-la ou -1 para torná-los mais hostis no teste de reação" },
      { nivel: 3, nome: "Inspirar", desc: "atuando ao menos uma rodada e enquanto mantém a atuação, faz seus aliados tratarem testes e ataques como um grau mais fácil" },
      { nivel: 6, nome: "Fascinar", desc: "fascina uma audiência não-hostil que entenda seu idioma, até 2 DV a cada 3 níveis do Bardo, mantendo-a concentrada na apresentação" },
      { nivel: 10, nome: "Usar Pergaminhos", desc: "usa pergaminhos arcanos como um Mago de metade dos seus níveis" },
    ],
  },
  {
    nome: "Assassino", base: "Ladrão", dado_vida: 6, ba: ladrao.ba, jp: ladrao.jp,
    talentos: ["Arrombar", "Escalar", "Furtividade", "Veneno", "Disfarce"], talentos_atributo: "destreza",
    poderes: [
      { nivel: 1, nome: "Ataque Assassino", desc: "ao atacar após uma aproximação furtiva, faz um ataque Muito Fácil com dano multiplicado por 2" },
      { nivel: 3, nome: "Espreitar", desc: "1 rodada observando o alvo torna o primeiro ataque contra ele Fácil; 4 rodadas, Muito Fácil" },
      { nivel: 6, nome: "Assassinato", desc: "ao desferir um Ataque Assassino, pode abrir mão do dano para tentar um golpe fatal (1-2 em 1d6, evoluindo para 1-3 no 10º nível; cada DV do alvo igual ou acima do seu reduz a chance em 1). Se falhar, o alvo não sofre dano e fica imune a um novo Assassinato até o Assassino subir de nível" },
      { nivel: 10, nome: "Ataque Mortal", desc: "o dano do Ataque Assassino passa a ser multiplicado por 3" },
    ],
  },
  {
    nome: "Halfling Aventureiro", base: "Ladrão", dado_vida: 6, ba: ladrao.ba, jp: ladrao.jp,
    talentos: ["Arrombar", "Escalar", "Furtividade", "Punga", "Senso de Perigo"], talentos_atributo: "destreza",
    poderes: [
      { nivel: 1, nome: "Arma Racial", desc: "mantém as habilidades raciais de halfling e se especializa numa arma de arremesso à escolha, com +2 de dano, tratada como arma racial" },
      { nivel: 3, nome: "Valente", desc: "imune a medo, terror e horror; qualquer tentativa de amedrontá-lo torna Fáceis seus testes de atributo, JP ou ataque" },
      { nivel: 6, nome: "No Alvo", desc: "ataques à distância com a arma racial passam a ser Muito Fáceis" },
      { nivel: 10, nome: "Arremesso Extra", desc: "ganha um segundo arremesso com a arma racial, logo após o primeiro e antes da ação do próximo na iniciativa, com a mesma BA" },
    ],
  },
  // Mago
  {
    nome: "Ilusionista", base: "Mago", dado_vida: 4, ba: mago.ba, jp: mago.jp, magias: magoMagias,
    herda: [{ nome: "Magias Arcanas" }, { nome: "Ler Magias" }, { nome: "Detectar Magias" }],
    poderes: [
      { nivel: 1, nome: "Magias Exclusivas", desc: "escreve no grimório as magias exclusivas de Ilusionista Ilusão e Som Ilusório (1º círculo). Magias exclusivas dispensam memorização e podem ser usadas 1×/dia cada, além das magias diárias; a JP contra elas é sempre um teste Difícil. Como especialista, abre mão do 7º ao 9º círculo, conjurando até o 6º" },
      { nivel: 3, nome: "Ilusão Melhorada", desc: "aprende a magia exclusiva Ilusão Melhorada (2º círculo de Ilusionista): ilusão com movimento e som — sem fala inteligível — que persiste 1d3 rodadas após a concentração" },
      { nivel: 6, nome: "Miragem", desc: "aprende a magia exclusiva Miragem (3º círculo de Ilusionista): disfarça o terreno real afetando todos os sentidos, embora os perigos reais permaneçam" },
      { nivel: 10, nome: "Ilusão Permanente", desc: "aprende a magia exclusiva Ilusão Permanente (5º círculo de Ilusionista): ilusão completa e permanente — movimento, fala, odor, temperatura e tato — até ser dissipada" },
    ],
  },
  {
    nome: "Necromante", base: "Mago", dado_vida: 4, ba: mago.ba, jp: mago.jp, magias: magoMagias,
    herda: [{ nome: "Magias Arcanas" }, { nome: "Ler Magias" }, { nome: "Detectar Magias" }],
    poderes: [
      { nivel: 1, nome: "Magias Exclusivas", desc: "escreve no grimório as magias exclusivas de Necromante Toque Sombrio e Aterrorizar (1º círculo). Magias exclusivas dispensam memorização e podem ser usadas 1×/dia cada, além das magias diárias; a JP contra elas é sempre um teste Difícil. Como especialista, abre mão do 7º ao 9º círculo, conjurando até o 6º" },
      { nivel: 3, nome: "Criar Mortos-Vivos", desc: "aprende a magia exclusiva Criar Mortos-Vivos (2º círculo de Necromante): anima um cadáver (zumbi) ou ossada (esqueleto) sob seu comando permanente, controlando até 2 DV de mortos-vivos por nível; o excedente age por conta própria" },
      { nivel: 6, nome: "Drenar Vida", desc: "aprende a magia exclusiva Drenar Vida (3º círculo de Necromante): com o toque, drena 1d4+1 PV a cada 3 níveis e os soma aos próprios PV (até o máximo); uma JPC evita" },
      { nivel: 10, nome: "Magia da Morte", desc: "aprende a magia exclusiva Magia da Morte (5º círculo de Necromante): um raio de energia negativa mata 2d6 criaturas de até 4 DV no alcance; uma JPC evita" },
    ],
  },
  {
    nome: "Bruxo", base: "Mago", dado_vida: 4, ba: mago.ba, jp: mago.jp, magias: magoMagias, magias_sem_extra_atributo: true,
    herda: [{ nome: "Ler Magias" }, { nome: "Detectar Magias" }],
    poderes: [
      { nivel: 1, nome: "Rituais", desc: "conjura as magias diárias na forma de rituais, dispensando estudo prévio e fontes escritas: concentra-se no efeito com palavras e gestos que canalizam o poder extraplanar pelo corpo. A execução leva 1 rodada e o efeito só se inicia no começo da rodada seguinte, antes das outras ações. Escolhe livremente as magias dentre todos os círculos disponíveis ao seu nível, como se estivessem em um grimório, mas não recebe magias adicionais por Inteligência alta. Conjura até o 6º círculo — abre mão das listas de 7º a 9º que o Mago teria" },
      { nivel: 1, nome: "Interferência de Metal", desc: "objetos de metal (armas, armaduras, escudos) atrapalham a canalização: em contato com metal, há 1-2 em 1d6 de perder o ritual sem qualquer efeito. Cada avanço de poder libera o uso de mais equipamento de metal sem prejudicar os rituais" },
      { nivel: 1, nome: "Iniciado", desc: "conjura magias de 1º círculo; usa armas médias e armaduras leves, mesmo as de metal, sem prejudicar os rituais" },
      { nivel: 3, nome: "Médium", desc: "conjura magias de 2º círculo; usa armas grandes, mesmo as de metal, sem prejudicar os rituais" },
      { nivel: 6, nome: "Conjurador", desc: "conjura magias de 3º círculo; usa armaduras médias, mesmo as de metal, sem prejudicar os rituais" },
      { nivel: 10, nome: "Entidade", desc: "conjura magias de 4º, 5º e 6º círculos (desde que o nível permita o acesso); usa todas as armas e armaduras, mesmo as de metal, sem prejudicar os rituais" },
    ],
  },
  {
    nome: "Elfo Aventureiro", base: "Mago", dado_vida: 4, ba: mago.ba, jp: mago.jp, magias: magoMagias,
    poderes: [
      { nivel: 1, nome: "Treinamento Racial", desc: "mantém as habilidades raciais de elfo, ganha +1 PV por nível além da tabela de Mago e perde as restrições de arma e armadura do Mago; especializa-se na arma racial (cimitarra ou arco) com +2 de dano. No início não conjura magias nem tem Ler/Detectar Magias, mas usa todos os itens mágicos como um Mago" },
      { nivel: 3, nome: "Brilho Mágico", desc: "conjura 1 magia de 1º círculo por dia, como um Mago de 1º nível (sob as regras de Mago); com escudo ou armadura, há 1-3 em 1d6 de perder a magia" },
      { nivel: 6, nome: "Esplendor Arcano", desc: "conjura magias arcanas como um Mago 5 níveis abaixo (um Elfo Aventureiro de 6º conjura como Mago de 1º); com escudo ou armadura, há 1-2 em 1d6 de perder a magia" },
      { nivel: 10, nome: "Ataque Extra", desc: "ganha um segundo ataque com a arma racial (cimitarra ou arco), logo após o primeiro e antes da ação do próximo na iniciativa, com a mesma BA" },
    ],
  },
];

// Preenche a tabela de XP de cada classe a partir da base: classe-base (nome === base)
// usa a coluna "XP" normal; especializações (nome !== base) usam a coluna "XP Especial".
// Notas do vault que já tragam `xp` próprio são preservadas.
for (const c of BASE_CLASSES) {
  if (c.xp || !c.base) continue;
  c.xp = c.nome === c.base ? XP_BASE[c.base] : XP_ESPECIAL[c.base];
}

// Raças-base do Old Dragon 2 (embutidas).
export const BASE_POVOS: PovoDef[] = [
  {
    nome: "Humano", deslocamento: 9, infravisao: "não possui", alinhamento: "qualquer", bonus_xp: 10,
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
    nome: "Meio-Elfo", deslocamento: 9, infravisao: "9m", alinhamento: "tende a Caótico", bonus_xp: 5,
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
