# Farmar Aura (Projeto Jogo Aura)

Jogo web idle/clicker estilo Cookie Clicker: o jogador clica num boneco para farmar "aura" e compra melhorias que farmam sozinhas. Menu com 6 estilos de boneco. Detalhes de jogo no [README.md](README.md).

## Stack
HTML + CSS + JavaScript puro, em quatro arquivos (`index.html`, `style.css`, `icones.js`, `game.js`). Sem framework, sem build, sem backend.

## Rodar
Abrir `index.html` no navegador. Publicação: GitHub Pages direto da raiz do repositório.

## Estrutura
```
index.html   estrutura da página (HTML)
style.css    visual (CSS)
icones.js    ícones do jogo em SVG (sem emojis); icone("id") devolve o <svg>
game.js      lógica do jogo e boneco em SVG
README.md    regras, decisões e próximos passos
```

## Decisões de design
- Web primeiro, mobile depois. Visual 2D cartoon; boneco desenhado em SVG com animações de piscar e respirar.
- Controles: clique/toque, A/D e setas (braços alternam); Espaço = "Giro da Aura" (aura extra, recarga 6 s). Combo x1–x4.
- v2: 12 melhorias, 55 poderes, Aura Dourada (orbe com bônus temporário), 45 conquistas (+2% cada), acessórios no boneco, fundo animado em canvas, abas Loja/Boneco/Conquistas/Status.
- Layout em 3 colunas como o Cookie Clicker: palco (esquerda) | centro com abas Vitrine/Boneco/Conquistas/Status | loja com poderes em grade de ícones e comprar 1/10/100 (`QTD_COMPRA`). No computador cada coluna rola sozinha; abaixo de 1000px empilham (palco, loja, centro).
- Ícones: tudo usa os SVGs de `icones.js` (traço do boneco: contorno escuro, cores chapadas). Ícone de melhoria = mesmo nome do id. Não usar emojis na interface.
- v4: Brilho (4% por conquista, poça de aura que muda de cor a cada 25) + 6 Mascotes (aura/s x (1 + Brilho x fator)), 115 conquistas (5 secretas, `secreta:true`).
- v3: editor de boneco (corpo, rosto, pele, cabelo, cores, chapéu, nome) em `EDITOR`/`ROSTOS`/`CHAPEUS`; partes dos corpos em `ESTILOS` são funções que recebem as cores escolhidas. Save v3 guarda `visual`.
- Progresso salvo em `localStorage` (chave `farmar-aura`) com campo `v`; mudou o formato do save → subir `SAVE_VERSAO` e adicionar uma função em `MIGRACOES`. Ganho offline até 1 h a 50%.
- Balanceamento centralizado no começo do `game.js`: `UPGRADES`, `GROWTH`, `SPIN_CD`, `COMBO_MAX`, `CONQ_BONUS`, `PODER_TIERS`, `PODERES_EXTRA`, `DOURADA`, `BRILHO_POR_CONQ`, `CONQ_POR_POCA`, `POCAS`, `CEU`, `ORBITA`, `VITRINE`, `QTD_COMPRA`.
- Fora do MVP: backend, pagamento, chat, multiplayer, IA. Skins (3 a 5) ficam como monetização futura.

## Convenções
- Desempenho (o jogo precisa rodar em PC fraco, ex.: i3 antigo com vídeo integrado):
  - no `render()` (todo quadro) só escrever no DOM pelo `txt()`/`html()`, que ignoram valores iguais;
  - animar com `transform`/`opacity`; nada de `backdrop-filter`, nem `filter`/`drop-shadow` em elementos animados ou repetidos;
  - poucas animações: grupos animados em vez de uma animação por ícone; o céu (`CEU`) roda a 30 fps.
- Ao publicar, aumentar o `?v=` dos arquivos no `index.html` (evita o navegador misturar CSS velho com JS novo).
- Manter simples e fácil de ler; comentários curtos em português.
- Números de jogo só nas constantes do topo, nunca espalhados pelo código.
- Um passo de cada vez (seguir a ordem dos próximos passos).

## Pendente (nesta ordem)
1. Testar com 5 pessoas: continuam clicando depois de 30 s?
2. Ajustar balanceamento (preços, ganhos, recarga do giro).
3. Sons e efeitos.
4. Primeira skin trocável.
5. Ranking/online só depois do resto.
- A sessão do Claude que criou o jogo ("Farmer Aura web game") está arquivada e aponta para a pasta antiga `erp-guilherme-financas`.
