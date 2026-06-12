# Old Dragon 2 Toolkit (Obsidian)

Fichas de personagem interativas e rolagens para o sistema **Old Dragon 2**, dentro do Obsidian.

> **Projeto de fã, gratuito e não oficial.** Implementa apenas as **mecânicas e números** do sistema (modificadores, CA ascendente, testes *roll-under*, Jogadas de Proteção), adaptados do **SRD gratuito** do Old Dragon 2 — não reproduz o texto dos livros.
>
> Old Dragon 2ª edição © 2023 da Old Dragon Editora está licenciado sob [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Old Dragon™ é marca de seus respectivos detentores.

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
- Ataque (1d20 + bônus) e dano (aceita dano composto, ex.: `2d6+1d4`);
- **Iniciativa** (LB1 p.81) — *roll-under* 1d20 ≤ maior entre DES e SAB; informa se você age **antes** ou **depois** dos inimigos;
- Contador de **PV** com − / + que grava de volta no arquivo.

O seletor **Ajuste** (Fácil/Difícil) aplica-se também à iniciativa. Os espaços de
**magia preparada** têm autocomplete com os nomes do SRD (arcanas/divinas conforme a classe).

### Edição sem mexer no YAML
- **Retrato:** campo `retrato: "[[arquivo.png]]"` (wikilink, caminho do vault ou URL) exibe a imagem no topo da ficha.
- **+ ataque / + item:** botões abrem um formulário e gravam o novo ataque/equipamento no bloco. O campo **Item** tem autocomplete com armas, armaduras e itens gerais do SRD, e ao escolher uma **arma ou armadura** a **carga é preenchida automaticamente**.
- **✎ editar / ✕ remover:** em cada linha de ataque e de equipamento.

Todas as edições reescrevem o YAML do bloco automaticamente — não é preciso editá-lo à mão.

Comando: **"Inserir ficha de personagem (OD2)"** insere um esqueleto pronto.

### Bônus manuais e edição por seção
Cada seção da ficha (Identificação, Atributos, Combate, Jogadas de Proteção) tem um botão **✎** que abre um formulário e grava direto no bloco. Além dos campos calculados, há campos de **bônus somados por cima** do cálculo automático — `bonus_ba`, `bonus_jpd`, `bonus_jpc`, `bonus_jps` — para bônus que o sistema não preenche sozinho (escolhas de raça "à escolha", poderes específicos, itens mágicos).

### Experiência e subida de nível
O cabeçalho mostra o **XP** e um botão **"+ XP"** que soma a experiência ganha ao total — já aplicando o **bônus de XP do povo** (Humano +10%, Meio-Elfo +5%). Quando o total atinge o limiar do próximo nível (Tabelas 3.1–3.4 do LB1, por classe), a ficha avisa **"✦ XP suficiente para o nível N"** com um botão **"Subir para nível N"**; a subida é **manual**, para você rolar os PV do novo nível na hora certa. Enquanto não dá, mostra quanto falta. As tabelas de XP cobrem os níveis **1–10**.

### Campos da ficha

<details>
<summary>Referência de todos os campos do bloco <code>od2-ficha</code></summary>

| Campo | Tipo | Descrição |
|---|---|---|
| `nome`, `jogador` | texto | Nome do personagem e do jogador. |
| `retrato` | texto | `[[arquivo.png]]` (wikilink), caminho do vault ou URL. |
| `povo`, `classe` | texto | Devem bater com um povo/classe do SRD ou homebrew para puxar bônus e poderes. |
| `nivel`, `xp` | número | Nível e experiência acumulada. |
| `alinhamento` | texto | Ex.: Ordeiro, Neutro, Caótico. |
| `forca`, `destreza`, `constituicao`, `inteligencia`, `sabedoria`, `carisma` | número | Valores 3–18 (10 = modificador 0). |
| `pv_max`, `pv_atual` | número | Pontos de vida; o botão **rolar PV** e o contador −/+ gravam aqui. |
| `ca_base`, `bonus_armadura`, `bonus_escudo`, `outros_ca` | número | CA final = `ca_base` (10) + mod DES + armadura + escudo + outros. |
| `ba` | número | Bônus de Ataque base. Em branco, o plugin usa a tabela da classe/nível. |
| `jpd`, `jpc`, `jps` | número | JP base (DES/CON/SAB). Em branco, vêm da classe/nível. JP final soma o modificador do atributo. |
| `bonus_ba`, `bonus_jpd`, `bonus_jpc`, `bonus_jps` | número | Bônus somados **por cima** do cálculo automático. |
| `deslocamento` | número | Em metros (padrão 9; o povo pode alterar). |
| `po` | número | Ouro. |
| `mochila` | booleano | `true` dá +5 de capacidade de carga. |
| `ataques` | lista | `{ nome, bonus, dano }` (ex.: `dano: 1d8+2`). |
| `equipamento` | lista | `{ nome, carga }`. A capacidade é o maior entre FOR e CON; passar disso é sobrecarga (−3 de deslocamento). |
| `magias_preparadas` | mapa | Por círculo: `{ "1": ["Sono", ""], "2": ["Escudo Arcano"] }`. |
| `talentos_pontos` | mapa | Pontos por talento de Ladrão: `{ "Furtividade": 4 }`. |
| `notas` | texto | Anotações livres. |

</details>

## Importar personagem do Old Dragon Online (ODO)

Comando **"Importar personagem do ODO (Old Dragon Online)"**: cole o link (ou o ID) de uma ficha pública em [olddragon.com.br](https://olddragon.com.br) e o plugin baixa o personagem e insere um bloco `od2-ficha` preenchido no ponto do cursor.

```
https://olddragon.com.br/personagens/c1e96e80-2787-475e-8380-9b1dd1da5b7b
```

São mapeados: atributos, PV, XP, PO, retrato, povo, classe, nível e alinhamento; CA, BA e Jogadas de Proteção (ajustados para exibir exatamente os valores do ODO); ataques (armas) e equipamento com carga (mochila inclusa). Observações:

- O personagem precisa ser **público** no ODO.
- **Povo e classe** entram como texto — se o nome bater com uma definição reconhecida, os poderes aparecem; senão, ajuste o nome ou crie a nota de definição.
- Modelo do ODO: **arco e flecha** vêm como ataques separados, e armas também são listadas no equipamento (para contar a carga).

## Statblock de monstro: bloco `od2-monstro`

Bloco para criaturas, com botões de ataque/dano e de rolar PV pelos Dados de Vida.
Comando: **"Inserir statblock de monstro (OD2)"**.

## Raças e classes homebrew

Qualquer nota do vault com o frontmatter `od2-classe:` ou `od2-povo:` é indexada automaticamente e passa a valer nas fichas — basta usar o mesmo nome em `classe:` / `povo:`. Uma definição homebrew com o nome de uma classe/povo do SRD **sobrescreve** a embutida.

Os comandos **"Nova classe homebrew (OD2)"** e **"Novo povo homebrew (OD2)"** criam uma nota nova já com um template comentado (o frontmatter precisa ficar no topo da nota, então o comando cria o arquivo em vez de inserir no cursor).

Exemplo de classe:

```yaml
---
od2-classe: Feiticeiro
base: Mago            # herda BA/JP/perfil de magia da base (opcional): Guerreiro/Clérigo/Mago/Ladrão
dado_vida: 4
ba: [0, 1, 1, 1, 2, 2, 2, 3, 3, 3]
jp: [5, 5, 5, 5, 7, 7, 7, 7, 7, 10]
xp: [0, 2500, 5000, 8500, 11500, 23000, 33000, 43000, 53000, 106000]
poderes:
  - nivel: 1
    nome: Magia Inata
    desc: conjura sem grimório.
    melhorias:
      - nivel: 6
        desc: ganha um truque adicional.
---
```

**Campos de classe** (`od2-classe`): `base`, `dado_vida`, `ba[]`, `jp[]`, `xp[]` (limiar por nível), `magias[][]` (slots por círculo, por nível), `magias_sem_extra_atributo`, `poderes[]` (`{nivel, nome, desc, melhorias[]}`), `herda[]` (`{nome, sem_evolucao}` — para especializações), `talentos[]`, `talentos_atributo`, `bonus_por_nivel[]`.

**Campos de povo** (`od2-povo`): `deslocamento`, `infravisao`, `alinhamento`, `descricao`, `bonus_xp` (% de XP, ex.: `10`), `bonus` (`{jpd, jpc, jps, ba, ca, deslocamento}`), `habilidades[]` (`{nome, desc}`).

## Compêndio (gerador de referência)

Comando **"Gerar compêndio OD2 (SRD)"** cria uma pasta de notas de referência
interligadas a partir do conteúdo do SRD embutido no plugin:

- `Classes/` — 4 classes-base + 16 especializações (progressão de BA/JP, magias por dia, poderes);
- `Povos/` — os 6 povos (descrição, deslocamento, infravisão, bônus, habilidades);
- `Equipamento/` — armas, armaduras, itens gerais e sistema monetário;
- `Magias/` — listas arcanas (1º–9º) e divinas (1º–7º) por círculo;
- `Itens Mágicos.md` — itens mágicos por categoria;
- `Bestiário/` — ~200 criaturas (A–Z), cada uma com bloco `od2-monstro` interativo;
- uma nota-índice ligando tudo.

A pasta de destino é configurável (padrão: `Compêndio OD2`). O comando é **idempotente**:
ao regenerar, atualiza as notas marcadas com `od2_compendio: true` e **preserva**
qualquer nota sua de mesmo nome.

## Exportar o bestiário para o Fantasy Statblocks

Comando **"Exportar bestiário para Fantasy Statblocks (JSON)"** gera, dentro da pasta
do compêndio (`<pasta>/Fantasy Statblocks/`), o que o
[Fantasy Statblocks](https://github.com/javalent/fantasy-statblocks) precisa para
mostrar as ~250 criaturas do SRD com a aparência do OD2:

- `Bestiário OD2 (import Generic JSON).json` — todas as criaturas no formato do FS;
- `Layout Old Dragon 2 (import Layout).json` — layout que exibe CA, PV, DV, JP, Moral, XP, Encontro e Tesouro;
- `Como importar no Fantasy Statblocks.md` — passo a passo.

Importe **primeiro o layout** (Configurações → Fantasy Statblocks → *Layouts* → Import)
e depois as criaturas (seção de import → *Generic JSON*). Como a API do Fantasy
Statblocks é somente leitura, a ponte é por arquivo — reexecutar o comando regenera
os JSON e basta reimportar. Depois disso as criaturas aparecem na busca do FS, no
Initiative Tracker e no construtor de encontros.

## Integrações (opcionais)

Detecta automaticamente outros plugins instalados e coopera com eles; se não estiverem presentes, o comportamento padrão é mantido.

- **[Initiative Tracker](https://github.com/Obsidian-TTRPG-Community/initiative-tracker):** botão **"⚔️ + Initiative Tracker"** na ficha e nos statblocks adiciona o personagem/criatura ao combate (nome, PV, CA e modificador de iniciativa).
- **[Dice Roller](https://github.com/Obsidian-TTRPG-Community/dice-roller):** quando instalado, as rolagens de **dano** passam por ele. As rolagens de d20 (teste, ataque, JP) continuam no motor próprio, ciente das regras do OD2 (roll-under, crítico, ajuste).

## Instalação

> É preciso ter os **Plugins da comunidade** habilitados (na primeira vez o
> Obsidian pode pedir para desativar o "Modo restrito"/Safe Mode).

### Pela loja oficial — recomendado

O plugin já está na **loja de plugins da comunidade** do Obsidian:

1. **Configurações → Plugins da comunidade → Procurar**.
2. Busque por **"Old Dragon 2"** e clique em **Instalar**.
3. Ative o **Old Dragon 2 Toolkit**.

As atualizações chegam automaticamente pelo próprio Obsidian.

### Via BRAT — versões beta (antes de chegarem à loja)

O [BRAT](https://github.com/TfTHacker/obsidian42-brat) instala direto do GitHub e
acompanha cada release, útil para testar novidades antes da publicação na loja.

1. Instale e ative o **"BRAT"** (Obsidian42 - BRAT) pela busca de plugins da comunidade.
2. Paleta de comandos (**Ctrl/Cmd + P**) → **"BRAT: Add a beta plugin for testing"**.
3. Informe o repositório:
   ```
   Maicon-Lara/od2-toolkit
   ```
4. Confirme — o BRAT baixa a última release e instala.
5. Em **Plugins da comunidade**, ative o **Old Dragon 2 Toolkit**.

### Manual

1. Baixe `main.js`, `manifest.json` e `styles.css` da
   [última release](https://github.com/Maicon-Lara/od2-toolkit/releases/latest).
2. Crie a pasta `<seu-vault>/.obsidian/plugins/old-dragon-toolkit/` e copie os 3 arquivos
   para dentro dela.
3. Reabra o Obsidian (ou *Recarregar plugins*) e ative o **Old Dragon 2 Toolkit**
   em **Plugins da comunidade**.

## Desenvolvimento

```bash
npm install
npm run dev     # build em watch
npm run build   # build de produção (gera main.js)
npm test        # testes do motor de regras (vitest)
```

Para testar localmente, copie `main.js`, `manifest.json` e `styles.css` para
`<vault>/.obsidian/plugins/old-dragon-toolkit/`.

### Publicar uma nova versão
1. Atualize `version` em `manifest.json` e `package.json`, e adicione a entrada em `versions.json`.
2. Faça commit e crie a tag igual à versão (sem `v`): `git tag 0.6.0 && git push --tags`.
3. O workflow `.github/workflows/release.yml` builda e anexa os três arquivos à release.

### Enviar para a loja de plugins da comunidade
Após a primeira release, abra um PR em
[`obsidianmd/obsidian-releases`](https://github.com/obsidianmd/obsidian-releases)
adicionando a entrada do plugin em `community-plugins.json`.

## Licenciamento e atribuição

Licenciamento duplo:

- **Código** deste plugin: licença **MIT** (ver [`LICENSE`](LICENSE)).
- **Conteúdo de regras** (tabela de modificadores, progressões de BA/JP, dados de classe e povo em `src/basedata.ts`, etc.) é adaptado do **SRD do Old Dragon 2**, licenciado sob **Creative Commons CC BY-SA 4.0**. As partes deste projeto derivadas do SRD são, portanto, disponibilizadas sob a mesma licença (**CC BY-SA 4.0** — compartilhamento pela mesma licença). Ver [`NOTICE.md`](NOTICE.md).

Atribuição (CC BY-SA 4.0):

> Old Dragon 2ª edição © 2023 da Old Dragon Editora está licenciado sob CC BY-SA 4.0.

Projeto **gratuito e não comercial** de fã. Conforme a [política de licenciamento oficial](https://olddragon.com.br/licenciamento), conteúdo de fã pode ser criado livremente desde que **não seja vendido**.
