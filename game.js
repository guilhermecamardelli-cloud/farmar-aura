(function(){
  "use strict";

  /* ---------- formatação ---------- */
  const SUF = ["","mil","mi","bi","tri","qua","qui","sex","sep"];
  function fmt(n){
    n = Math.floor(n);
    if(n < 10000) return n.toLocaleString("pt-BR");
    let i = 0, v = n;
    while(v >= 1000 && i < SUF.length-1){ v /= 1000; i++; }
    return v.toFixed(v<10?2:v<100?1:0).replace(".",",") + " " + SUF[i];
  }

  /* ---------- melhorias (compradas várias vezes) ---------- */
  // tipo "click": soma ao valor do clique | tipo "auto": soma aura por segundo.
  // o ícone de cada melhoria tem o mesmo nome do id (veja icones.js)
  const UPGRADES = [
    {id:"braco",    name:"Braço mais forte",    type:"click", val:1,     base:15},
    {id:"pose",     name:"Pose de confiança",   type:"auto",  val:1,     base:50},
    {id:"oculos",   name:"Óculos escuros",      type:"auto",  val:5,     base:300},
    {id:"punho",    name:"Punho de ouro",       type:"click", val:10,    base:1000},
    {id:"trilha",   name:"Trilha sonora épica", type:"auto",  val:30,    base:2500},
    {id:"corrente", name:"Corrente de ouro",    type:"auto",  val:150,   base:12000},
    {id:"lenda",    name:"Lenda da Aura",       type:"auto",  val:1000,  base:90000},
    {id:"ensaio",   name:"Ensaio fotográfico",  type:"auto",  val:6000,  base:7e5},
    {id:"academia", name:"Academia da aura",    type:"auto",  val:40000, base:6e6},
    {id:"portal",   name:"Portal místico",      type:"auto",  val:25e4,  base:5e7},
    {id:"galaxia",  name:"Galáxia de aura",     type:"auto",  val:16e5,  base:4e8},
    {id:"infinita", name:"Aura infinita",       type:"auto",  val:1e7,   base:33e8}
  ];
  const GROWTH = 1.15;
  const SPIN_CD = 6000;        // ms
  const COMBO_MAX = 30;        // cada 10 pontos de combo = +1 no multiplicador (x4)
  const CONQ_BONUS = 0.02;     // cada conquista: +2% de aura

  /* ---------- Brilho (como o "leite" do Cookie Clicker) ---------- */
  // cada conquista dá BRILHO_POR_CONQ de Brilho; os Mascotes multiplicam a aura/s pelo Brilho.
  // a cada CONQ_POR_POCA conquistas a poça de aura no pé do palco muda de cor
  const BRILHO_POR_CONQ = 0.04;  // 4% por conquista (25 conquistas = 100%)
  const CONQ_POR_POCA = 25;
  const POCAS = [
    {nome:"Lilás",     cor:"#b388ff"},
    {nome:"Safira",    cor:"#4f8cff"},
    {nome:"Esmeralda", cor:"#34d399"},
    {nome:"Rubi",      cor:"#f43f5e"},
    {nome:"Dourada",   cor:"#ffd54f"},
    {nome:"Arco-íris", cor:"#ff6b6b", classe:"arcoiris"},
    {nome:"Cósmica",   cor:"#c4b5fd", classe:"cosmica"}
  ];
  const POCA_ALTURA = {base:26, porNivel:14, max:110};   // px
  const OFFLINE_MAX = 3600;    // segundos
  const OFFLINE_PCT = 0.5;

  /* ---------- poderes (comprados uma vez só) ---------- */
  // cada melhoria tem 4 poderes que dobram o que ela dá.
  // qtd = quantas precisa ter para liberar; x = preço em vezes o preço base
  const PODER_TIERS = [
    {nome:"Bronze",   qtd:1,  x:10},
    {nome:"Prata",    qtd:10, x:100},
    {nome:"Ouro",     qtd:25, x:1000},
    {nome:"Diamante", qtd:50, x:20000}
  ];
  const PODERES_EXTRA = [
    {id:"toque1", ic:"mao", name:"Toque de aura",     desc:"O clique ganha +1% da sua aura/s", efeito:"toque",       val:0.01, preco:1e4,    req:()=>S.stats.cliques >= 200},
    {id:"toque2", ic:"mao", name:"Toque lendário",    desc:"O clique ganha +2% da sua aura/s", efeito:"toque",       val:0.02, preco:2e6,    req:()=>S.stats.cliques >= 1000},
    {id:"giro1",  ic:"giro", name:"Giro turbinado",    desc:"Recarga do giro cai para 4 s",     efeito:"giroCD",      val:4000, preco:5000,   req:()=>S.stats.giros >= 10},
    {id:"giro2",  ic:"giro", name:"Giro duplo",        desc:"O giro dá o dobro de aura",        efeito:"giroX",       val:2,    preco:15e4,   req:()=>S.stats.giros >= 50},
    {id:"combo5", ic:"fogo", name:"Ritmo insano",      desc:"O combo vai até x5",               efeito:"comboMax",    val:40,   preco:5e4,    req:()=>S.stats.maxMult >= 4},
    {id:"sorte1", ic:"trevo", name:"Sorte dourada",     desc:"A Aura Dourada aparece 2x mais",   efeito:"douradaFreq", val:2,    preco:777777, req:()=>S.stats.douradas >= 3},
    {id:"sorte2", ic:"ampulheta", name:"Brilho duradouro",  desc:"Efeitos dourados duram 2x mais",   efeito:"douradaDur",  val:2,    preco:777e4,  req:()=>S.stats.douradas >= 7},
    // mascotes: aura/s x (1 + Brilho x val). Vários mascotes se multiplicam entre si
    ...[
      ["gato",   "Mascote aprendiz",  .1,   1e6,  15],
      ["cao",    "Mascote ajudante",  .125, 1e8,  30],
      ["raposa", "Mascote treinado",  .15,  1e10, 45],
      ["coruja", "Mascote sábio",     .175, 1e12, 60],
      ["dragao", "Mascote lendário",  .2,   1e14, 80],
      ["unicornio", "Mascote cósmico",   .2,   1e16, 100]
    ].map(([id, name, val, preco, conq]) => ({id:"mascote-"+id, ic:id, name, efeito:"mascote", val, preco,
      desc:"Aura/s x(1 + Brilho x " + String(val).replace(".", ",") + ")",
      req:()=>S.conquistas.length >= conq}))
  ];
  const PODERES = UPGRADES.flatMap(u => PODER_TIERS.map((t, i) => ({
    id: u.id + "-" + i,
    name: u.name + " · " + t.nome,
    desc: u.name + (u.type === "click" ? ": dobro por clique" : ": dobro de aura/s"),
    ic:u.id, efeito:"gerador", alvo:u.id, preco:u.base * t.x,
    req: () => own(u.id) >= t.qtd
  }))).concat(PODERES_EXTRA);

  /* ---------- Aura Dourada ---------- */
  const DOURADA = {
    min:60, max:180,      // segundos até aparecer
    vida:12,              // segundos na tela
    sortePct:0.15,        // sorte: 15% da aura atual...
    sorteSeg:900,         // ...mas no máximo 15 min de produção
    efeitos:[
      {id:"frenesi", ic:"fogo", nome:"Frenesi",       desc:"aura/s x7",  peso:5, dur:30, prod:7},
      {id:"divino",  ic:"clique", nome:"Clique divino", desc:"clique x15", peso:2, dur:10, clique:15},
      {id:"sorte",   ic:"trevo", nome:"Sorte",         peso:4}
    ]
  };

  /* ---------- visual ---------- */
  const CEU = {taxaMin:3, porDecada:6, taxaMax:45};       // partículas por segundo no fundo
  const ORBITA = {cada:5, porMelhoria:4, max:32, raio:128}; // ícones girando em volta do boneco
  const PODER_VISIVEIS = 4;    // a loja mostra só os poderes mais baratos

  // acessórios aparecem no boneco quando você tem a melhoria "req"
  const ACESSORIOS = [
    {id:"oculos",   ic:"oculos", nome:"Óculos escuros",   req:"oculos"},
    {id:"pulseira", ic:"pulseira", nome:"Pulseiras de ouro", req:"punho"},
    {id:"notas",    ic:"trilha", nome:"Notas musicais",    req:"trilha"},
    {id:"colar",    ic:"corrente", nome:"Corrente no peito", req:"corrente"},
    {id:"coroa",    ic:"lenda", nome:"Coroa",             req:"lenda"},
    {id:"flash",    ic:"ensaio", nome:"Flashes",           req:"ensaio"},
    {id:"runas",    ic:"portal", nome:"Círculo de runas",  req:"portal"},
    {id:"arcoiris", ic:"arcoiris", nome:"Aura arco-íris",    req:"infinita"}
  ];

  /* ---------- conquistas ---------- */
  // tier = cor da moldura (0 bronze, 1 prata, 2 ouro, 3 diamante, 4 arco-íris); nas listas vem da posição
  const tierDe = (i, total) => Math.min(4, Math.floor(i*5/total));
  // cada uma dá +CONQ_BONUS de aura (clique e por segundo)
  const CONQUISTAS = [].concat(
    [[100,"Primeira faísca"],[1e3,"Brilhando"],[1e4,"Radiante"],[1e5,"Ofuscante"],
     [1e6,"Sol particular"],[1e7,"Estrela cadente"],[1e8,"Nebulosa"],[1e9,"Planetário"],
     [1e10,"Buraco negro"],[1e11,"Supernova"],[1e12,"Aura cósmica"],[1e13,"Multiverso"],
     [1e14,"Onisciente"],[1e15,"Além da aura"]]
      .map(([n,nome], i, a) => ({id:"total"+n, ic:"aura", tier:tierDe(i, a.length), nome, desc:"Farmar " + fmt(n) + " de aura no total", ok:()=>S.total >= n})),
    [[10,"Hortinha de aura"],[100,"Fazenda de aura"],[1e3,"Fábrica de aura"],
     [1e4,"Metrópole da aura"],[1e5,"Aura global"],[1e6,"Aura interestelar"],
     [1e7,"Aura galáctica"],[1e8,"Aura dimensional"],[1e9,"Aura absoluta"]]
      .map(([n,nome], i, a) => ({id:"seg"+n, ic:"raio", tier:tierDe(i, a.length), nome, desc:"Chegar a " + fmt(n) + " de aura/s", ok:()=>perSecBase() >= n})),
    [[100,"Dedo nervoso"],[1000,"Mão calejada"],[10000,"Braço biônico"],[25000,"Clicador automático"],[50000,"Máquina de clicar"]]
      .map(([n,nome], i, a) => ({id:"clique"+n, ic:"clique", tier:tierDe(i, a.length), nome, desc:"Clicar " + fmt(n) + " vezes", ok:()=>S.stats.cliques >= n})),
    [[1e3,"Mão leve"],[1e6,"Mão pesada"],[1e9,"Mão de ouro"],[1e12,"Mão divina"]]
      .map(([n,nome], i, a) => ({id:"auraclique"+n, ic:"mao", tier:tierDe(i, a.length), nome, desc:"Farmar " + fmt(n) + " de aura só clicando", ok:()=>S.stats.auraClique >= n})),
    [[10,"Rodopio"],[100,"Furacão humano"],[500,"Carrossel"],[1000,"Redemoinho eterno"]]
      .map(([n,nome], i, a) => ({id:"giro"+n, ic:"giro", tier:tierDe(i, a.length), nome, desc:"Fazer " + n + " Giros da Aura", ok:()=>S.stats.giros >= n})),
    [[1,"Sortudo"],[10,"Caçador de ouro"],[25,"Garimpeiro"],[50,"Rei Midas"],[100,"Mina de ouro"],[250,"Dono do sol"]]
      .map(([n,nome], i, a) => ({id:"dourada"+n, ic:"dourada", tier:tierDe(i, a.length), nome, desc:"Pegar " + n + " Aura" + (n>1?"s Douradas":" Dourada"), ok:()=>S.stats.douradas >= n})),
    // marcos de cada melhoria (o id "cinquenta-" vem da v2 e foi mantido)
    [1, 50, 100, 150].flatMap((n, tier) => UPGRADES.map(u => ({
      id:(n === 50 ? "cinquenta-" : "qtd" + n + "-") + u.id, ic:u.id, tier, nome:u.name + " x" + n,
      desc:"Ter " + n + " de " + u.name, ok:()=>own(u.id) >= n}))),
    [
      {id:"combo4",  ic:"fogo", nome:"Ritmo perfeito",   desc:"Chegar ao combo x4",                ok:()=>S.stats.maxMult >= 4},
      {id:"combo5",  tier:3, ic:"fogo", nome:"Fora de controle", desc:"Chegar ao combo x5",                ok:()=>S.stats.maxMult >= 5},
      {id:"estilos", ic:"camiseta", nome:"Mil faces",        desc:"Usar os 6 tipos de corpo",       ok:()=>S.stats.estilos.length >= Object.keys(ESTILOS).length},
      {id:"todos",   ic:"medalha", nome:"Colecionador",     desc:"Ter pelo menos 1 de cada melhoria", ok:()=>UPGRADES.every(u=>own(u.id) >= 1)},
      {id:"dez",     tier:3, ic:"caixa", nome:"Estoque cheio",    desc:"Ter 10 de cada melhoria",           ok:()=>UPGRADES.every(u=>own(u.id) >= 10)},
      {id:"poder5",  ic:"estrela", nome:"Poderoso",         desc:"Comprar 5 poderes",                 ok:()=>S.poderes.length >= 5},
      {id:"poder20", ic:"estrela", nome:"Onipotente",       desc:"Comprar 20 poderes",                ok:()=>S.poderes.length >= 20},
      {id:"estilo",  ic:"diamante", nome:"Estiloso",         desc:"Liberar todos os acessórios",       ok:()=>ACESSORIOS.every(a=>own(a.req) > 0)},
      {id:"criador", ic:"paleta", nome:"Criador",          desc:"Personalizar 4 partes do boneco",   ok:()=>partesPersonalizadas() >= 4},
      {id:"batizado",ic:"etiqueta", nome:"Batizado",         desc:"Dar um nome ao boneco",             ok:()=>S.visual.nome !== ""},
      {id:"vaidoso", ic:"cartola", nome:"Vaidoso",          desc:"Usar todos os chapéus",             ok:()=>Object.keys(CHAPEUS).every(k=>S.stats.chapeus.includes(k))},
      {id:"poder40", tier:3, ic:"estrela", nome:"Todo-poderoso",    desc:"Comprar 40 poderes",                ok:()=>S.poderes.length >= 40},
      {id:"mascote1",ic:"pata", nome:"Melhor amigo",     desc:"Ter um mascote",                    ok:()=>ativos("mascote").length >= 1},
      {id:"mascote6",tier:3, ic:"pata", nome:"Zoológico",        desc:"Ter os 6 mascotes",                 ok:()=>ativos("mascote").length >= 6},
      {id:"duplo",   ic:"dourada", nome:"Combo dourado",    desc:"Ter dois efeitos dourados ao mesmo tempo", ok:()=>buffs.length >= 2},
      {id:"guardado",tier:3, ic:"cofre", nome:"Acumulador",       desc:"Ter 1 bi de aura guardada",         ok:()=>S.aura >= 1e9},
      {id:"tempo1",  ic:"relogio", nome:"Fiel",             desc:"Jogar por 1 hora",                  ok:()=>S.stats.tempo >= 3600},
      {id:"tempo10", tier:3, ic:"ampulheta", nome:"Viciado em aura",  desc:"Jogar por 10 horas",                ok:()=>S.stats.tempo >= 36000},
      {id:"dias7",   ic:"calendario", nome:"Dedicado",         desc:"Jogar em 7 dias diferentes",        ok:()=>S.stats.dias.length >= 7},
      {id:"dias30",  tier:3, ic:"calendario", nome:"Veterano",         desc:"Jogar em 30 dias diferentes",       ok:()=>S.stats.dias.length >= 30}
    ],
    // secretas: o que pedem só aparece depois de conseguir
    [
      {id:"purista", ic:"lotus", nome:"Purista",       desc:"Farmar 100 mil de aura sem comprar nenhuma melhoria", ok:()=>S.total >= 1e5 && UPGRADES.every(u=>own(u.id) === 0)},
      {id:"coruja",  ic:"lua", nome:"Coruja",        desc:"Jogar às 3 da manhã",                  ok:()=>new Date().getHours() === 3},
      {id:"quem",    ic:"espelho", nome:"Aura de quem?", desc:"Clicar 10 vezes no título do jogo",    ok:()=>S.stats.cliquesTitulo >= 10},
      {id:"paciente",ic:"fantasma", nome:"Desapegado",    desc:"Deixar 10 Auras Douradas sumirem",     ok:()=>S.stats.douradasPerdidas >= 10},
      {id:"indeciso",ic:"setas", nome:"Indeciso",      desc:"Trocar de corpo 50 vezes",             ok:()=>S.stats.trocasCorpo >= 50}
    ].map(c => Object.assign(c, {secreta:true}))
  );

  /* ---------- movimentos (liberados conforme a aura total) ---------- */
  // ângulos em graus: o = ombro, c = cotovelo, p = pulso (L = esquerdo, R = direito)
  // o braço direito é desenhado espelhado, então nos dois lados: positivo = abre para fora/para cima
  const REST = {oL:15, cL:-10, pL:0, oR:15, cR:-10, pR:0, corpo:0, cabeca:0};
  const NIVEIS = [
    {aura:0, nome:"Braços", maoAberta:false, poses:[
      // só o ombro: um braço sobe, o outro desce
      {oL:130, cL:0, pL:0, oR:15,  cR:0, pR:0, corpo:0, cabeca:0},
      {oL:15,  cL:0, pL:0, oR:130, cR:0, pR:0, corpo:0, cabeca:0}
    ]},
    {aura:300, nome:"Cotovelos", maoAberta:false, poses:[
      // a mão sobe perto do rosto dobrando o cotovelo
      {oL:45, cL:20,  pL:0, oR:60, cR:110, pR:0, corpo:-2, cabeca:3},
      {oL:60, cL:110, pL:0, oR:45, cR:20,  pR:0, corpo:2,  cabeca:-3}
    ]},
    {aura:3000, nome:"Mãos abertas", maoAberta:true, poses:[
      {oL:45, cL:20,  pL:20, oR:60, cR:110, pR:15, corpo:-2, cabeca:3},
      {oL:60, cL:110, pL:15, oR:45, cR:20,  pR:20, corpo:2,  cabeca:-3}
    ]},
    {aura:30000, nome:"Onda de aura", maoAberta:true, poses:[
      // o pulso vira de um lado para o outro e o corpo balança junto
      {oL:45, cL:20,  pL:30,  oR:60, cR:110, pR:15,  corpo:-3, cabeca:5},
      {oL:60, cL:110, pL:15,  oR:45, cR:20,  pR:30,  corpo:3,  cabeca:-5},
      {oL:40, cL:30,  pL:-25, oR:60, cR:115, pR:-20, corpo:-2, cabeca:4},
      {oL:60, cL:115, pL:-20, oR:40, cR:30,  pR:-25, corpo:2,  cabeca:-4}
    ]}
  ];

  /* ---------- desenho: rosto, mãos, chapéus e acessórios (reaproveitados pelos estilos) ---------- */
  const CONTORNO = "#1b1b1b";
  const CLARO = "#f3efff";

  // mistura duas cores hex (t = 0..1); usada para clarear/escurecer os degradês
  function misturar(a, b, t){
    const p = h => [1,3,5].map(i => parseInt(h.slice(i, i+2), 16));
    const [x, y] = [p(a), p(b)];
    return "#" + x.map((v, i) => Math.round(v + (y[i]-v)*t).toString(16).padStart(2, "0")).join("");
  }

  // expressões do rosto (sobrancelhas, olhos e boca); req = condição para liberar
  const ROSTOS = {
    confiante: {nome:"Confiante", desenho:(cor, olho)=>`
      <path d="M-34 -16 Q-21 -25 -8 -18" fill="none" stroke="${cor}" stroke-width="4" stroke-linecap="round"/>
      <path d="M8 -12 L34 -15" fill="none" stroke="${cor}" stroke-width="4" stroke-linecap="round"/>
      <g class="olhos">
        <path d="M-32 -2 Q-20 11 -8 -2 Z" fill="${olho}" stroke="${cor}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M8 -2 Q20 11 32 -2 Z" fill="${olho}" stroke="${cor}" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="-15" cy="2" r="4.5" fill="${cor}"/><circle cx="25" cy="2" r="4.5" fill="${cor}"/>
        <path d="M-35 -3 L-5 -2" stroke="${cor}" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M5 -2 L35 -3" stroke="${cor}" stroke-width="4.5" stroke-linecap="round"/>
      </g>
      <path d="M-12 25 Q2 31 14 18" fill="none" stroke="${cor}" stroke-width="3.5" stroke-linecap="round"/>`},
    feliz: {nome:"Feliz", desenho:(cor)=>`
      <path d="M-32 -18 Q-20 -26 -8 -18" fill="none" stroke="${cor}" stroke-width="4" stroke-linecap="round"/>
      <path d="M8 -18 Q20 -26 32 -18" fill="none" stroke="${cor}" stroke-width="4" stroke-linecap="round"/>
      <g class="olhos">
        <path d="M-30 4 Q-20 -8 -10 4" fill="none" stroke="${cor}" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M10 4 Q20 -8 30 4" fill="none" stroke="${cor}" stroke-width="4.5" stroke-linecap="round"/>
      </g>
      <path d="M-16 15 Q0 36 16 15 Z" fill="${cor}" stroke="${cor}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="0" cy="25" rx="7" ry="3.5" fill="#ff7a8a"/>`},
    fofo: {nome:"Fofo", desenho:(cor)=>`
      <path d="M-28 -18 Q-20 -22 -12 -18" fill="none" stroke="${cor}" stroke-width="3" stroke-linecap="round"/>
      <path d="M12 -18 Q20 -22 28 -18" fill="none" stroke="${cor}" stroke-width="3" stroke-linecap="round"/>
      <g class="olhos">
        <circle cx="-20" cy="2" r="9" fill="${cor}"/><circle cx="20" cy="2" r="9" fill="${cor}"/>
        <circle cx="-17" cy="-1" r="3" fill="#fff"/><circle cx="23" cy="-1" r="3" fill="#fff"/>
      </g>
      <ellipse cx="-31" cy="16" rx="7" ry="4" fill="#ff8fa3" opacity=".7"/>
      <ellipse cx="31" cy="16" rx="7" ry="4" fill="#ff8fa3" opacity=".7"/>
      <path d="M-7 20 Q-3.5 25 0 20 Q3.5 25 7 20" fill="none" stroke="${cor}" stroke-width="3" stroke-linecap="round"/>`},
    bravo: {nome:"Bravo", req:()=>S.stats.maxMult >= 4, reqTxt:"Chegue ao combo x4", desenho:(cor, olho)=>`
      <g class="olhos">
        <ellipse cx="-20" cy="2" rx="11" ry="7" fill="${olho}" stroke="${cor}" stroke-width="2.5"/>
        <ellipse cx="20" cy="2" rx="11" ry="7" fill="${olho}" stroke="${cor}" stroke-width="2.5"/>
        <circle cx="-17" cy="3" r="4" fill="${cor}"/><circle cx="17" cy="3" r="4" fill="${cor}"/>
      </g>
      <path d="M-35 -14 L-8 -4" stroke="${cor}" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M8 -4 L35 -14" stroke="${cor}" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M-12 25 Q0 16 12 25" fill="none" stroke="${cor}" stroke-width="3.5" stroke-linecap="round"/>`}
  };
  // rosto no ponto (x,y); os óculos ficam por cima de qualquer expressão
  function rosto(x, y, escala, cor, olho, tipo){
    return `<g transform="translate(${x} ${y}) scale(${escala})">
      ${(ROSTOS[tipo] || ROSTOS.confiante).desenho(cor, olho)}
      <g class="acc acc-oculos">
        <rect x="-38" y="-10" width="33" height="18" rx="6" fill="#111"/>
        <rect x="5" y="-10" width="33" height="18" rx="6" fill="#111"/>
        <rect x="-6" y="-5" width="12" height="4" fill="#111"/>
        <rect x="-33" y="-7" width="9" height="3" rx="1.5" fill="#fff" opacity=".5"/>
        <rect x="10" y="-7" width="9" height="3" rx="1.5" fill="#fff" opacity=".5"/>
      </g>
    </g>`;
  }

  // chapéus: desenhados no topo da cabeça (ponto "coroa" do estilo).
  // alt = quanto a coroa sobe para ficar em cima do chapéu
  const CHAPEUS = {
    nenhum:  {nome:"Nenhum"},
    bone:    {nome:"Boné", alt:16, desenho:c=>`
      <path d="M-50 22 Q-50 -16 0 -16 Q50 -16 50 22 Z" fill="${c.roupa}" stroke="${CONTORNO}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M0 -16 L0 20" stroke="${CONTORNO}" stroke-width="1.5" opacity=".35"/>
      <circle cx="0" cy="-16" r="4" fill="${c.roupaEscura}" stroke="${CONTORNO}" stroke-width="2"/>
      <path d="M-54 20 Q0 38 54 20 Q0 28 -54 20 Z" fill="${c.roupaEscura}" stroke="${CONTORNO}" stroke-width="2.5" stroke-linejoin="round"/>`},
    gorro:   {nome:"Gorro", alt:30, desenho:c=>`
      <path d="M-48 22 Q-50 -22 0 -24 Q50 -22 48 22 Z" fill="${c.roupa}" stroke="${CONTORNO}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="-51" y="8" width="102" height="16" rx="6" fill="${c.roupaEscura}" stroke="${CONTORNO}" stroke-width="3"/>
      <circle cx="0" cy="-27" r="9" fill="#fff" stroke="${CONTORNO}" stroke-width="3"/>`},
    lacinho: {nome:"Lacinho", desenho:()=>`
      <g transform="translate(34 6) rotate(-15)">
        <path d="M0 0 L-18 -12 L-18 12 Z M0 0 L18 -12 L18 12 Z" fill="#ff5c8a" stroke="${CONTORNO}" stroke-width="2.5" stroke-linejoin="round"/>
        <circle r="5" fill="#ff8fb0" stroke="${CONTORNO}" stroke-width="2"/>
      </g>`},
    cartola: {nome:"Cartola", alt:52, req:()=>S.total >= 1e6, reqTxt:"Farme 1 mi de aura no total", desenho:c=>`
      <rect x="-32" y="-44" width="64" height="62" rx="4" fill="#20202c" stroke="#000" stroke-width="2.5"/>
      <rect x="-32" y="2" width="64" height="10" fill="${c.roupa}"/>
      <ellipse cx="0" cy="18" rx="52" ry="8" fill="#20202c" stroke="#000" stroke-width="2.5"/>
      <path d="M-24 -38 L-24 -4" stroke="#fff" stroke-width="3" opacity=".15" stroke-linecap="round"/>`},
    chifres: {nome:"Chifres", req:()=>S.stats.douradas >= 5, reqTxt:"Pegue 5 Auras Douradas", desenho:()=>`
      <path d="M-30 18 Q-46 -6 -34 -30 Q-28 -8 -16 12 Z" fill="#e5484d" stroke="${CONTORNO}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M30 18 Q46 -6 34 -30 Q28 -8 16 12 Z" fill="#e5484d" stroke="${CONTORNO}" stroke-width="2.5" stroke-linejoin="round"/>`},
    aureola: {nome:"Auréola", req:()=>S.conquistas.length >= 20, reqTxt:"Tenha 20 conquistas", desenho:()=>`
      <ellipse cx="0" cy="-42" rx="32" ry="8" fill="none" stroke="#ffd54f" stroke-width="5"/>
      <ellipse cx="0" cy="-42" rx="32" ry="8" fill="none" stroke="#fff6c2" stroke-width="1.5"/>`}
  };

  // coroa com a base no ponto (0,0)
  function coroa([x, y, s]){
    return `<g class="acc acc-coroa" transform="translate(${x} ${y}) scale(${s})">
      <path d="M-24 0 L-28 -24 L-13 -11 L0 -30 L13 -11 L28 -24 L24 0 Z" fill="#ffd54f" stroke="${CONTORNO}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="-23" y="-7" width="46" height="5" fill="#f0b400"/>
      <circle cx="0" cy="-30" r="3.5" fill="#ff5c8a" stroke="${CONTORNO}" stroke-width="1.5"/>
      <circle cx="-28" cy="-24" r="3" fill="#69f0ae" stroke="${CONTORNO}" stroke-width="1.5"/>
      <circle cx="28" cy="-24" r="3" fill="#69f0ae" stroke="${CONTORNO}" stroke-width="1.5"/>
    </g>`;
  }
  // corrente pendurada a partir do ponto (0,0), com medalhão "A"
  function colar([x, y, s]){
    return `<g class="acc acc-colar" transform="translate(${x} ${y}) scale(${s})">
      <path d="M-22 0 Q0 30 22 0" fill="none" stroke="${CONTORNO}" stroke-width="6" stroke-linecap="round"/>
      <path d="M-22 0 Q0 30 22 0" fill="none" stroke="#ffd54f" stroke-width="3.5" stroke-dasharray="4 2.5" stroke-linecap="round"/>
      <circle cx="0" cy="17" r="6.5" fill="#ffd54f" stroke="${CONTORNO}" stroke-width="2"/>
      <text x="0" y="20.5" font-size="9" text-anchor="middle" font-weight="900" fill="${CONTORNO}">A</text>
    </g>`;
  }

  // cada tipo de mão tem dois desenhos: "normal" (relaxada) e "aberta" (espalmada).
  // a mão é desenhada com o pulso no ponto (0,0), apontando para baixo, polegar para fora do corpo
  const MAOS = {
    redonda: {
      normal: c => `
        <ellipse cx="-8" cy="9" rx="4" ry="6" fill="${c}" stroke="${CONTORNO}" stroke-width="2.5"/>
        <path d="M-8 0 Q-11 15 -5 21 Q0 24 5 21 Q11 15 8 0 Z" fill="${c}" stroke="${CONTORNO}" stroke-width="2.5"/>`,
      aberta: c => {
        const dedos = ["M-8 6 L-19 13","M-6 13 L-11 30","M-2 15 L-3 34","M2 15 L5 33","M6 13 L11 28"];
        return dedos.map(d=>`<path d="${d}" stroke="${CONTORNO}" stroke-width="8.5" stroke-linecap="round"/>`).join("")
             + dedos.map(d=>`<path d="${d}" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/>`).join("")
             + `<ellipse cx="0" cy="9" rx="10" ry="10" fill="${c}" stroke="${CONTORNO}" stroke-width="2.5"/>`;
      }
    },
    bloco: {
      normal: c => `
        <rect x="-13" y="4" width="6" height="10" fill="${c}" stroke="${CONTORNO}" stroke-width="2.5"/>
        <rect x="-9" y="0" width="18" height="20" rx="2" fill="${c}" stroke="${CONTORNO}" stroke-width="2.5"/>`,
      aberta: c => [[-7,18],[-2.5,6],[2,-6],[6.5,-18]]
          .map(([x,a])=>`<rect x="${x-2.5}" y="10" width="5" height="16" fill="${c}" stroke="${CONTORNO}" stroke-width="2" transform="rotate(${a} ${x} 10)"/>`).join("")
        + `<rect x="-13" y="4" width="6" height="12" fill="${c}" stroke="${CONTORNO}" stroke-width="2" transform="rotate(50 -10 4)"/>`
        + `<rect x="-9" y="0" width="18" height="14" rx="2" fill="${c}" stroke="${CONTORNO}" stroke-width="2.5"/>`
    },
    palito: {
      normal: c => `<circle cx="0" cy="3" r="4.5" fill="${c}"/>`,
      aberta: c => ["M0 2 L-10 7","M0 2 L-7 13","M0 2 L-1 15","M0 2 L5 14","M0 2 L9 10"]
          .map(d=>`<path d="${d}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`).join("")
    }
  };

  /* ---------- tipos de corpo ---------- */
  // cada corpo diz onde fica o ombro (do braço esquerdo), o tamanho dos braços e o desenho das partes.
  // O braço direito é o esquerdo espelhado. As partes recebem "c" com as cores escolhidas pelo jogador
  // (c.pele, c.roupa, c.calca são degradês; c.roupaCor e c.cabelo são cores lisas).
  // padrao = cores usadas quando o jogador deixa "padrão"; coroa, colar e rosto = [x, y, escala]
  const ESTILOS = {
    chibi: {
      nome:"Chibi",
      ombro:[78,142], braco:24, antebraco:24, grossura:14, forma:"tubo", mao:"redonda", tamMao:1.1,
      pescoco:[100,132], quadril:[100,196], coroa:[100,24,1], colar:[100,138,1], rosto:[100,88,1],
      padrao:{roupa:"#7b55f0", calca:"#4a79c0", cabelo:"#2b1a0e"},
      cores: c => ({braco:c.roupa, antebraco:c.roupa, mao:c.pele}),
      fundo: c => `
        <ellipse cx="100" cy="246" rx="46" ry="7" fill="#000" opacity=".35"/>
        <rect x="82" y="188" width="16" height="44" rx="7" fill="${c.calca}" stroke="${CONTORNO}" stroke-width="3"/>
        <rect x="102" y="188" width="16" height="44" rx="7" fill="${c.calca}" stroke="${CONTORNO}" stroke-width="3"/>
        <ellipse cx="87" cy="236" rx="14" ry="8" fill="#fff" stroke="${CONTORNO}" stroke-width="3"/>
        <ellipse cx="113" cy="236" rx="14" ry="8" fill="#fff" stroke="${CONTORNO}" stroke-width="3"/>`,
      tronco: c => `
        <rect x="70" y="128" width="60" height="66" rx="18" fill="${c.roupa}" stroke="${CONTORNO}" stroke-width="3"/>
        <rect x="71.5" y="152" width="57" height="14" fill="#fff" opacity=".35"/>
        <path d="M100 131 L100 192" stroke="${CONTORNO}" stroke-width="2"/>
        <path d="M86 136 L90 142 L86 148 L82 142 Z" fill="#ffd54f" stroke="${CONTORNO}" stroke-width="1.5"/>`,
      cabeca: c => `<circle cx="100" cy="78" r="56" fill="${c.pele}" stroke="${CONTORNO}" stroke-width="3"/>`,
      cabelo: c => `
        <path d="M44 82 Q36 18 100 16 Q166 18 156 82 Q150 54 132 46 L127 62 L114 42 L103 60 L90 42 L80 60 Q60 52 44 82 Z"
              fill="${c.cabelo}" stroke="${CONTORNO}" stroke-width="3" stroke-linejoin="round"/>`
    },
    cartoon: {
      nome:"Cartoon",
      ombro:[63,100], braco:40, antebraco:40, grossura:16, forma:"tubo", mao:"redonda", tamMao:1,
      pescoco:[100,88], quadril:[100,190], coroa:[100,20,.75], colar:[100,92,1], rosto:[100,57,.62],
      padrao:{roupa:"#7b55f0", calca:"#4a79c0", cabelo:"#2b1a0e"},
      cores: c => ({braco:c.roupa, antebraco:c.pele, mao:c.pele}),
      fundo: c => `
        <ellipse cx="100" cy="282" rx="48" ry="8" fill="#000" opacity=".35"/>
        <rect x="76" y="185" width="20" height="82" rx="8" fill="${c.calca}" stroke="${CONTORNO}" stroke-width="3"/>
        <rect x="104" y="185" width="20" height="82" rx="8" fill="${c.calca}" stroke="${CONTORNO}" stroke-width="3"/>
        <path d="M66 276 Q66 262 80 262 L96 262 L96 276 Z" fill="#fff" stroke="${CONTORNO}" stroke-width="3" stroke-linejoin="round"/>
        <path d="M134 276 Q134 262 120 262 L104 262 L104 276 Z" fill="#fff" stroke="${CONTORNO}" stroke-width="3" stroke-linejoin="round"/>`,
      tronco: c => `
        <rect x="68" y="88" width="64" height="106" rx="18" fill="${c.roupa}" stroke="${CONTORNO}" stroke-width="3"/>
        <rect x="70" y="172" width="60" height="8" fill="${CONTORNO}"/>
        <path d="M100 118 L106 132 L100 146 L94 132 Z" fill="#ffd54f" stroke="${CONTORNO}" stroke-width="2"/>`,
      cabeca: c => `<circle cx="100" cy="52" r="36" fill="${c.pele}" stroke="${CONTORNO}" stroke-width="3"/>`,
      cabelo: c => `
        <path d="M64 50 Q62 12 100 12 Q140 12 136 50 Q124 30 108 34 Q112 24 98 26 Q90 34 76 34 Q68 40 64 50 Z"
              fill="${c.cabelo}" stroke="${CONTORNO}" stroke-width="3" stroke-linejoin="round"/>`
    },
    blocado: {
      nome:"Blocado",
      ombro:[61,122], braco:28, antebraco:28, grossura:16, forma:"bloco", mao:"bloco", tamMao:1,
      pescoco:[100,116], quadril:[100,180], coroa:[100,37,.85], colar:[100,118,1], rosto:[100,82,.85],
      padrao:{roupa:"#ff7043", calca:"#37306b", cabelo:"#2b1a0e"},
      cores: c => ({braco:c.roupa, antebraco:c.pele, mao:c.pele}),
      fundo: c => `
        <ellipse cx="100" cy="246" rx="44" ry="7" fill="#000" opacity=".35"/>
        <rect x="80" y="176" width="19" height="58" fill="${c.calca}" stroke="${CONTORNO}" stroke-width="3"/>
        <rect x="101" y="176" width="19" height="58" fill="${c.calca}" stroke="${CONTORNO}" stroke-width="3"/>
        <rect x="76" y="228" width="24" height="11" fill="#fff" stroke="${CONTORNO}" stroke-width="3"/>
        <rect x="100" y="228" width="24" height="11" fill="#fff" stroke="${CONTORNO}" stroke-width="3"/>`,
      tronco: c => `
        <rect x="70" y="116" width="60" height="64" rx="2" fill="${c.roupa}" stroke="${CONTORNO}" stroke-width="3"/>
        <path d="M100 132 L107 145 L100 158 L93 145 Z" fill="#ffd54f" stroke="${CONTORNO}" stroke-width="2"/>`,
      cabeca: c => `<rect x="64" y="40" width="72" height="74" rx="4" fill="${c.pele}" stroke="${CONTORNO}" stroke-width="3"/>`,
      cabelo: c => `
        <rect x="62" y="34" width="76" height="20" rx="3" fill="${c.cabelo}" stroke="${CONTORNO}" stroke-width="3"/>
        <rect x="63" y="52" width="8" height="16" fill="${c.cabelo}"/>
        <rect x="129" y="52" width="8" height="16" fill="${c.cabelo}"/>`
    },
    jujuba: {
      nome:"Jujuba",
      ombro:[57,124], braco:24, antebraco:24, grossura:16, forma:"tubo", mao:"redonda", tamMao:1,
      pescoco:[100,110], quadril:[100,210], coroa:[100,46,.85], colar:[100,112,1], rosto:[100,84,.58],
      padrao:{roupa:"#f7ac30", calca:"#c76a00", cabelo:"#2b1a0e"},
      cores: c => ({braco:c.roupa, antebraco:c.roupa, mao:c.roupa}),
      fundo: c => `
        <ellipse cx="100" cy="234" rx="46" ry="7" fill="#000" opacity=".35"/>
        <ellipse cx="82" cy="222" rx="15" ry="8" fill="${c.calca}" stroke="${CONTORNO}" stroke-width="3"/>
        <ellipse cx="118" cy="222" rx="15" ry="8" fill="${c.calca}" stroke="${CONTORNO}" stroke-width="3"/>`,
      tronco: c => `
        <rect x="56" y="40" width="88" height="180" rx="44" fill="${c.roupa}" stroke="${CONTORNO}" stroke-width="3"/>
        <path d="M100 150 L106 162 L100 174 L94 162 Z" fill="#fff3dc" stroke="${CONTORNO}" stroke-width="2"/>`,
      cabeca: () => `<rect x="64" y="60" width="72" height="48" rx="24" fill="#fff3dc" stroke="${CONTORNO}" stroke-width="3"/>`
    },
    palitinho: {
      nome:"Palitinho",
      ombro:[100,116], braco:30, antebraco:28, grossura:5, forma:"linha", mao:"palito", tamMao:1.2,
      pescoco:[100,104], quadril:[100,172], coroa:[100,42,.6], colar:[100,106,.7], rosto:[100,74,.68],
      corRosto:CLARO, olho:"#1a1535",
      padrao:{roupa:CLARO, calca:CLARO, cabelo:CLARO},
      // linhas retas não aceitam degradê, então o palitinho usa as cores lisas
      cores: c => ({braco:c.roupaCor, antebraco:c.roupaCor, mao:c.roupaCor}),
      fundo: c => `
        <ellipse cx="100" cy="246" rx="40" ry="6" fill="#000" opacity=".35"/>
        <path d="M100 170 L84 240 M100 170 L116 240" stroke="${c.calcaCor}" stroke-width="5" stroke-linecap="round" fill="none"/>`,
      tronco: c => `<path d="M100 104 L100 172" stroke="${c.roupaCor}" stroke-width="5" stroke-linecap="round"/>`,
      cabeca: () => `<circle cx="100" cy="72" r="32" fill="#1a1535" stroke="${CLARO}" stroke-width="5"/>`,
      cabelo: c => `<path d="M86 44 Q94 28 100 40 Q106 26 114 44" fill="none" stroke="${c.cabelo}" stroke-width="4" stroke-linecap="round"/>`
    },
    espirito: {
      nome:"Espírito",
      ombro:[56,136], braco:20, antebraco:20, grossura:12, forma:"tubo", mao:"redonda", tamMao:.9,
      pescoco:[100,130], quadril:[100,200], coroa:[100,46,.8], colar:[100,132,1], rosto:[100,104,.75],
      corRosto:"#26215C",
      padrao:{roupa:"#8f80f0", calca:"#8f80f0", cabelo:"#ffd54f"},
      cores: c => ({braco:c.roupa, antebraco:c.roupa, mao:c.roupa}),
      fundo: () => `<ellipse cx="100" cy="240" rx="36" ry="6" fill="#000" opacity=".3"/>`,
      tronco: c => `
        <path d="M100 40 Q152 40 152 122 Q152 184 128 210 L119 194 L110 214 L100 196 L90 214 L81 194 L72 210 Q48 184 48 122 Q48 40 100 40 Z"
              fill="${c.roupa}" stroke="#26215C" stroke-width="3" stroke-linejoin="round"/>`,
      cabeca: () => "",
      // a chama em cima da cabeça faz o papel do cabelo
      cabelo: c => `<path d="M100 41 Q90 26 98 10 Q104 24 112 16 Q112 32 100 41 Z" fill="${c.cabelo}" stroke="#26215C" stroke-width="2" stroke-linejoin="round"/>`
    }
  };

  /* ---------- editor do boneco ---------- */
  // visual = o que o jogador escolheu; null nas cores = usar a cor padrão do corpo
  function visualPadrao(){
    return {corpo:"chibi", rosto:"confiante", pele:"#f8c294", cabelo:"original", corCabelo:null,
            roupa:null, calca:null, chapeu:"nenhum", nome:""};
  }
  const NOME_MAX = 16;
  // grupos do editor: campo no visual, se é cor (bolinhas) e as opções; req/reqTxt = condição para liberar
  const comNomes = obj => Object.keys(obj).map(k => ({id:k, nome:obj[k].nome, req:obj[k].req, reqTxt:obj[k].reqTxt}));
  const EDITOR = [
    {campo:"corpo", titulo:"Corpo", opcoes:comNomes(ESTILOS)},
    {campo:"rosto", titulo:"Rosto", opcoes:comNomes(ROSTOS)},
    {campo:"pele", titulo:"Pele", cor:true, opcoes:[
      {id:"#ffe0c4"},{id:"#f8c294"},{id:"#e0a370"},{id:"#b97a4a"},{id:"#8d5a3b"},{id:"#5e3b26"},
      {id:"#9be7a0", req:()=>S.total >= 1e5, reqTxt:"Farme 100 mil de aura no total"},
      {id:"#a8c8ff", req:()=>S.total >= 1e7, reqTxt:"Farme 10 mi de aura no total"}]},
    {campo:"cabelo", titulo:"Cabelo", opcoes:[{id:"original", nome:"Com cabelo"}, {id:"careca", nome:"Careca"}]},
    {campo:"corCabelo", titulo:"Cor do cabelo", cor:true, opcoes:[
      {id:null},{id:"#2b1a0e"},{id:"#6b3e1f"},{id:"#d9a441"},{id:"#e8e2d6"},{id:"#d2452c"},{id:"#3b2a8f"},{id:"#ff6fb5"},{id:"#33c9a8"}]},
    {campo:"roupa", titulo:"Roupa", cor:true, opcoes:[
      {id:null},{id:"#7b55f0"},{id:"#e5484d"},{id:"#2f9e5a"},{id:"#2b7de9"},{id:"#f59e0b"},{id:"#ec4899"},{id:"#2a2a3a"},{id:"#f1f5f9"},
      {id:"#ffd54f", req:()=>own("lenda") > 0, reqTxt:"Tenha 1 Lenda da Aura"}]},
    {campo:"calca", titulo:"Calça e pés", cor:true, opcoes:[
      {id:null},{id:"#4a79c0"},{id:"#37306b"},{id:"#2a2a3a"},{id:"#6b4f2a"},{id:"#9ca3af"},{id:"#7f1d1d"}]},
    {campo:"chapeu", titulo:"Chapéu", opcoes:comNomes(CHAPEUS)}
  ];
  const livre = o => !o.req || o.req();
  // quantas partes estão diferentes do padrão (para a conquista "Criador")
  const partesPersonalizadas = () => {
    const p = visualPadrao();
    return ["corpo","rosto","pele","cabelo","corCabelo","roupa","calca","chapeu"].filter(k => S.visual[k] !== p[k]).length;
  };

  /* ---------- estado e save ---------- */
  const SAVE_KEY = "farmar-aura";
  const SAVE_ANTIGO = "farmar-aura-v1";   // chave usada pela versão 1 do jogo
  const SAVE_VERSAO = 4;
  let S = fresh();
  function fresh(){
    return {v:SAVE_VERSAO, aura:0, total:0, owned:{}, poderes:[], conquistas:[], ocultos:[],
      stats:{cliques:0, auraClique:0, giros:0, douradas:0, maxMult:1, estilos:["chibi"], inicio:Date.now(),
             chapeus:["nenhum"], dias:[], tempo:0, cliquesTitulo:0, douradasPerdidas:0, trocasCorpo:0},
      spinReadyAt:0, saved:Date.now(), visual:visualPadrao(), nivel:0};
  }
  // cada migração leva um save da versão n para a n+1
  const MIGRACOES = {
    1: d => Object.assign(d, {poderes:[], conquistas:[], ocultos:[],
      stats:{cliques:0, auraClique:0, giros:0, douradas:0, maxMult:1, estilos:[d.estilo || "chibi"], inicio:Date.now()}}),
    // v3: o boneco virou personalizável; o estilo escolhido vira o "corpo"
    2: d => { d.visual = Object.assign(visualPadrao(), {corpo:d.estilo || "chibi"}); delete d.estilo; return d; },
    // v4: estatísticas novas (chapéus, dias, tempo...); os valores iniciais vêm do fresh()
    3: d => { d.stats.chapeus = [d.visual.chapeu]; return d; }
  };
  function lerSave(txt){
    let d = JSON.parse(txt);
    if(!d || typeof d.aura !== "number") throw new Error("save inválido");
    for(let v = d.v || 1; v < SAVE_VERSAO; v++){ d = MIGRACOES[v](d); d.v = v + 1; }
    const f = fresh();
    return Object.assign(f, d, {owned:d.owned || {}, stats:Object.assign(f.stats, d.stats), visual:Object.assign(f.visual, d.visual)});
  }
  function load(){
    try{
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem(SAVE_ANTIGO);
      if(raw) S = lerSave(raw);
    }catch(e){}
  }
  function save(){
    try{ S.saved = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }catch(e){}
  }

  /* ---------- cálculos ---------- */
  let buffs = [];                      // efeitos da Aura Dourada ativos
  let combo = 0;                       // 0..comboMax()
  const own = id => S.owned[id] || 0;
  const tem = id => S.poderes.includes(id);
  const cost = u => Math.floor(u.base * Math.pow(GROWTH, own(u.id)));
  const ativos = efeito => PODERES.filter(p => p.efeito === efeito && tem(p.id));
  const fator = efeito => ativos(efeito).reduce((a,p)=>a*p.val, 1);
  const multGerador = u => Math.pow(2, ativos("gerador").filter(p => p.alvo === u.id).length);
  const producao = u => u.val * own(u.id) * multGerador(u);
  const soma = tipo => UPGRADES.filter(u => u.type === tipo).reduce((a,u)=>a+producao(u), 0);
  const bonusConq = () => 1 + S.conquistas.length * CONQ_BONUS;
  const buffMult = k => buffs.reduce((a,b)=>a*(b[k] || 1), 1);
  const brilho = () => S.conquistas.length * BRILHO_POR_CONQ;
  const multMascotes = () => ativos("mascote").reduce((a,p)=>a*(1 + brilho()*p.val), 1);
  const perSecBase = () => soma("auto") * bonusConq() * multMascotes();   // sem efeitos dourados
  const perSec = () => perSecBase() * buffMult("prod");
  const toque = () => ativos("toque").reduce((a,p)=>a+p.val, 0);
  const clickBase = () => (1 + soma("click")) * bonusConq() + perSec() * toque();
  const comboMax = () => Math.max(COMBO_MAX, ...ativos("comboMax").map(p=>p.val));
  const mult = () => 1 + Math.floor(combo/10);   // x1 .. x4 (x5 com Ritmo insano)
  const perClick = () => clickBase() * mult() * buffMult("clique");
  const spinCD = () => Math.min(SPIN_CD, ...ativos("giroCD").map(p=>p.val));
  const accOn = id => { const a = ACESSORIOS.find(x=>x.id===id); return own(a.req) > 0 && !S.ocultos.includes(id); };
  function nivelAtual(){
    let n = 0;
    NIVEIS.forEach((nv, i)=>{ if(S.total >= nv.aura) n = i; });
    return n;
  }
  function ganhar(g){ S.aura += g; S.total += g; }

  /* ---------- elementos ---------- */
  const $ = id => document.getElementById(id);
  const el = {
    score:$("score"), perClick:$("perClick"), perSec:$("perSec"), buffs:$("buffs"),
    arena:$("arena"), char:$("char"), glow:$("glow"), orbita:$("orbita"),
    stage:$("stage"), comboBar:$("comboBar"), mult:$("mult"), nivelInfo:$("nivelInfo"),
    spinBtn:$("spinBtn"), cd:$("cd"), shop:$("shopList"), reset:$("reset"),
    poderList:$("poderList"), poderVazio:$("poderVazio"), acess:$("acessorios"),
    conqList:$("conqList"), conqInfo:$("conqInfo"), conqDetalhe:$("conqDetalhe"), conqCount:$("conqCount"),
    stats:$("stats"), saveTxt:$("saveTxt"), toasts:$("toasts"),
    editor:$("editor"), preview:$("preview"), nome:$("nomeBoneco"), titulo:$("titulo"),
    poca:$("poca"), mascotes:$("mascotes"), brilhoInfo:$("brilhoInfo"), mascotesInfo:$("mascotesInfo"),
    svg:null   // preenchido quando o boneco é montado
  };

  /* ---------- boneco: montar e mexer ---------- */
  // cores escolhidas pelo jogador (ou as padrão do corpo). p = prefixo dos ids,
  // para o boneco do palco e a prévia do editor não usarem os mesmos ids
  function coresDe(v, e, p){
    const roupa = v.roupa || e.padrao.roupa, calca = v.calca || e.padrao.calca;
    const degrade = (id, cor) => `<linearGradient id="${p}${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${misturar(cor, "#ffffff", .25)}"/><stop offset="1" stop-color="${misturar(cor, "#000000", .2)}"/></linearGradient>`;
    return {
      pele:`url(#${p}pele)`, roupa:`url(#${p}roupa)`, calca:`url(#${p}calca)`,
      roupaCor:roupa, roupaEscura:misturar(roupa, "#000000", .35), calcaCor:calca,
      cabelo:v.corCabelo || e.padrao.cabelo,
      defs:`<defs>${degrade("pele", v.pele)}${degrade("roupa", roupa)}${degrade("calca", calca)}</defs>`
    };
  }

  // monta um braço (ombro > cotovelo > pulso > mão). lado = "L" ou "R"
  function braco(e, c, lado, p){
    const [x, y] = e.ombro, w = e.grossura, cor = e.cores(c);
    const yCotovelo = y + e.braco, yPulso = yCotovelo + e.antebraco;
    const peca = (y0, comp, cor) => e.forma === "linha"
      ? `<path d="M${x} ${y0} L${x} ${y0+comp}" stroke="${cor}" stroke-width="${w}" stroke-linecap="round"/>`
      : `<rect x="${x-w/2}" y="${y0-w/2}" width="${w}" height="${comp+w}" rx="${e.forma==="bloco" ? 2 : w/2}"
               fill="${cor}" stroke="${CONTORNO}" stroke-width="2.5"/>`;
    const mao = MAOS[e.mao];
    return `<g id="${p}ombro${lado}" class="junta" style="transform-origin:${x}px ${y}px">
        ${peca(y, e.braco, cor.braco)}
        <g id="${p}cotovelo${lado}" class="junta" style="transform-origin:${x}px ${yCotovelo}px">
          ${peca(yCotovelo, e.antebraco, cor.antebraco)}
          <ellipse class="acc acc-pulseira" cx="${x}" cy="${yPulso-3}" rx="${w/2+2.5}" ry="3.5" fill="#ffd54f" stroke="${CONTORNO}" stroke-width="1.5"/>
          <g id="${p}pulso${lado}" class="junta" style="transform-origin:${x}px ${yPulso}px">
            <g transform="translate(${x} ${yPulso}) scale(${e.tamMao})">
              <g class="mao-normal">${mao.normal(cor.mao)}</g>
              <g class="mao-aberta">${mao.aberta(cor.mao)}</g>
            </g>
          </g>
        </g>
      </g>`;
  }

  // desenha o boneco inteiro a partir do visual escolhido
  function svgBoneco(v, p){
    const e = ESTILOS[v.corpo] || ESTILOS.chibi, c = coresDe(v, e, p);
    const ch = CHAPEUS[v.chapeu] || CHAPEUS.nenhum, [cx, cy, cs] = e.coroa;
    return `<svg viewBox="0 0 200 300" width="200" height="300">
      ${c.defs}${e.fundo(c)}
      <g class="respira">
        <g id="${p}corpo" class="junta" style="transform-origin:${e.quadril[0]}px ${e.quadril[1]}px">
          ${e.tronco(c)}
          ${colar(e.colar)}
          <g id="${p}cabeca" class="junta" style="transform-origin:${e.pescoco[0]}px ${e.pescoco[1]}px">
            ${e.cabeca(c)}
            ${v.cabelo === "careca" || !e.cabelo ? "" : e.cabelo(c)}
            ${rosto(...e.rosto, e.corRosto || CONTORNO, e.olho || "#fff", v.rosto)}
            ${ch.desenho ? `<g transform="translate(${cx} ${cy}) scale(${cs})">${ch.desenho(c)}</g>` : ""}
            ${coroa([cx, cy - (ch.alt || 0)*cs, cs])}
          </g>
          ${braco(e, c, "L", p)}
          <g transform="translate(200 0) scale(-1 1)">${braco(e, c, "R", p)}</g>
        </g>
      </g>
    </svg>`;
  }

  let juntas = {};
  function montarBoneco(){
    el.char.innerHTML = svgBoneco(S.visual, "");
    el.preview.innerHTML = svgBoneco(S.visual, "p-");
    el.svg = el.char.querySelector("svg");
    juntas = {
      oL:$("ombroL"), cL:$("cotoveloL"), pL:$("pulsoL"),
      oR:$("ombroR"), cR:$("cotoveloR"), pR:$("pulsoR"),
      corpo:$("corpo"), cabeca:$("cabeca")
    };
    setPose(REST);
    el.titulo.textContent = S.visual.nome ? "Aura de " + S.visual.nome : "Farmar Aura";
  }
  function setPose(p){
    for(const k in juntas) juntas[k].style.transform = "rotate(" + p[k] + "deg)";
  }
  let poseIdx = -1, restTimer = 0;
  function nextPose(){
    const nivel = NIVEIS[nivelAtual()];
    poseIdx = (poseIdx + 1) % nivel.poses.length;
    setPose(nivel.poses[poseIdx]);
    el.svg.classList.toggle("abrir", nivel.maoAberta);
    // se parar de clicar, volta para a pose parada com a mão normal
    clearTimeout(restTimer);
    restTimer = setTimeout(()=>{ setPose(REST); el.svg.classList.remove("abrir"); }, 900);
  }
  // reinicia uma animação CSS (remove a classe e coloca de novo)
  function animar(alvo, classe){
    alvo.classList.remove(classe); void alvo.getBoundingClientRect(); alvo.classList.add(classe);
  }

  // botões fixos do HTML com data-ic ganham o ícone na frente do texto
  document.querySelectorAll("[data-ic]").forEach(e => e.insertAdjacentHTML("afterbegin", icone(e.dataset.ic)));

  /* ---------- abas ---------- */
  let aba = "loja";
  document.querySelectorAll("#abas button").forEach(b=>{
    b.addEventListener("click", ()=>{
      aba = b.dataset.aba;
      document.querySelectorAll("#abas button").forEach(x=>x.classList.toggle("ativo", x === b));
      document.querySelectorAll(".painel").forEach(p=>p.classList.toggle("ativo", p.id === "aba-" + aba));
      renderLento();
    });
  });

  /* ---------- editor do boneco (DOM) ---------- */
  let editorKey = null;
  function montarEditor(){
    editorKey = EDITOR.map(g => g.opcoes.map(o => livre(o) ? 1 : 0).join("")).join();
    el.editor.innerHTML = "";
    EDITOR.forEach(g=>{
      const h = document.createElement("h3");
      h.textContent = g.titulo;
      const linha = document.createElement("div");
      linha.className = g.cor ? "cores" : "formas";
      g.opcoes.forEach(o=>{
        const ok = livre(o), b = document.createElement("button");
        b.className = (g.cor ? "cor" : "forma") + (o.id === null ? " padrao" : "") +
          (S.visual[g.campo] === o.id ? " ativo" : "") + (ok ? "" : " travado");
        if(g.cor && o.id) b.style.background = o.id;
        b.innerHTML = g.cor ? (o.id === null ? "↺" : ok ? "" : icone("cadeado")) :
          (ok ? miniatura(g.campo, o.id) : icone("cadeado")) + "<span>" + o.nome + "</span>";
        b.title = ok ? (o.nome || (o.id ? o.id : "Cor padrão do corpo")) : o.reqTxt;
        b.addEventListener("click", ()=>{
          if(!ok) return toast("cadeado", "Ainda bloqueado", o.reqTxt);
          escolher(g.campo, o.id);
        });
        linha.appendChild(b);
      });
      el.editor.append(h, linha);
    });
  }
  // desenho pequeno de cada opção (corpo, rosto e chapéu) com as cores atuais do jogador
  function miniatura(campo, id){
    const e = ESTILOS[S.visual.corpo] || ESTILOS.chibi;
    if(campo === "corpo") return svgBoneco(Object.assign({}, S.visual, {corpo:id, chapeu:"nenhum"}), "m-" + id + "-")
      .replace('width="200" height="300"', 'class="mini"');
    if(campo === "rosto") return `<svg class="mini" viewBox="-42 -42 84 84">${coresDe(S.visual, e, "mr-" + id + "-").defs}
      <circle r="38" fill="url(#mr-${id}-pele)" stroke="${CONTORNO}" stroke-width="3"/>${rosto(0, 2, 1, CONTORNO, "#fff", id)}</svg>`;
    if(campo === "chapeu"){
      const ch = CHAPEUS[id];
      if(!ch.desenho) return icone("nenhum", "mini");
      const c = coresDe(S.visual, e, "mc-" + id + "-");
      return `<svg class="mini" viewBox="-58 -50 116 84">${c.defs}${ch.desenho(c)}</svg>`;
    }
    return "";
  }
  function escolher(campo, valor){
    if(campo === "corpo" && valor !== S.visual.corpo) S.stats.trocasCorpo++;
    if(campo === "chapeu" && !S.stats.chapeus.includes(valor)) S.stats.chapeus.push(valor);
    S.visual[campo] = valor;
    if(campo === "corpo" && !S.stats.estilos.includes(valor)) S.stats.estilos.push(valor);
    montarBoneco(); montarEditor(); save();
  }
  el.nome.addEventListener("input", ()=>{
    S.visual.nome = el.nome.value.trim().slice(0, NOME_MAX);
    el.titulo.textContent = S.visual.nome ? "Aura de " + S.visual.nome : "Farmar Aura";
    save();
  });
  $("aleatorio").addEventListener("click", ()=>{
    EDITOR.forEach(g=>{
      const ok = g.opcoes.filter(livre);
      S.visual[g.campo] = ok[Math.floor(Math.random()*ok.length)].id;
    });
    if(!S.stats.estilos.includes(S.visual.corpo)) S.stats.estilos.push(S.visual.corpo);
    if(!S.stats.chapeus.includes(S.visual.chapeu)) S.stats.chapeus.push(S.visual.chapeu);
    montarBoneco(); montarEditor(); save();
  });
  $("padrao").addEventListener("click", ()=>{
    S.visual = Object.assign(visualPadrao(), {corpo:S.visual.corpo, nome:S.visual.nome});
    montarBoneco(); montarEditor(); save();
  });

  /* ---------- loja (DOM) ---------- */
  const shopBtns = {};
  UPGRADES.forEach(u=>{
    const b = document.createElement("button");
    b.className = "up";
    b.innerHTML = '<span class="n"></span><span class="c"></span><span class="d"></span><span class="q"></span>';
    b.addEventListener("click", ()=>buy(u));
    el.shop.appendChild(b);
    shopBtns[u.id] = b;
  });
  function buy(u){
    const c = cost(u);
    if(S.aura < c) return;
    S.aura -= c;
    S.owned[u.id] = own(u.id) + 1;
    save(); render();
  }
  function comprarPoder(p){
    if(S.aura < p.preco || tem(p.id)) return;
    S.aura -= p.preco;
    S.poderes.push(p.id);
    if(p.efeito === "mascote"){ mascoteKey = null; renderBrilho(); }
    toast(p.ic, p.name, p.desc);
    save(); render();
  }

  /* ---------- ações ---------- */
  function farm(x, y){
    // cada clique leva o boneco para a próxima pose
    nextPose();
    animar(el.svg, "bump");

    combo = Math.min(comboMax(), combo + 1.2);
    const g = perClick();
    ganhar(g);
    S.stats.cliques++;
    S.stats.auraClique += g;
    S.stats.maxMult = Math.max(S.stats.maxMult, mult());
    popup("+" + fmt(g), x, y);
    render();
  }

  function spin(){
    const now = Date.now();
    if(now < S.spinReadyAt) return;
    S.spinReadyAt = now + spinCD();
    const bonus = (clickBase()*20*mult() + perSec()*10) * fator("giroX");
    ganhar(bonus);
    S.stats.giros++;
    animar(el.char, "spin");
    popup("+" + fmt(bonus), el.arena.clientWidth/2, 30, "grande");
    save(); render();
  }

  function popup(txt, x, y, classe){
    const p = document.createElement("div");
    p.className = "pop" + (classe ? " " + classe : "");
    p.textContent = txt;
    p.style.left = (x - 20 + (Math.random()*30-15)) + "px";
    p.style.top  = (y - 10) + "px";
    el.arena.appendChild(p);
    setTimeout(()=>p.remove(), classe === "nota" ? 1600 : 900);
  }

  function toast(ic, titulo, txt){
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="tic">${icone(ic)}</span><div><b>${titulo}</b><small>${txt}</small></div>`;
    el.toasts.appendChild(t);
    setTimeout(()=>t.classList.add("sai"), 3200);
    setTimeout(()=>t.remove(), 3700);
  }

  /* ---------- Aura Dourada ---------- */
  let dourada = null, proxDourada = 0;
  function agendarDourada(){
    const seg = DOURADA.min + Math.random()*(DOURADA.max - DOURADA.min);
    proxDourada = Date.now() + seg*1000 / fator("douradaFreq");
  }
  function mostrarDourada(){
    const d = document.createElement("button");
    d.className = "dourada";
    d.setAttribute("aria-label", "Aura Dourada");
    d.style.left = (6 + Math.random()*78) + "%";
    d.style.top  = (8 + Math.random()*72) + "%";
    d.fim = Date.now() + DOURADA.vida*1000;
    d.addEventListener("pointerdown", e=>{ e.preventDefault(); e.stopPropagation(); pegarDourada(); });
    el.stage.appendChild(d);
    dourada = d;
  }
  function sumirDourada(){
    if(dourada){ dourada.remove(); dourada = null; }
    agendarDourada();
  }
  function sortearEfeito(){
    let r = Math.random() * DOURADA.efeitos.reduce((a,e)=>a+e.peso, 0);
    for(const ef of DOURADA.efeitos){ r -= ef.peso; if(r < 0) return ef; }
    return DOURADA.efeitos[0];
  }
  function pegarDourada(){
    if(!dourada) return;
    const ef = sortearEfeito();
    const meio = el.arena.clientWidth/2 - 30;
    S.stats.douradas++;
    if(ef.dur){
      const dur = ef.dur * fator("douradaDur");
      buffs = buffs.filter(b=>b.id !== ef.id);
      buffs.push({id:ef.id, ic:ef.ic, nome:ef.nome, desc:ef.desc, prod:ef.prod, clique:ef.clique, dur, fim:Date.now() + dur*1000});
      popup(ef.nome + "!", meio, 40, "grande");
      toast(ef.ic, ef.nome, ef.desc + " por " + Math.round(dur) + " s");
    }else{
      const g = Math.min(S.aura*DOURADA.sortePct, perSec()*DOURADA.sorteSeg) + 13;
      ganhar(g);
      popup("+" + fmt(g), meio, 40, "grande");
      toast(ef.ic, ef.nome, "+" + fmt(g) + " de aura");
    }
    sumirDourada(); save(); render();
  }

  /* ---------- conquistas ---------- */
  function checarConquistas(){
    const novas = CONQUISTAS.filter(c => !S.conquistas.includes(c.id) && c.ok());
    if(!novas.length) return;
    novas.forEach(c => S.conquistas.push(c.id));
    // muitas de uma vez (save antigo) viram um aviso só
    if(novas.length > 3) toast("trofeu", novas.length + " conquistas!", "Veja na aba de conquistas");
    else novas.forEach(c => toast(c.ic, "Conquista: " + c.nome, c.desc));
    save();
  }

  /* ---------- entrada ---------- */
  el.arena.addEventListener("pointerdown", e=>{
    e.preventDefault();
    const r = el.arena.getBoundingClientRect();
    farm(e.clientX - r.left, e.clientY - r.top);
  });
  el.spinBtn.addEventListener("click", spin);
  window.addEventListener("keydown", e=>{
    if(e.repeat || ["TEXTAREA","INPUT"].includes(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if(k===" "){ e.preventDefault(); spin(); }
    else if(["a","d","arrowleft","arrowright"].includes(k)){
      e.preventDefault();
      farm(el.arena.clientWidth/2, 120);
    }
  });
  el.reset.addEventListener("click", ()=>{
    if(confirm("Apagar todo o progresso e recomeçar?")){
      const visual = S.visual;          // o boneco montado continua o mesmo
      S = fresh(); S.visual = visual; S.stats.estilos = [visual.corpo];
      combo = 0; buffs = [];
      sumirDourada(); save(); render(); renderLento();
    }
  });

  // exportar/importar: o save vira um texto (base64) que dá para copiar e colar
  $("exportar").addEventListener("click", ()=>{
    save();
    el.saveTxt.value = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
    el.saveTxt.select();
    if(navigator.clipboard) navigator.clipboard.writeText(el.saveTxt.value).then(
      ()=>toast("exportar", "Save copiado", "Guarde esse texto em algum lugar seguro"), ()=>{});
  });
  $("importar").addEventListener("click", ()=>{
    const txt = el.saveTxt.value.trim();
    if(!txt) return toast("importar", "Cole um save", "Cole o texto exportado na caixa abaixo");
    try{
      const novo = lerSave(decodeURIComponent(escape(atob(txt))));
      if(!confirm("Trocar o progresso atual por esse save?")) return;
      S = novo; combo = 0; buffs = [];
      montarBoneco(); montarEditor(); el.nome.value = S.visual.nome; save(); render(); renderLento();
      el.saveTxt.value = "";
      toast("importar", "Save importado", fmt(S.aura) + " de aura");
    }catch(e){
      toast("alerta", "Save inválido", "Confira se copiou o texto inteiro");
    }
  });

  /* ---------- fundo animado (canvas) ---------- */
  // estrelas piscando, partículas de aura subindo (mais aura/s = mais partículas) e estrelas cadentes
  const ceu = $("ceu"), ctx = ceu.getContext("2d");
  let W = 0, H = 0, estrelas = [], motes = [], acum = 0, cadente = null, proxCadente = 5;
  function ajustarCeu(){
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    ceu.width = W*dpr; ceu.height = H*dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    estrelas = Array.from({length: Math.round(W*H/7000)}, ()=>({
      x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.3 + .3, f:Math.random()*6.3, v:.4 + Math.random()*1.6
    }));
  }
  window.addEventListener("resize", ajustarCeu);
  ajustarCeu();
  function bolinha(x, y, r, cor, alfa){
    ctx.globalAlpha = alfa; ctx.fillStyle = cor;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  }
  function desenharCeu(dt, t){
    ctx.clearRect(0, 0, W, H);
    for(const s of estrelas) bolinha(s.x, s.y, s.r, "#fff", .25 + .6*Math.abs(Math.sin(t*.001*s.v + s.f)));

    const taxa = Math.min(CEU.taxaMax, CEU.taxaMin + Math.log10(perSec() + 1)*CEU.porDecada);
    const chanceOuro = S.total >= 1e5 ? .4 : .08;
    acum += taxa*dt;
    while(acum >= 1 && motes.length < 400){
      acum--;
      motes.push({x:Math.random()*W, y:H + 10, vx:(Math.random()-.5)*12, vy:18 + Math.random()*40,
                  r:1 + Math.random()*2.4, vida:0, max:6 + Math.random()*7, ouro:Math.random() < chanceOuro});
    }
    motes = motes.filter(m => (m.vida += dt) < m.max && m.y > -10);
    for(const m of motes){
      m.x += m.vx*dt + Math.sin(m.vida*2 + m.r)*.3; m.y -= m.vy*dt;
      const a = Math.sin(Math.PI * m.vida/m.max), cor = m.ouro ? "#ffd54f" : "#b388ff";
      bolinha(m.x, m.y, m.r*3, cor, a*.12);
      bolinha(m.x, m.y, m.r, cor, a*.8);
    }

    proxCadente -= dt;
    if(!cadente && proxCadente <= 0){
      cadente = {x:Math.random()*W*.7, y:Math.random()*H*.35, vida:0};
      proxCadente = 6 + Math.random()*10;
    }
    if(cadente){
      cadente.vida += dt;
      const x = cadente.x + cadente.vida*520, y = cadente.y + cadente.vida*220;
      const g = ctx.createLinearGradient(x - 120, y - 51, x, y);
      g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(255,255,255,.9)");
      ctx.globalAlpha = 1 - cadente.vida/.9; ctx.strokeStyle = g; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 120, y - 51); ctx.lineTo(x, y); ctx.stroke();
      if(cadente.vida > .9) cadente = null;
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- render (todo quadro) ---------- */
  function render(){
    el.score.textContent = fmt(S.aura);
    el.perClick.textContent = fmt(perClick());
    el.perSec.textContent = fmt(perSec());
    el.mult.textContent = "x" + mult();
    el.comboBar.style.width = (combo/comboMax()*100) + "%";

    // brilho cresce com a aura total
    const glow = Math.min(420, 160 + Math.log10(S.total+1)*45);
    el.glow.style.setProperty("--glow", glow + "px");
    el.arena.classList.toggle("gold", S.total >= 100000);

    // movimento atual e o próximo a liberar
    const n = nivelAtual(), prox = NIVEIS[n+1];
    el.nivelInfo.innerHTML = "Movimento: <b>" + NIVEIS[n].nome + "</b>" +
      (prox ? " <span>· próximo: " + prox.nome + " com " + fmt(prox.aura) + " de aura</span>"
            : " <span>· todos liberados!</span>");
    el.stage.dataset.nivel = n;


    // efeitos dourados ativos
    const agora = Date.now();
    el.buffs.innerHTML = buffs.map(b=>{
      const s = (b.fim - agora)/1000;
      return `<span class="buff">${icone(b.ic)}${b.nome} <small>${b.desc} · ${Math.ceil(s)} s</small><i style="width:${s/b.dur*100}%"></i></span>`;
    }).join("");

    // melhorias: as ainda não descobertas ficam escondidas; só a próxima aparece como "???"
    let misterio = false;
    UPGRADES.forEach(u=>{
      const b = shopBtns[u.id], c = cost(u);
      const visivel = own(u.id) > 0 || S.total >= u.base*0.3 || u === UPGRADES[0];
      if(!visivel && misterio){ b.style.display = "none"; return; }
      b.style.display = "";
      b.classList.toggle("misterio", !visivel);
      b.querySelector(".c").textContent = fmt(c);
      b.disabled = !visivel || S.aura < c;
      if(!visivel){
        misterio = true;
        b.dataset.ic = "";
        b.querySelector(".n").innerHTML = icone("secreta") + "???";
        b.querySelector(".d").textContent = "Continue farmando para descobrir";
        b.querySelector(".q").textContent = "";
        return;
      }
      const unid = u.type === "click" ? "por clique" : "aura/s";
      if(b.dataset.ic !== u.id){ b.dataset.ic = u.id; b.querySelector(".n").innerHTML = icone(u.id) + u.name; }
      b.querySelector(".d").textContent = "+" + fmt(u.val*multGerador(u)) + " " + unid + " cada" +
        (own(u.id) ? " · total " + fmt(producao(u)) : "");
      b.querySelector(".q").textContent = own(u.id) ? "x" + own(u.id) : "";
    });

    renderPoderes();
    renderAcessorios();
    renderOrbita();
  }

  // as listas abaixo só são remontadas quando mudam (a "chave" muda)
  let poderKey = null, poderBtns = [];
  function renderPoderes(){
    const todos = PODERES.filter(p => !tem(p.id) && p.req()).sort((a,b)=>a.preco - b.preco);
    const disp = todos.slice(0, PODER_VISIVEIS);
    const key = disp.map(p=>p.id).join() + "|" + todos.length;
    if(key !== poderKey){
      poderKey = key;
      el.poderList.innerHTML = "";
      poderBtns = disp.map(p=>{
        const b = document.createElement("button");
        b.className = "up poder";
        b.innerHTML = `<span class="n">${icone(p.ic)}${p.name}</span><span class="c">${fmt(p.preco)}</span><span class="d">${p.desc}</span>`;
        b.addEventListener("click", ()=>comprarPoder(p));
        el.poderList.appendChild(b);
        return {b, p};
      });
      const resto = todos.length - disp.length;
      el.poderVazio.textContent = !todos.length ? "Compre melhorias para liberar poderes."
        : resto ? "+" + resto + (resto > 1 ? " poderes mais caros esperando" : " poder mais caro esperando") : "";
      el.poderVazio.style.display = el.poderVazio.textContent ? "" : "none";
    }
    poderBtns.forEach(({b, p}) => b.disabled = S.aura < p.preco);
  }

  let accKey = null;
  function renderAcessorios(){
    const key = ACESSORIOS.map(a => (own(a.req) > 0 ? 1 : 0) + (S.ocultos.includes(a.id) ? 2 : 0)).join();
    if(key === accKey) return;
    accKey = key;
    el.acess.innerHTML = "";
    ACESSORIOS.forEach(a=>{
      const livre = own(a.req) > 0, on = accOn(a.id);
      el.arena.classList.toggle("tem-" + a.id, on);
      el.preview.classList.toggle("tem-" + a.id, on);
      const u = UPGRADES.find(x => x.id === a.req);
      const b = document.createElement("button");
      b.className = "acc-item" + (on ? " on" : "");
      b.disabled = !livre;
      b.innerHTML = `<span>${icone(livre ? a.ic : "cadeado")}${a.nome}</span><small>${
        livre ? (on ? "usando · toque para tirar" : "guardado · toque para usar") : "compre " + u.name}</small>`;
      b.addEventListener("click", ()=>{
        const i = S.ocultos.indexOf(a.id);
        if(i < 0) S.ocultos.push(a.id); else S.ocultos.splice(i, 1);
        save(); renderAcessorios();
      });
      el.acess.appendChild(b);
    });
  }

  let orbKey = null;
  function renderOrbita(){
    // um ícone a cada ORBITA.cada unidades de cada melhoria
    let lista = [];
    UPGRADES.forEach(u=>{
      const n = Math.min(ORBITA.porMelhoria, Math.ceil(own(u.id)/ORBITA.cada));
      for(let i = 0; i < n; i++) lista.push(u.id);
    });
    lista = lista.slice(-ORBITA.max);
    const key = lista.join();
    if(key === orbKey) return;
    orbKey = key;
    el.orbita.innerHTML = lista.map((e, i) =>
      `<span style="transform:rotate(${i*360/lista.length}deg) translate(${ORBITA.raio}px)">${icone(e)}</span>`).join("");
  }

  /* ---------- Brilho: poça de aura e mascotes ---------- */
  const nivelPoca = () => Math.min(POCAS.length - 1, Math.floor(S.conquistas.length / CONQ_POR_POCA));
  const pocaAtual = () => POCAS[nivelPoca()];
  function renderBrilho(){
    const n = nivelPoca(), poca = POCAS[n], prox = POCAS[n+1], nc = S.conquistas.length;
    // a poça sobe com o Brilho e muda de cor a cada CONQ_POR_POCA conquistas
    el.poca.style.setProperty("--poca", poca.cor);
    el.poca.style.height = Math.min(POCA_ALTURA.max, POCA_ALTURA.base + brilho()*POCA_ALTURA.porNivel) + "px";
    el.poca.className = "poca " + (poca.classe || "");
    const falta = prox ? (n+1)*CONQ_POR_POCA - nc : 0;
    el.brilhoInfo.innerHTML = `<b>${icone("aura")}Brilho ${Math.round(brilho()*100)}%</b> · poça <b style="color:${poca.cor}">${poca.nome}</b>` +
      (prox ? `<small>Poça ${prox.nome} em ${falta} conquista${falta > 1 ? "s" : ""}</small>` : "<small>Poça máxima!</small>") +
      `<i style="width:${prox ? (nc % CONQ_POR_POCA)/CONQ_POR_POCA*100 : 100}%;background:${poca.cor}"></i>`;
  }
  let mascoteKey = null;
  function renderMascotes(){
    const lista = ativos("mascote").map(p => p.ic);
    const key = lista.join() + "|" + S.conquistas.length;   // o multiplicador muda com o Brilho
    if(key === mascoteKey) return;
    mascoteKey = key;
    // metade senta à esquerda do boneco e metade à direita
    const lado = par => lista.filter((_, i) => i % 2 === par).map((e, i) => `<span style="animation-delay:${i*.4}s">${icone(e)}</span>`).join("");
    el.mascotes.innerHTML = `<div>${lado(0)}</div><div>${lado(1)}</div>`;
    el.mascotesInfo.innerHTML = lista.length
      ? "Mascotes: " + lista.map(e => icone(e)).join("") + " · aura/s x" + multMascotes().toFixed(2).replace(".", ",")
      : "Compre Mascotes na loja: eles multiplicam sua aura/s pelo Brilho.";
  }

  /* ---------- render lento (a cada meio segundo e ao trocar de aba) ---------- */
  let conqKey = null;
  function renderLento(){
    checarConquistas();
    // alguma opção do editor foi liberada?
    if(EDITOR.map(g => g.opcoes.map(o => livre(o) ? 1 : 0).join("")).join() !== editorKey) montarEditor();
    const nc = S.conquistas.length;
    el.conqCount.textContent = nc;
    renderMascotes();
    if(conqKey !== nc){
      conqKey = nc;
      el.conqInfo.textContent = nc + " de " + CONQUISTAS.length + " · bônus de +" + Math.round(nc*CONQ_BONUS*100) + "% de aura";
      renderBrilho();
      el.conqList.innerHTML = "";
      CONQUISTAS.forEach(c=>{
        const feita = S.conquistas.includes(c.id);
        const b = document.createElement("button");
        b.className = "conq" + (feita ? " feita" : "");
        b.className += c.secreta ? " secreta" : "";
        b.innerHTML = icone(feita ? c.ic : c.secreta ? "secreta" : "cadeado");
        if(feita) b.dataset.tier = c.secreta ? "s" : (c.tier ?? 2);
        b.title = feita ? c.nome : "???";
        b.addEventListener("click", ()=>{
          el.conqDetalhe.innerHTML = (feita ? "<b>" + icone(c.ic) + c.nome + "</b>" : "<b>" + icone("cadeado") + "???</b>") + " · " +
            (feita || !c.secreta ? c.desc : "Conquista secreta");
        });
        el.conqList.appendChild(b);
      });
    }
    if(aba === "status"){
      const linhas = [
        ["Aura agora", fmt(S.aura)],
        ["Aura total farmada", fmt(S.total)],
        ["Aura por segundo", fmt(perSec())],
        ["Aura por clique", fmt(perClick())],
        ["Cliques", fmt(S.stats.cliques)],
        ["Aura vinda de cliques", fmt(S.stats.auraClique)],
        ["Giros da Aura", fmt(S.stats.giros)],
        ["Auras Douradas pegas", fmt(S.stats.douradas)],
        ["Maior combo", "x" + S.stats.maxMult],
        ["Melhorias compradas", fmt(UPGRADES.reduce((a,u)=>a+own(u.id), 0))],
        ["Poderes", S.poderes.length + " de " + PODERES.length],
        ["Conquistas", nc + " de " + CONQUISTAS.length],
        ["Brilho", Math.round(brilho()*100) + "% (poça " + pocaAtual().nome + ")"],
        ["Mascotes", ativos("mascote").length + " · aura/s x" + multMascotes().toFixed(2).replace(".", ",")],
        ["Tempo jogado", Math.floor(S.stats.tempo/3600) + " h " + Math.floor(S.stats.tempo%3600/60) + " min"],
        ["Contando desde", new Date(S.stats.inicio).toLocaleDateString("pt-BR")]
      ];
      el.stats.innerHTML = linhas.map(([k,v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
    }
  }

  /* ---------- loop ---------- */
  let last = performance.now(), saveT = 0, lentoT = 0;
  function tick(now){
    const dt = Math.min(0.25, (now-last)/1000); last = now;
    const agora = Date.now();
    buffs = buffs.filter(b => b.fim > agora);

    const gain = perSec()*dt;
    if(gain) ganhar(gain);

    // combo cai com o tempo
    combo = Math.max(0, Math.min(comboMax(), combo - dt*4));

    // liberou um movimento novo?
    const n = nivelAtual();
    if(n > S.nivel){
      S.nivel = n;
      popup("Novo movimento: " + NIVEIS[n].nome, 40, 60, "grande");
      save();
    }

    // Aura Dourada: aparece, pisca no fim e some
    if(!dourada && agora >= proxDourada) mostrarDourada();
    else if(dourada){
      dourada.classList.toggle("sumindo", dourada.fim - agora < 3000);
      if(agora > dourada.fim){ S.stats.douradasPerdidas++; sumirDourada(); }
    }

    // efeitos dos acessórios
    if(accOn("notas") && Math.random() < dt*.7)
      popup(Math.random() < .5 ? "♪" : "♫", 30 + Math.random()*200, 80 + Math.random()*120, "nota");
    if(accOn("flash") && Math.random() < dt*.12) animar(el.arena, "flash");

    // recarga do giro
    const left = Math.max(0, S.spinReadyAt - agora);
    el.spinBtn.disabled = left > 0;
    el.cd.style.width = (left/spinCD()*100) + "%";

    desenharCeu(dt, now);
    S.stats.tempo += dt;
    saveT += dt; if(saveT > 5){ saveT = 0; save(); }
    lentoT += dt; if(lentoT > .5){ lentoT = 0; renderLento(); }
    render();
    requestAnimationFrame(tick);
  }

  /* ---------- início ---------- */
  load();
  // dias diferentes em que jogou (data local, AAAA-MM-DD)
  const hoje = new Date().toLocaleDateString("sv");
  if(!S.stats.dias.includes(hoje)) S.stats.dias.push(hoje);
  el.titulo.addEventListener("click", ()=>{ S.stats.cliquesTitulo++; });
  montarBoneco();
  montarEditor();
  el.nome.value = S.visual.nome;
  agendarDourada();
  // ganho enquanto estava fora (até OFFLINE_MAX, a OFFLINE_PCT)
  const away = Math.min(OFFLINE_MAX, (Date.now() - (S.saved||Date.now()))/1000);
  if(away > 30 && perSec() > 0){
    const g = perSec()*away*OFFLINE_PCT;
    ganhar(g);
    toast("lua", "Enquanto você estava fora", "+" + fmt(g) + " de aura");
  }
  render();
  renderLento();
  requestAnimationFrame(tick);
  window.addEventListener("beforeunload", save);
})();
