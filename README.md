# Farmar Aura

Jogo web idle/clicker (estilo Cookie Clicker) em HTML, CSS e JavaScript puro.
Um boneco mexe os braços e o jogador farma "aura" clicando; a aura compra
melhorias que farmam sozinhas.

## Como jogar

Abra o arquivo `index.html` no navegador. Não precisa instalar nada.

- **Clique no boneco** (ou use **A / D** e as **setas**): farma aura e aumenta o combo.
- **Espaço** (ou o botão "Giro da Aura"): o boneco gira e ganha aura extra. Recarga de 6 s.
- **Loja**: gaste aura em melhorias que aumentam o clique ou farmam sozinhas.

## Estado atual

- Tudo está em um único arquivo: `index.html` (HTML + CSS + JS).
- O boneco é desenhado em SVG dentro do `index.html` (braços, mãos, cabelo, óculos),
  com animações de piscar e respirar.
- Funciona: clique (mouse/toque/teclas A, D, setas), braços alternando,
  combo (x1 a x4), giro com a tecla Espaço (recarga de 6 s), loja com 7 melhorias,
  brilho que cresce com a aura, salvamento em `localStorage`,
  ganho offline (até 1 h a 50%).
- Os números de balanceamento ficam no começo do script:
  `UPGRADES`, `GROWTH`, `SPIN_CD`, `COMBO_MAX`.

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
3. Separar em `index.html`, `style.css` e `game.js` se o arquivo crescer.
4. Sons e efeitos (clique, giro, compra).
5. Primeira skin trocável.
6. Ranking e online só depois de tudo acima.
