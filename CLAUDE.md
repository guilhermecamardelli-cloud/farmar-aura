# Farmar Aura (Projeto Jogo Aura)

Jogo web idle/clicker estilo Cookie Clicker: o jogador clica num boneco para farmar "aura" e compra melhorias que farmam sozinhas. Menu com 6 estilos de boneco. Detalhes de jogo no [README.md](README.md).

## Stack
HTML + CSS + JavaScript puro, em três arquivos (`index.html`, `style.css`, `game.js`). Sem framework, sem build, sem backend.

## Rodar
Abrir `index.html` no navegador. Publicação: GitHub Pages direto da raiz do repositório.

## Estrutura
```
index.html   estrutura da página (HTML)
style.css    visual (CSS)
game.js      lógica do jogo e boneco em SVG
README.md    regras, decisões e próximos passos
```

## Decisões de design
- Web primeiro, mobile depois. Visual 2D cartoon; boneco desenhado em SVG com animações de piscar e respirar.
- Controles: clique/toque, A/D e setas (braços alternam); Espaço = "Giro da Aura" (aura extra, recarga 6 s). Combo x1–x4.
- v2: 12 melhorias, 55 poderes, Aura Dourada (orbe com bônus temporário), 45 conquistas (+2% cada), acessórios no boneco, fundo animado em canvas, abas Loja/Boneco/Conquistas/Status.
- v3: editor de boneco (corpo, rosto, pele, cabelo, cores, chapéu, nome) em `EDITOR`/`ROSTOS`/`CHAPEUS`; partes dos corpos em `ESTILOS` são funções que recebem as cores escolhidas. Save v3 guarda `visual`.
- Progresso salvo em `localStorage` (chave `farmar-aura`) com campo `v`; mudou o formato do save → subir `SAVE_VERSAO` e adicionar uma função em `MIGRACOES`. Ganho offline até 1 h a 50%.
- Balanceamento centralizado no começo do `game.js`: `UPGRADES`, `GROWTH`, `SPIN_CD`, `COMBO_MAX`, `CONQ_BONUS`, `PODER_TIERS`, `PODERES_EXTRA`, `DOURADA`, `CEU`, `ORBITA`.
- Fora do MVP: backend, pagamento, chat, multiplayer, IA. Skins (3 a 5) ficam como monetização futura.

## Convenções
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
