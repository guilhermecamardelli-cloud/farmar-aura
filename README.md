# Farmar Aura

Jogo web idle/clicker (estilo Cookie Clicker) em HTML, CSS e JavaScript puro.
Um boneco mexe os braços e o jogador farma "aura" clicando; a aura compra
melhorias que farmam sozinhas.

## Como jogar

Abra o arquivo `index.html` no navegador. Não precisa instalar nada.

- **Clique no boneco** (ou use **A / D** e as **setas**): farma aura e aumenta o combo.
- **Espaço** (ou o botão "Giro da Aura"): o boneco gira e ganha aura extra. Recarga de 6 s.
- **Aura Dourada**: um orbe dourado aparece no palco a cada 1–3 min. Clique nele para
  ganhar Frenesi (aura/s x7), Clique divino (clique x15) ou Sorte (pacote de aura).
- **Loja**: melhorias (compradas várias vezes) e poderes (compra única, dobram uma melhoria
  ou mudam uma regra, como giro mais rápido ou combo x5).
- **Conquistas**: 115 metas (5 secretas); cada uma dá +2% de aura e +4% de **Brilho**.
- **Brilho** (como o "leite" do Cookie Clicker): a poça de aura no pé do palco sobe com o Brilho
  e muda de cor a cada 25 conquistas (Lilás, Safira, Esmeralda, Rubi, Dourada, Arco-íris, Cósmica).
- **Mascotes** (como os "gatinhos"): 6 poderes caros que multiplicam a aura/s por (1 + Brilho × fator).
  Eles se multiplicam entre si e aparecem sentados ao lado do boneco.
- **Boneco**: monte o seu: corpo (6 tipos), rosto (4 expressões), pele, cabelo e cor do cabelo,
  cor da roupa e da calça, chapéu (7 opções) e nome. Algumas opções são liberadas jogando
  (ex.: cartola com 1 mi de aura, auréola com 20 conquistas). Botões 🎲 Aleatório e ↺ Voltar ao padrão.
  Mais 8 acessórios que aparecem conforme as melhorias
  (óculos, pulseiras, notas musicais, corrente, coroa, flashes, runas, aura arco-íris).
- **Status**: estatísticas, exportar/importar save e recomeçar.

## Estado atual (v4)

- O jogo está em três arquivos: `index.html` (estrutura), `style.css` (visual)
  e `game.js` (lógica).
- O boneco é desenhado em SVG pelo `game.js` (braços, mãos, cabelo, acessórios),
  com animações de piscar, respirar e "pulinho" a cada clique.
- Fundo animado em canvas: estrelas, estrelas cadentes e partículas de aura
  (quanto mais aura/s, mais partículas). O palco muda de cor a cada movimento liberado
  e os ícones das melhorias giram em volta do boneco.
- 12 melhorias, 61 poderes (6 mascotes), 115 conquistas.
- Boneco personalizável (v3): as opções do editor ficam em `EDITOR`, `ROSTOS` e `CHAPEUS`;
  o visual escolhido fica em `S.visual`.
- Save em `localStorage` com número de versão (`v`). Saves antigos são migrados
  automaticamente (`MIGRACOES` no `game.js`); o save da v1 é lido da chave antiga.
- Ganho offline: até 1 h a 50%.
- Os números de balanceamento ficam no começo do `game.js`:
  `UPGRADES`, `GROWTH`, `SPIN_CD`, `COMBO_MAX`, `CONQ_BONUS`, `PODER_TIERS`,
  `PODERES_EXTRA` (inclui os mascotes), `DOURADA`, `BRILHO_POR_CONQ`, `CONQ_POR_POCA`, `POCAS`, `CEU`, `ORBITA`.

## Regras do projeto

- Manter simples: HTML/CSS/JS puro, sem framework e sem etapa de build.
- Publicação: GitHub Pages direto da raiz do repositório.
- Preferir código fácil de ler, com explicações curtas em português.
- Sem backend, pagamento, chat ou multiplayer por enquanto.

## Decisões já tomadas

- Web primeiro, Mobile depois.
- Visual 2D estilizado/cartoon.
- Giro/pulo dá aura extra (faz parte da pontuação).
- Chat e IA que aprende com o jogador ficam fora do MVP.
- Skins (3 a 5) são monetização futura.

## Próximos passos (um de cada vez)

1. Testar com 5 pessoas: continuam clicando depois de 30 s?
2. Ajustar o balanceamento (preços, ganhos, tempo de recarga do giro).
3. Sons e efeitos (clique, giro, compra).
4. Primeira skin trocável.
5. Ranking e online só depois de tudo acima.
