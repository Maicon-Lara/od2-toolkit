// Listas de magias do SRD do Old Dragon 2 (Cap. 8). Conteúdo CC BY-SA 4.0.
// Old Dragon 2ª edição © 2023 da Old Dragon Editora.
// Descrições adaptadas do SRD (paráfrase do efeito; alcance/duração quando citados).

export interface MagiaDef {
  nome: string;
  desc: string;
}

// Índice = círculo - 1. Cada item = lista de magias daquele círculo.
export const MAGIAS_ARCANAS: MagiaDef[][] = [
  // 1º círculo
  [
    { nome: "Abrir/Trancar", desc: "abre o que está fechado/trancado ou tranca um acesso aberto (alcance 18m)." },
    { nome: "Cerrar Portas", desc: "trava portas e janelas num raio de 3m por 2d6 turnos." },
    { nome: "Disco Flutuante", desc: "cria um disco que carrega 50kg/nível e segue o conjurador por 6 turnos." },
    { nome: "Enfeitiçar Pessoas", desc: "faz um humanoide considerar o conjurador um amigo e obedecê-lo (alcance 36m)." },
    { nome: "Escudo Arcano", desc: "escudo invisível equivalente a armadura +4 por 2 turnos." },
    { nome: "Ler Idiomas", desc: "decifra idiomas desconhecidos por 2 turnos." },
    { nome: "Luz/Escuridão", desc: "objeto emite luz como tocha (raio 4,5m) por 12 turnos, ou cria escuridão." },
    { nome: "Mãos Flamejantes", desc: "leque de fogo que causa 1d3+2/nível a todos na área (alcance 3m +1/nível)." },
    { nome: "Mísseis Mágicos", desc: "1 míssil a cada 3 níveis, acerto automático, 1d4+1 cada (alcance 45m)." },
    { nome: "Patas de Aranha", desc: "permite andar por paredes e tetos por 1 turno (toque)." },
    { nome: "Sono", desc: "adormece até 4d4 DV de criaturas com até 2 DV cada." },
    { nome: "Ventriloquismo", desc: "projeta a voz do conjurador a até 18m." },
  ],
  // 2º círculo
  [
    { nome: "Detectar Invisibilidade", desc: "revela invisíveis num raio de 18m por 2 turnos." },
    { nome: "Flecha Ácida", desc: "projétil ácido que causa 1d4 por algumas rodadas (alcance 45m)." },
    { nome: "Força Arcana", desc: "aumenta a Força do alvo por 3 turnos (toque)." },
    { nome: "Invisibilidade", desc: "torna o alvo invisível até atacar ou conjurar (toque)." },
    { nome: "Levitação", desc: "permite mover-se verticalmente por 6 turnos +1/nível." },
    { nome: "Localizar Objetos", desc: "aponta a direção de um objeto conhecido (alcance 18m +2/nível)." },
    { nome: "Luz/Escuridão Contínua", desc: "versão permanente de Luz, ou escuridão mágica permanente." },
    { nome: "Percepção Extrassensorial", desc: "detecta pensamentos num raio de 18m por 12 turnos." },
    { nome: "Queda Suave", desc: "transforma uma queda letal em queda segura." },
    { nome: "Reflexos", desc: "melhora os reflexos do alvo, ajudando a evitar ataques." },
    { nome: "Respirar na Água", desc: "permite ao alvo respirar debaixo d'água." },
    { nome: "Teia", desc: "preenche a área com teias que prendem as criaturas." },
  ],
  // 3º círculo
  [
    { nome: "Bola de Fogo", desc: "explosão em raio de 6m causando 1d6/nível (até 10d6) (alcance 72m)." },
    { nome: "Clarividência", desc: "vê através dos olhos de uma criatura no local por 12 turnos." },
    { nome: "Dissipar Magia", desc: "cancela os efeitos de outra magia (alcance 36m)." },
    { nome: "Flecha de Chamas", desc: "1 flecha a cada 5 níveis, 1d6 + 2d6 de fogo (alcance 45m)." },
    { nome: "Imobilizar Pessoas", desc: "paralisa até 1d4 pessoas por 1 turno/nível (alcance 36m)." },
    { nome: "Infravisão", desc: "concede infravisão de 18m por 24 horas (toque)." },
    { nome: "Invisibilidade 3 metros", desc: "torna invisível tudo num raio de 3m (alcance 36m)." },
    { nome: "Invocar Criaturas", desc: "convoca 2d4 criaturas com até metade dos seus DV por 6 turnos." },
    { nome: "Lentidão/Velocidade", desc: "reduz pela metade ou dobra movimento e dá ataque extra por 3 turnos." },
    { nome: "Proteção contra Projéteis", desc: "protege o alvo contra ataques à distância." },
    { nome: "Relâmpago", desc: "raio que causa 2d8 +1d8/nível (até 8d8) (alcance 150m)." },
    { nome: "Voo", desc: "concede ao alvo a capacidade de voar." },
  ],
  // 4º círculo
  [
    { nome: "Ampliar Plantas", desc: "acelera o crescimento da vegetação, dificultando o movimento (alcance 36m)." },
    { nome: "Arma Encantada", desc: "torna uma arma mundana mágica (+1) por 1 turno/nível (toque)." },
    { nome: "Armadilha de Fogo", desc: "objeto explode em chamas (raio 2m) ao ser aberto." },
    { nome: "Confusão", desc: "faz os alvos agirem aleatoriamente por 12 rodadas (alcance 36m)." },
    { nome: "Enfeitiçar Monstros", desc: "afeta 3d6 monstros não-humanoides, que passam a obedecer (alcance 36m)." },
    { nome: "Medo", desc: "aterroriza criaturas, forçando-as a fugir por 1 rodada/nível (alcance 18m)." },
    { nome: "Metamorfosear-se", desc: "o conjurador assume a forma de outra criatura por 6 turnos +1/nível." },
    { nome: "Meteoros Instantâneos", desc: "1 esfera flamejante por nível, 2d4 cada (alcance 36m)." },
    { nome: "Muralha de Energia", desc: "barreira invisível que bloqueia magias de conjuradores inferiores." },
    { nome: "Olho Arcano", desc: "olho invisível flutuante que envia imagens ao conjurador (alcance 72m)." },
    { nome: "Porta Dimensional", desc: "teleporta o conjurador a um local visível até 100m." },
    { nome: "Tempestade Glacial", desc: "tempestade de gelo que causa dano numa área." },
  ],
  // 5º círculo
  [
    { nome: "Animar Cadáveres", desc: "ergue um zumbi ou esqueleto de um cadáver por 1 turno/nível (toque)." },
    { nome: "Criar Passagens", desc: "abre um buraco em rocha (até 2m de espessura/5 níveis) por 3 turnos." },
    { nome: "Imobilizar Monstros", desc: "paralisa até 1d4 monstros não-humanoides por 6 turnos +1/nível." },
    { nome: "Metamorfose", desc: "transforma uma criatura em outro tipo, com suas habilidades (permanente)." },
    { nome: "Muralha de Ferro", desc: "cria uma muralha de ferro que bloqueia passagens." },
    { nome: "Névoa Mortal", desc: "nuvem venenosa móvel que causa dano por rodada (alcance 12m)." },
    { nome: "Pedra em Lama/Lama em Pedra", desc: "transforma até 30m² de pedra em lama, ou o inverso." },
    { nome: "Recipiente Arcano", desc: "armazena magias num objeto para uso posterior." },
    { nome: "Telecinesia", desc: "move objetos à distância por concentração." },
    { nome: "Teleporte", desc: "transporta o conjurador e aliados para um local desejado." },
  ],
  // 6º círculo
  [
    { nome: "Concha Antimagia", desc: "envolve o conjurador num escudo que bloqueia toda magia por 12 turnos." },
    { nome: "Controlar o Clima", desc: "modifica o clima num raio de 100m/nível (alcance 240m)." },
    { nome: "Desintegrar", desc: "reduz matéria mundana ou mágica a pó (alcance 18m)." },
    { nome: "Encantar Item", desc: "imbui um objeto com efeitos mágicos durante o encantamento." },
    { nome: "Esfera Gélida", desc: "congela água, dispara raio gélido ou cria um globo de frio." },
    { nome: "Pedra em Carne/Carne em Pedra", desc: "restaura petrificados, ou petrifica uma criatura (toque)." },
    { nome: "Proteger Fortalezas", desc: "protege uma estrutura contra ataques e invasões mágicas." },
    { nome: "Visão da Verdade", desc: "revela a verdadeira natureza de criaturas e objetos, vendo através de ilusões." },
  ],
  // 7º círculo
  [
    { nome: "Barreira Mental", desc: "protege contra invasões mentais e espionagem mágica por 12 turnos." },
    { nome: "Palavra do Poder: Atordoar", desc: "atordoa um alvo por 1-3 rodadas conforme seus DV (alcance 5m/nível)." },
    { nome: "Passagem Secreta", desc: "cria uma passagem invisível em superfície sólida." },
    { nome: "Reverter Gravidade", desc: "inverte a gravidade numa área." },
    { nome: "Simulacro", desc: "cria uma cópia não-viva de uma criatura conhecida, que obedece o conjurador." },
    { nome: "Visão", desc: "concede clarividência e conhecimento sobre uma questão específica." },
  ],
  // 8º círculo
  [
    { nome: "Aprisionar Alma", desc: "uma gema captura a alma de quem a segura (1.000 PO por DV)." },
    { nome: "Clone", desc: "cria um clone perfeito do alvo; um tentará eliminar o outro." },
    { nome: "Imunidade à Magia", desc: "protege contra efeitos mágicos, facilitando salvações." },
    { nome: "Permanência", desc: "torna permanentes magias de 1º a 3º círculo sem dano instantâneo." },
    { nome: "Portal", desc: "abre passagem entre dois locais a até 100m, transportando criaturas." },
    { nome: "Símbolo", desc: "inscreve um símbolo mágico que dispara um efeito ao ser ativado." },
  ],
  // 9º círculo
  [
    { nome: "Aprisionamento", desc: "convoca e aprisiona uma criatura extraplanar (exige seu nome verdadeiro)." },
    { nome: "Chuva de Meteoros", desc: "múltiplas bolas de fogo (10d6 ou 5d6) (alcance 72m)." },
    { nome: "Desejo", desc: "realiza desejos, emulando magias de até 8º círculo; distorce intenções ambíguas." },
    { nome: "Esfera Prismática", desc: "esfera de 3m com 7 camadas coloridas, cada uma com efeito destrutivo." },
    { nome: "Magia Astral", desc: "projeta a forma astral para outros planos a 150 km/h." },
    { nome: "Palavra do Poder: Matar", desc: "mata um alvo com 50 PV ou menos, sem salvação." },
  ],
];

