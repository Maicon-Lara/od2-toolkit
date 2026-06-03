// Listas de magias do SRD do Old Dragon 2 (Cap. 8). Conteúdo CC BY-SA 4.0.
// Old Dragon 2ª edição © 2023 da Old Dragon Editora.
// Apenas os nomes por círculo (descrições completas são expansão futura).

// Índice = círculo - 1. Cada item = lista de nomes daquele círculo.
export const MAGIAS_ARCANAS: string[][] = [
  // 1º círculo
  [
    "Abrir/Trancar", "Cerrar Portas", "Disco Flutuante", "Enfeitiçar Pessoas", "Escudo Arcano",
    "Ler Idiomas", "Luz/Escuridão", "Mãos Flamejantes", "Mísseis Mágicos", "Patas de Aranha",
    "Sono", "Ventriloquismo",
  ],
  // 2º círculo
  [
    "Detectar Invisibilidade", "Flecha Ácida", "Força Arcana", "Invisibilidade", "Levitação",
    "Localizar Objetos", "Luz/Escuridão Contínua", "Percepção Extrassensorial", "Queda Suave",
    "Reflexos", "Respirar na Água", "Teia",
  ],
  // 3º círculo
  [
    "Bola de Fogo", "Clarividência", "Dissipar Magia", "Flecha de Chamas", "Imobilizar Pessoas",
    "Infravisão", "Invisibilidade 3 metros", "Invocar Criaturas", "Lentidão/Velocidade",
    "Proteção contra Projéteis", "Relâmpago", "Voo",
  ],
  // 4º círculo
  [
    "Ampliar Plantas", "Arma Encantada", "Armadilha de Fogo", "Confusão", "Enfeitiçar Monstros",
    "Medo", "Metamorfosear-se", "Meteoros Instantâneos", "Muralha de Energia", "Olho Arcano",
    "Porta Dimensional", "Tempestade Glacial",
  ],
  // 5º círculo
  [
    "Animar Cadáveres", "Criar Passagens", "Imobilizar Monstros", "Metamorfose", "Muralha de Ferro",
    "Névoa Mortal", "Pedra em Lama/Lama em Pedra", "Recipiente Arcano", "Telecinesia", "Teleporte",
  ],
  // 6º círculo
  [
    "Concha Antimagia", "Controlar o Clima", "Desintegrar", "Encantar Item", "Esfera Gélida",
    "Pedra em Carne/Carne em Pedra", "Proteger Fortalezas", "Visão da Verdade",
  ],
  // 7º círculo
  [
    "Barreira Mental", "Palavra do Poder: Atordoar", "Passagem Secreta", "Reverter Gravidade",
    "Simulacro", "Visão",
  ],
  // 8º círculo
  ["Aprisionar Alma", "Clone", "Imunidade à Magia", "Permanência", "Portal", "Símbolo"],
  // 9º círculo
  [
    "Aprisionamento", "Chuva de Meteoros", "Desejo", "Esfera Prismática", "Magia Astral",
    "Palavra do Poder: Matar",
  ],
];

export const MAGIAS_DIVINAS: string[][] = [
  // 1º círculo
  [
    "Arma Abençoada", "Constrição", "Curar Ferimentos/Causar Ferimentos", "Detectar Alinhamento",
    "Luz/Escuridão", "Proteção contra Alinhamento", "Proteção contra Temperatura",
    "Purificar Alimentos", "Remover Medo", "Santuário",
  ],
  // 2º círculo
  [
    "Abençoar/Profanar", "Ajuda", "Bom Fruto", "Detectar Armadilhas", "Falar com Animais",
    "Imobilizar Pessoas", "Martelo Espiritual", "Mensagem", "Resistir à Energia", "Silêncio",
  ],
  // 3º círculo
  [
    "Ampliar Plantas", "Convocar Insetos", "Convocar Relâmpagos", "Criar Água",
    "Curar Doenças/Causar Doenças", "Falar com Mortos", "Imobilizar Monstros", "Oração",
    "Roupa Encantada", "Símbolo de Proteção",
  ],
  // 4º círculo
  [
    "Adivinhação", "Andar sobre as Águas", "Bastão em Serpente", "Dissipar Magia",
    "Falar com Plantas", "Neutralizar Veneno", "Porta Dimensional", "Remover Maldição/Amaldiçoar",
  ],
  // 5º círculo
  [
    "Comunhão", "Consagrar", "Criar Alimentos", "Missão/Remover Missão", "Penitência",
    "Praga de Insetos", "Reviver Mortos", "Visão da Verdade",
  ],
  // 6º círculo
  ["Conjurar Animais", "Dissipar o Caos", "Falar com Monstros", "Partir Água"],
  // 7º círculo
  ["Controlar o Clima", "Palavra Sagrada", "Restauração", "Terremoto"],
];

// Magias exclusivas de especializações de Mago.
export const MAGIAS_EXCLUSIVAS: Array<{ classe: string; magias: string[] }> = [
  { classe: "Ilusionista", magias: ["Ilusão", "Ilusão Melhorada", "Miragem", "Ilusão Permanente"] },
  {
    classe: "Necromante",
    magias: ["Aterrorizar", "Toque Sombrio", "Criar Mortos-Vivos", "Drenar Vida", "Magia da Morte"],
  },
];
