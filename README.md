# Old Dragon 2 Toolkit (Obsidian)

Fichas de personagem interativas e rolagens para o sistema **Old Dragon 2**, dentro do Obsidian.

> Implementa **mecânicas/números** do sistema (tabela de modificadores, CA ascendente, testes *roll-under*, Jogadas de Proteção). Não distribui texto do livro. Old Dragon™ é marca de seus respectivos detentores; este é um projeto de fã, não oficial.

## Recurso principal: bloco `od2-ficha`

Escreva um bloco de código com os dados do personagem em YAML:

````markdown
```od2-ficha
nome: Kael
retrato: "[[kael.png]]"
povo: Varko
classe: Guerreiro
nivel: 3
forca: 15
destreza: 13
constituicao: 14
inteligencia: 9
sabedoria: 11
carisma: 10
pv_max: 22
pv_atual: 22
ca_base: 10
bonus_armadura: 4
bonus_escudo: 1
ba: 3
deslocamento: 9
jpd: 13
jpc: 13
jps: 15
ataques:
  - nome: Machado de batalha
    bonus: 6
    dano: 1d10+2
```
````

A ficha renderizada calcula automaticamente:
- **Modificadores** dos 6 atributos (Tabela 1.1 do OD2);
- **CA** = 10 + mod DES + armadura + escudo + outros;
- **Bônus de ataque** corpo a corpo (BA + FOR) e à distância (BA + DES);
- **JP final** (base da classe + modificador do atributo).

E oferece **botões de rolagem**:
- Teste de atributo e JP — *roll-under* (1d20 ≤ alvo; 1 sempre sucesso, 20 sempre falha);
- Ataque (1d20 + bônus) e dano;
- Contador de **PV** com − / + que grava de volta no arquivo.

### Edição sem mexer no YAML
- **Retrato:** campo `retrato: "[[arquivo.png]]"` (wikilink, caminho do vault ou URL) exibe a imagem no topo da ficha.
- **+ ataque / + item:** botões abrem um formulário e gravam o novo ataque/equipamento no bloco.
- **✎ editar / ✕ remover:** em cada linha de ataque e de equipamento.

Todas as edições reescrevem o YAML do bloco automaticamente — não é preciso editá-lo à mão.

Comando: **"Inserir ficha de personagem (OD2)"** insere um esqueleto pronto.

## Statblock de monstro: bloco `od2-monstro`

Bloco para criaturas, com botões de ataque/dano e de rolar PV pelos Dados de Vida.
Comando: **"Inserir statblock de monstro (OD2)"**.

## Instalação

### Via BRAT (recomendado enquanto não está na loja)
1. Instale o plugin **Obsidian42 - BRAT**.
2. Em *BRAT → Add Beta Plugin*, informe `Maicon-Lara/od2-toolkit`.
3. Ative o **Old Dragon 2 Toolkit** em *Plugins da comunidade*.

### Manual
1. Baixe `main.js`, `manifest.json` e `styles.css` da
   [última release](https://github.com/Maicon-Lara/od2-toolkit/releases/latest).
2. Copie para `<vault>/.obsidian/plugins/od2-toolkit/`.
3. Ative o plugin em *Plugins da comunidade*.

## Desenvolvimento

```bash
npm install
npm run dev     # build em watch
npm run build   # build de produção (gera main.js)
```

Para testar localmente, copie `main.js`, `manifest.json` e `styles.css` para
`<vault>/.obsidian/plugins/od2-toolkit/`.

### Publicar uma nova versão
1. Atualize `version` em `manifest.json` e `package.json`, e adicione a entrada em `versions.json`.
2. Faça commit e crie a tag igual à versão (sem `v`): `git tag 0.6.0 && git push --tags`.
3. O workflow `.github/workflows/release.yml` builda e anexa os três arquivos à release.

### Enviar para a loja de plugins da comunidade
Após a primeira release, abra um PR em
[`obsidianmd/obsidian-releases`](https://github.com/obsidianmd/obsidian-releases)
adicionando a entrada do plugin em `community-plugins.json`.

## Licença

Código sob licença MIT (ver `LICENSE`).