export const MAGIAS_DIVINAS: MagiaDef[][] = [
  // 1º círculo
  [
    { nome: "Arma Abençoada", desc: "torna os ataques de uma arma Fáceis; +1d4 de dano se for natural/madeira/pedra." },
    { nome: "Constrição", desc: "anima plantas que agarram, reduzindo o movimento em 1 por rodada." },
    { nome: "Curar Ferimentos/Causar Ferimentos", desc: "restaura (ou causa) 1d8 PV ao toque." },
    { nome: "Detectar Alinhamento", desc: "identifica a aura de alinhamento de alguém ou algo (alcance 36m)." },
    { nome: "Luz/Escuridão", desc: "objeto emite luz como tocha (6m), ou cria escuridão mágica." },
    { nome: "Proteção contra Alinhamento", desc: "protege contra criaturas de alinhamento oposto." },
    { nome: "Proteção contra Temperatura", desc: "protege contra dano de temperatura extrema." },
    { nome: "Purificar Alimentos", desc: "torna alimentos e água seguros para consumo." },
    { nome: "Remover Medo", desc: "remove o medo imposto ao alvo tocado." },
    { nome: "Santuário", desc: "cria um local protegido contra criaturas de alinhamento oposto." },
  ],
  // 2º círculo
  [
    { nome: "Abençoar/Profanar", desc: "+1 em ataque e JP a cada 3 níveis (ou penalidade, na versão reversa)." },
    { nome: "Ajuda", desc: "anula 1d4+1 (por 2 níveis) de dano do próximo ataque sofrido." },
    { nome: "Bom Fruto", desc: "abençoa 2d4 frutos que curam 1 PV/nível ao serem comidos." },
    { nome: "Detectar Armadilhas", desc: "faz armadilhas (mágicas e comuns) parecerem brilhar." },
    { nome: "Falar com Animais", desc: "permite conversar com um tipo de animal (alcance 18m)." },
    { nome: "Imobilizar Pessoas", desc: "paralisa até 1d4 humanoides por 1 turno/nível." },
    { nome: "Martelo Espiritual", desc: "martelo de energia (+1 a cada 5 níveis) que causa 1d4+1/nível." },
    { nome: "Mensagem", desc: "sussurra mensagens a 1 alvo por 3 níveis (alcance 18m)." },
    { nome: "Resistir à Energia", desc: "protege contra um tipo específico de dano energético." },
    { nome: "Silêncio", desc: "cria uma zona de silêncio que impede sons e conjurações." },
  ],
  // 3º círculo
  [
    { nome: "Ampliar Plantas", desc: "adensa a vegetação, reduzindo o movimento de criaturas." },
    { nome: "Convocar Insetos", desc: "nuvem de insetos que ataca um alvo (1d3-1d4 por rodada)." },
    { nome: "Convocar Relâmpagos", desc: "relâmpagos em céu carregado, 2d8 +1d8/nível (raio 3m)." },
    { nome: "Criar Água", desc: "gera 200 litros de água fresca." },
    { nome: "Curar Doenças/Causar Doenças", desc: "remove (ou inflige) doenças e paralisia." },
    { nome: "Falar com Mortos", desc: "faz perguntas a um cadáver, que responde conforme o que sabia." },
    { nome: "Imobilizar Monstros", desc: "paralisa até 1d4 monstros não-humanoides." },
    { nome: "Oração", desc: "aliados ganham JPS Fáceis e inimigos Difíceis por 1 turno/5 níveis." },
    { nome: "Roupa Encantada", desc: "transforma roupas em itens mágicos com propriedades especiais." },
    { nome: "Símbolo de Proteção", desc: "símbolo que protege uma área contra alinhamento oposto." },
  ],
  // 4º círculo
  [
    { nome: "Adivinhação", desc: "recebe sinais divinos respondendo a perguntas sobre caminhos e eventos." },
    { nome: "Andar sobre as Águas", desc: "anda sobre líquidos e solos instáveis por 2 turnos +1/nível." },
    { nome: "Bastão em Serpente", desc: "transforma 1d4+1/nível bastões em serpentes por 6 turnos." },
    { nome: "Dissipar Magia", desc: "anula magias via teste (1d20+nível contra a dificuldade)." },
    { nome: "Falar com Plantas", desc: "comunica-se com plantas não-mágicas para informações ou favores." },
    { nome: "Neutralizar Veneno", desc: "anula venenos em ação (não recupera dano já sofrido)." },
    { nome: "Porta Dimensional", desc: "teleporta a um local visível até 100m." },
    { nome: "Remover Maldição/Amaldiçoar", desc: "remove (ou impõe) uma maldição debilitante." },
  ],
  // 5º círculo
  [
    { nome: "Comunhão", desc: "recebe respostas divinas (sim/não/talvez) a até 3 perguntas." },
    { nome: "Consagrar", desc: "consagra uma área de 12m contra alinhamento oposto e mortos-vivos." },
    { nome: "Criar Alimentos", desc: "cria comida para 2 pessoas por nível do conjurador." },
    { nome: "Missão/Remover Missão", desc: "obriga um alvo a cumprir uma tarefa, sob pena de perder Força." },
    { nome: "Penitência", desc: "remove o fardo de pecados; pode restaurar Paladinos/Clérigos caídos." },
    { nome: "Praga de Insetos", desc: "convoca insetos que atacam um alvo indicado." },
    { nome: "Reviver Mortos", desc: "traz de volta à vida uma pessoa morta há pouco tempo." },
    { nome: "Visão da Verdade", desc: "vê a verdade além de ilusões e disfarces." },
  ],
  // 6º círculo
  [
    { nome: "Conjurar Animais", desc: "convoca 1d6 animais que obedecem até serem feridos ou dispensados." },
    { nome: "Dissipar o Caos", desc: "área que afugenta/destrói criaturas caóticas; o conjurador deve ficar imóvel." },
    { nome: "Falar com Monstros", desc: "permite comunicar-se com um tipo específico de monstro." },
    { nome: "Partir Água", desc: "separa a água criando passagem seca por 1 turno +1/nível." },
  ],
  // 7º círculo
  [
    { nome: "Controlar o Clima", desc: "modifica o clima num raio de 100m por nível (chuva, neve, etc.)." },
    { nome: "Palavra Sagrada", desc: "mata alvos com 4 DV ou menos e atordoa os de 5-12 DV." },
    { nome: "Restauração", desc: "restaura níveis ou pontos de atributo drenados." },
    { nome: "Terremoto", desc: "provoca um tremor que abala o solo e estruturas numa área." },
  ],
];

// Magias exclusivas de especializações de Mago.
export const MAGIAS_EXCLUSIVAS: Array<{ classe: string; magias: string[] }> = [
  { classe: "Ilusionista", magias: ["Ilusão", "Ilusão Melhorada", "Miragem", "Ilusão Permanente"] },
  {
    classe: "Necromante",
    magias: ["Aterrorizar", "Toque Sombrio", "Criar Mortos-Vivos", "Drenar Vida", "Magia da Morte"],
  },
];
