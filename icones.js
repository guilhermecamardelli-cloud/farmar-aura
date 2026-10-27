/* ---------- ícones do jogo ----------
   Desenhados em SVG (quadro 32x32) no mesmo traço do boneco: contorno escuro e cores chapadas.
   Uso: icone("braco") devolve o <svg> pronto para colocar no HTML. */
const ICONES = (function(){
  const T = "#1b1b1b";
  const OURO = "#ffd54f", OURO2 = "#f0b400", AURA = "#b388ff", AURA2 = "#7b55f0", PELE = "#f8c294";
  // contorno grosso escuro e, por cima, a cor (para linhas e anéis)
  const linha = (d, cor, w = 2.5) => `<path d="${d}" stroke-width="${w + 2.5}"/><path d="${d}" stroke="${cor}" stroke-width="${w}"/>`;
  const brilho = (x, y, r = 1.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="none" opacity=".85"/>`;
  const faisca = (x, y, s = 1, cor = "#fff") =>
    `<path d="M${x} ${y-5*s} L${x+1.3*s} ${y-1.3*s} L${x+5*s} ${y} L${x+1.3*s} ${y+1.3*s} L${x} ${y+5*s} L${x-1.3*s} ${y+1.3*s} L${x-5*s} ${y} L${x-1.3*s} ${y-1.3*s} Z" fill="${cor}" stroke="none"/>`;

  return {
    /* ----- aura e recursos ----- */
    aura: `<circle cx="16" cy="16" r="12" fill="${AURA}"/><circle cx="16" cy="16" r="7" fill="#d9c4ff" stroke="none"/>${faisca(16,16,1.3)}`,
    dourada: `<circle cx="16" cy="16" r="12" fill="${OURO}"/><circle cx="16" cy="16" r="7" fill="#fff3b0" stroke="none"/>${faisca(16,16,1.3)}`,
    raio: `<path d="M18 3 L7 18 H15 L13 29 L25 13 H17 Z" fill="${OURO}"/>${brilho(15,10,1.2)}`,
    estrela: `<path d="M16 3.5 L19.6 11.6 L28.4 12.5 L21.8 18.4 L23.7 27.1 L16 22.6 L8.3 27.1 L10.2 18.4 L3.6 12.5 L12.4 11.6 Z" fill="${OURO}"/>${brilho(13,13,1.4)}`,
    clique: `<path d="M9 4 V25 L14 20.5 L18 28.5 L22.5 26.5 L18.5 18.5 L25 18.5 Z" fill="#fff"/>`,
    mao: `<path d="M10 18 V9 a2 2 0 0 1 4 0 V15 V6 a2 2 0 0 1 4 0 V15 V7 a2 2 0 0 1 4 0 V16 V10 a2 2 0 0 1 4 0 V20 c0 5 -4 9 -9 9 h-1 c-3 0 -5 -1.5 -6.5 -4 L5 20 a2 2 0 0 1 3.4 -2 L10 20 Z" fill="${PELE}"/>${faisca(6,7,.8,OURO)}`,
    // espiral feita de meias-voltas que crescem 2,4 a cada volta
    giro: linha("M16.4 16 A2.4 2.4 0 0 0 11.6 16 A4.8 4.8 0 0 0 21.2 16 A7.2 7.2 0 0 0 6.8 16 A9.6 9.6 0 0 0 26 16", AURA, 2) +
      `<path d="M26 16 L28.5 11.5 M26 16 L22 13" stroke-width="2.5"/>`,
    fogo: `<path d="M16 3 C18 9 25 11 25 19 a9 9 0 0 1 -18 0 c0 -4 2 -6 4 -8 c0 3 1 5 3 5 c-1 -5 0 -9 4 -13 Z" fill="#ff7a1a"/>
      <path d="M16 15 c2 3 5 4 5 8 a5 5 0 0 1 -10 0 c0 -3 3 -4 5 -8 Z" fill="${OURO}" stroke="none"/>`,
    trevo: `<g stroke-width="5"><circle cx="11.5" cy="11.5" r="5"/><circle cx="20.5" cy="11.5" r="5"/><circle cx="11.5" cy="20.5" r="5"/><circle cx="20.5" cy="20.5" r="5"/></g>
      ${linha("M18 20 Q21 25 26 28", "#2f9e5a", 2)}
      <g fill="#34c26e" stroke="none"><circle cx="11.5" cy="11.5" r="5"/><circle cx="20.5" cy="11.5" r="5"/><circle cx="11.5" cy="20.5" r="5"/><circle cx="20.5" cy="20.5" r="5"/></g>
      <path d="M16 9 V23 M9 16 H23" stroke="#2f9e5a" stroke-width="1.5"/>${brilho(10,10,1.2)}`,
    ampulheta: `<path d="M10 5 C10 12 15 14 15 16 C15 18 10 20 10 27 H22 C22 20 17 18 17 16 C17 14 22 12 22 5 Z" fill="#e8f4ff"/>
      <path d="M12.5 8 H19.5 C18.5 11 17 12 16 14 C15 12 13.5 11 12.5 8 Z M11.5 26 C12.5 22 15 21 16 20 C17 21 19.5 22 20.5 26 Z" fill="${OURO}" stroke="none"/>
      <path d="M8 4.5 H24 M8 27.5 H24" stroke-width="3"/>`,
    relogio: `<circle cx="16" cy="17" r="11" fill="#fff"/><path d="M16 11 V17 L20 19.5" stroke-width="2.5"/>
      <path d="M13 3.5 H19 M16 3.5 V6" stroke-width="2.5"/><circle cx="16" cy="17" r="1.5" fill="${T}"/>`,
    calendario: `<rect x="4" y="6" width="24" height="22" rx="3" fill="#fff"/>
      <path d="M4 9 a3 3 0 0 1 3 -3 H25 a3 3 0 0 1 3 3 V12 H4 Z" fill="#e5484d"/>
      <g stroke="none" fill="#c4c4d4"><rect x="7.5" y="15" width="4" height="4" rx="1"/><rect x="14" y="15" width="4" height="4" rx="1"/><rect x="20.5" y="15" width="4" height="4" rx="1"/><rect x="7.5" y="21" width="4" height="4" rx="1"/><rect x="14" y="21" width="4" height="4" rx="1"/></g>
      <rect x="20.5" y="21" width="4" height="4" rx="1" fill="${AURA}" stroke-width="1.2"/>
      <path d="M10 3 V8 M22 3 V8" stroke-width="2.5"/>`,

    /* ----- melhorias ----- */
    braco: `<path d="M4 27 C4 21 7 18 11 18 H15 C14 15 13 12 13 9 C13 6 15 4 18 4 C21 4 22.5 6 22 8.5 L21 12 C24.5 12 27.5 15 27.5 19.5 C27.5 24.5 22 27 16 27 Z" fill="${PELE}"/>
      <path d="M15 18 C17 16 20 16 22.5 18.5" stroke-width="1.8"/><path d="M16.5 7 C18 6.3 19.8 6.8 20.5 8" stroke-width="1.6"/>${faisca(27,6,.7,OURO)}`,
    pose: `<circle cx="16" cy="16" r="12" fill="${OURO}"/>
      <path d="M8.5 11 Q11 9 14 10.5 M18 11.5 L23.5 10.5" stroke-width="2"/>
      <path d="M8.5 14.5 H14 M18 14.5 H23.5" stroke-width="2.6"/>
      <circle cx="12" cy="16.3" r="1.5" fill="${T}" stroke="none"/><circle cx="21" cy="16.3" r="1.5" fill="${T}" stroke="none"/>
      <path d="M11.5 21.5 Q16 23.5 20.5 19.5" stroke-width="2"/>`,
    oculos: `<path d="M3 12 H29" stroke-width="2.5"/>
      <path d="M4 12 H14 V16 a4 4 0 0 1 -4 4 H8 a4 4 0 0 1 -4 -4 Z M18 12 H28 V16 a4 4 0 0 1 -4 4 H22 a4 4 0 0 1 -4 -4 Z" fill="#4a4a78"/>
      <path d="M6 17 L10 13 M20 17 L24 13" stroke="#fff" stroke-width="1.8" opacity=".7"/>
      <path d="M3 12 H29" stroke="${OURO}" stroke-width="1.2"/>`,
    punho: `<path d="M10 23 V28.5 H22 V23" fill="${OURO2}"/>
      <rect x="7" y="8" width="18" height="16" rx="4" fill="${OURO}"/>
      <path d="M11.5 8.5 V14 M16 8.5 V14 M20.5 8.5 V14" stroke-width="1.6"/>
      <path d="M7 16.5 H15 a3 3 0 0 1 0 6 H8.5" fill="${OURO}"/>${brilho(10.5,11,1.2)}`,
    trilha: `<path d="M12 23 V8 L25 5 V20" stroke-width="2.5"/>
      <path d="M12 8 L25 5 V9.5 L12 12.5 Z" fill="${AURA}"/>
      <ellipse cx="8.5" cy="23" rx="4" ry="3.2" fill="${AURA}"/><ellipse cx="21.5" cy="20" rx="4" ry="3.2" fill="${AURA}"/>`,
    corrente: [[9,22],[16,16],[23,10]].map(([x,y]) =>
      `<ellipse cx="${x}" cy="${y}" rx="6" ry="3.6" transform="rotate(-40 ${x} ${y})" stroke-width="5.5"/>`).join("")
      + [[9,22],[16,16],[23,10]].map(([x,y]) =>
      `<ellipse cx="${x}" cy="${y}" rx="6" ry="3.6" transform="rotate(-40 ${x} ${y})" stroke="${OURO}" stroke-width="2.6"/>`).join(""),
    lenda: `<path d="M5 25 L4 10 L10.5 15 L16 6 L21.5 15 L28 10 L27 25 Z" fill="${OURO}"/>
      <path d="M5 21 H27"/><circle cx="16" cy="6" r="2.2" fill="#ff5c8a"/>
      <circle cx="4" cy="10" r="1.8" fill="#69f0ae"/><circle cx="28" cy="10" r="1.8" fill="#69f0ae"/>
      <circle cx="16" cy="23" r="1.6" fill="#e5484d" stroke-width="1.2"/>`,
    ensaio: `<path d="M10 10 L12 6 H20 L22 10" fill="#2a2a3a"/>
      <rect x="3" y="10" width="26" height="17" rx="3" fill="#2a2a3a"/>
      <circle cx="16" cy="18.5" r="6" fill="#9ca3af"/><circle cx="16" cy="18.5" r="3" fill="#4f8cff" stroke-width="1.5"/>
      <rect x="22.5" y="12.5" width="4" height="3" rx="1" fill="${OURO}" stroke-width="1.3"/>${brilho(14.8,17.3,1)}`,
    academia: `<rect x="9" y="14.5" width="14" height="3" fill="#9ca3af"/>
      <rect x="1.5" y="12" width="3.5" height="8" rx="1" fill="#e5484d"/><rect x="27" y="12" width="3.5" height="8" rx="1" fill="#e5484d"/>
      <rect x="4.5" y="8.5" width="5" height="15" rx="1.5" fill="#e5484d"/><rect x="22.5" y="8.5" width="5" height="15" rx="1.5" fill="#e5484d"/>
      ${brilho(6.3,11.5,.9)}${brilho(24.3,11.5,.9)}`,
    portal: `<ellipse cx="16" cy="16" rx="11" ry="13.5" fill="#2a1a5e"/>
      <ellipse cx="16" cy="16" rx="7.5" ry="9.5" fill="#5b3fd6" stroke="none"/>
      <ellipse cx="16" cy="16" rx="4" ry="5.5" fill="${AURA}" stroke="none"/>
      <path d="M16 6.5 C22 9 22 21 16 23.5" stroke="#d9c4ff" stroke-width="1.5"/>${faisca(16,16,.8)}`,
    galaxia: `<ellipse cx="16" cy="17" rx="14" ry="5" transform="rotate(-20 16 17)" stroke-width="4.5"/>
      <ellipse cx="16" cy="17" rx="14" ry="5" transform="rotate(-20 16 17)" stroke="${OURO}" stroke-width="2"/>
      <circle cx="16" cy="16" r="8" fill="#f59e0b"/><path d="M9 13.5 Q16 11.5 23 13.5 M8.5 18 Q16 16 23.5 18" stroke="#c76a00" stroke-width="1.5"/>
      ${linha("M2.84 21.79 A14 5 -20 0 0 29.16 12.21", OURO, 2)}${brilho(13,12,1.3)}`,
    infinita: linha("M16 16 C13 11 5.5 10 5.5 16 C5.5 22 13 21 16 16 C19 11 26.5 10 26.5 16 C26.5 22 19 21 16 16 Z", AURA, 3.2),

    /* ----- mascotes ----- */
    gato: `<path d="M6 13 L7 3.5 L13.5 9 Z M26 13 L25 3.5 L18.5 9 Z" fill="#f59e0b"/>
      <ellipse cx="16" cy="18" rx="12" ry="10" fill="#f59e0b"/>
      <path d="M8.3 6.5 L9 11 L11.3 9.5 Z M23.7 6.5 L23 11 L20.7 9.5 Z" fill="#ffb3c1" stroke="none"/>
      <path d="M16 9 V12 M13 9.5 L13.5 11.5 M19 9.5 L18.5 11.5" stroke="#c76a00" stroke-width="1.5"/>
      <ellipse cx="11.5" cy="17" rx="1.8" ry="2.6" fill="${T}" stroke="none"/><ellipse cx="20.5" cy="17" rx="1.8" ry="2.6" fill="${T}" stroke="none"/>
      <path d="M14.5 20.5 H17.5 L16 22 Z" fill="#ff8fa3" stroke-width="1"/>
      <path d="M16 22 Q14.5 24 13 23 M16 22 Q17.5 24 19 23" stroke-width="1.4"/>
      <path d="M2.5 18.5 L9 20 M2.5 22 L9 21.5 M29.5 18.5 L23 20 M29.5 22 L23 21.5" stroke-width="1.1"/>`,
    cao: `<ellipse cx="16" cy="17" rx="10" ry="10.5" fill="#c08552"/>
      <path d="M7 8.5 C3 9.5 2 17 4 22 C6 23 8.5 21 8.5 18 Z M25 8.5 C29 9.5 30 17 28 22 C26 23 23.5 21 23.5 18 Z" fill="#7a4a2a"/>
      <ellipse cx="16" cy="21.5" rx="5.5" ry="4.5" fill="#f3e2c7"/>
      <ellipse cx="16" cy="19.3" rx="2.2" ry="1.6" fill="${T}"/>
      <circle cx="12" cy="15" r="1.7" fill="${T}" stroke="none"/><circle cx="20" cy="15" r="1.7" fill="${T}" stroke="none"/>
      <path d="M16 21 V22.5 M14 23 Q16 24.5 18 23" stroke-width="1.4"/>
      <path d="M15 23.8 Q16 27 17 23.8" fill="#ff8fa3" stroke-width="1.1"/>`,
    raposa: `<path d="M5 3.5 L8 15 L13.5 10 Z M27 3.5 L24 15 L18.5 10 Z" fill="#f97316"/>
      <path d="M7 6.5 L8.5 12 L11 10 Z M25 6.5 L23.5 12 L21 10 Z" fill="#7a2e0e" stroke="none"/>
      <path d="M4 14 C4 10 9 8 16 8 C23 8 28 10 28 14 C28 19 21 27 16 28.5 C11 27 4 19 4 14 Z" fill="#f97316"/>
      <path d="M5.2 16 C9 15.5 13 18.5 16 21.5 C19 18.5 23 15.5 26.8 16 C25.5 20.5 20 26 16 27.5 C12 26 6.5 20.5 5.2 16 Z" fill="#fff" stroke="none"/>
      <path d="M9.5 15 L13 16.3 M22.5 15 L19 16.3" stroke-width="2.2"/>
      <circle cx="16" cy="26" r="1.8" fill="${T}"/>`,
    coruja: `<path d="M5 7.5 L9.5 11 C11.5 9 20.5 9 22.5 11 L27 7.5 L26 16 C26 23 21 28.5 16 28.5 C11 28.5 6 23 6 16 Z" fill="#8d5a3b"/>
      <circle cx="11.5" cy="16" r="5" fill="#fff"/><circle cx="20.5" cy="16" r="5" fill="#fff"/>
      <circle cx="11.5" cy="16" r="2.5" fill="${T}" stroke="none"/><circle cx="20.5" cy="16" r="2.5" fill="${T}" stroke="none"/>
      ${brilho(12.4,15,.8)}${brilho(21.4,15,.8)}
      <path d="M14.5 20 H17.5 L16 23.5 Z" fill="${OURO}" stroke-width="1.4"/>
      <path d="M11.5 26 Q12.5 25 13.5 26 M15 27 Q16 26 17 27 M18.5 26 Q19.5 25 20.5 26" stroke-width="1.1"/>`,
    dragao: `<path d="M8.5 10 L4 2 L12.5 7 Z M23.5 10 L28 2 L19.5 7 Z" fill="#f3e2c7"/>
      <path d="M13 5.5 L16 1.5 L19 5.5" fill="#10b981"/>
      <path d="M6 12 C6 7 11 5 16 5 C21 5 26 7 26 12 L27 20 C27 25 22 28.5 16 28.5 C10 28.5 5 25 5 20 Z" fill="#34d399"/>
      <ellipse cx="16" cy="22.5" rx="8" ry="5" fill="#6ee7b7"/>
      <ellipse cx="13" cy="22" rx="1" ry="1.6" fill="${T}" stroke="none"/><ellipse cx="19" cy="22" rx="1" ry="1.6" fill="${T}" stroke="none"/>
      <path d="M8.5 13 L13.5 14.5 L9.5 17 Z M23.5 13 L18.5 14.5 L22.5 17 Z" fill="${OURO}" stroke-width="1.4"/>
      <path d="M11 14.3 V16 M21 14.3 V16" stroke-width="1.2"/>`,
    unicornio: `<path d="M9 10.5 L8 3 L13.5 7 Z M23 10.5 L24 3 L18.5 7 Z" fill="#fff"/>
      <path d="M7 14 C7 8 11 6 16 6 C21 6 25 8 25 14 C25 19 23 22 23 24 C23 27 20 29 16 29 C12 29 9 27 9 24 C9 22 7 19 7 14 Z" fill="#fff"/>
      <path d="M10.5 7.5 C11.5 12 15 12.5 16 9.5 C17 12.5 20.5 12 21.5 7.5 C19 6 13 6 10.5 7.5 Z" fill="#ff6fb5"/>
      <path d="M13.5 8 L16 0.8 L18.5 8 Z" fill="${OURO}"/><path d="M14.4 5.5 L17.5 4.6 M14.1 7 L18 6" stroke-width="1"/>
      <ellipse cx="16" cy="24" rx="6" ry="4" fill="#ffd6e7"/>
      <circle cx="14" cy="24" r=".9" fill="${T}" stroke="none"/><circle cx="18" cy="24" r=".9" fill="${T}" stroke="none"/>
      <path d="M10.5 16 Q12.5 18 14.5 16 M17.5 16 Q19.5 18 21.5 16" stroke-width="1.6"/>`,
    pata: `<g stroke-width="5"><ellipse cx="16" cy="21" rx="6.5" ry="5.5"/><circle cx="7.5" cy="13.5" r="3"/><circle cx="12.5" cy="8" r="3"/><circle cx="19.5" cy="8" r="3"/><circle cx="24.5" cy="13.5" r="3"/></g>
      <g fill="#8d5a3b" stroke="none"><ellipse cx="16" cy="21" rx="6.5" ry="5.5"/><circle cx="7.5" cy="13.5" r="3"/><circle cx="12.5" cy="8" r="3"/><circle cx="19.5" cy="8" r="3"/><circle cx="24.5" cy="13.5" r="3"/></g>`,

    /* ----- acessórios ----- */
    pulseira: linha("M5 16 a11 6 0 1 0 22 0 a11 6 0 1 0 -22 0", OURO, 3) +
      `<circle cx="16" cy="22" r="2.4" fill="#4f8cff" stroke-width="1.5"/><circle cx="8" cy="20" r="1.6" fill="#e5484d" stroke-width="1.2"/><circle cx="24" cy="20" r="1.6" fill="#e5484d" stroke-width="1.2"/>`,
    arcoiris: `<path d="M3.5 25 A12.5 12.5 0 0 1 28.5 25" stroke-width="11"/>
      <path d="M5 25 A11 11 0 0 1 27 25" stroke="#e5484d" stroke-width="2.6"/>
      <path d="M7.6 25 A8.4 8.4 0 0 1 24.4 25" stroke="${OURO}" stroke-width="2.6"/>
      <path d="M10.2 25 A5.8 5.8 0 0 1 21.8 25" stroke="#34d399" stroke-width="2.6"/>
      <circle cx="5.5" cy="25.5" r="3.5" fill="#fff"/><circle cx="26.5" cy="25.5" r="3.5" fill="#fff"/>`,

    /* ----- conquistas ----- */
    trofeu: `<path d="M9 8 H5 C5 13 7 15.5 10.5 15.5 M23 8 H27 C27 13 25 15.5 21.5 15.5" stroke-width="2.3"/>
      <path d="M14 18.5 H18 V23 H14 Z" fill="${OURO2}"/>
      <path d="M9 5 H23 V12 a7 7 0 0 1 -14 0 Z" fill="${OURO}"/>
      <rect x="10" y="23" width="12" height="5" rx="1" fill="#8d5a3b"/>${brilho(12.5,8.5,1.2)}`,
    medalha: `<path d="M9 3 H14 L18 13 H13 Z" fill="#e5484d"/><path d="M23 3 H18 L14 13 H19 Z" fill="#2b7de9"/>
      <circle cx="16" cy="20" r="8" fill="${OURO}"/>
      <path d="M16 15.5 L17.3 18.4 L20.3 18.7 L18 20.7 L18.7 23.7 L16 22.1 L13.3 23.7 L14 20.7 L11.7 18.7 L14.7 18.4 Z" fill="#fff3b0" stroke-width="1.2"/>`,
    caixa: `<path d="M4 11 L16 6 L28 11 L16 16 Z" fill="#e0a370"/><path d="M4 11 V23 L16 28 V16 Z" fill="#c07f50"/>
      <path d="M28 11 V23 L16 28 V16 Z" fill="#a8693d"/><path d="M10 8.5 L22 13.5" stroke="#f3e2c7" stroke-width="2"/>`,
    diamante: `<path d="M9 5 H23 L29 12 L16 28 L3 12 Z" fill="#7fd8ff"/>
      <path d="M3 12 H29 M9 5 L12.5 12 L16 28 L19.5 12 L23 5 M12.5 12 L16 5 L19.5 12" stroke-width="1.4"/>${brilho(9,10,1.2)}`,
    paleta: `<path d="M16 4 C8 4 3 10 3 16 C3 23 8 28 14 28 C17 28 17.5 25 16 23 C15 21 16.5 19 19 19 H23 C27 19 29 17 29 14 C29 8 23 4 16 4 Z" fill="#f3e2c7"/>
      <circle cx="10" cy="11" r="2.4" fill="#e5484d" stroke-width="1.4"/><circle cx="16.5" cy="8.5" r="2.4" fill="${OURO}" stroke-width="1.4"/>
      <circle cx="22.5" cy="11.5" r="2.4" fill="#34d399" stroke-width="1.4"/><circle cx="8.5" cy="18" r="2.4" fill="#4f8cff" stroke-width="1.4"/>`,
    camiseta: `<path d="M11 4 L4.5 7.5 L2.5 13.5 L8 14.5 V28 H24 V14.5 L29.5 13.5 L27.5 7.5 L21 4 C20 7 18 8 16 8 C14 8 12 7 11 4 Z" fill="${AURA}"/>
      <path d="M8 19 H24" stroke="#fff" stroke-width="3" opacity=".5"/>`,
    etiqueta: `<rect x="3" y="8" width="26" height="17" rx="3" fill="#fff"/>
      <path d="M3 11 a3 3 0 0 1 3 -3 H26 a3 3 0 0 1 3 3 V14 H3 Z" fill="#e5484d"/>
      <path d="M8 19.5 H24" stroke="#9ca3af" stroke-width="2"/>`,
    cartola: `<ellipse cx="16" cy="23" rx="13" ry="4" fill="#2a2a3a"/>
      <path d="M9.5 23 V6 H22.5 V23" fill="#2a2a3a"/>
      <rect x="9.5" y="16" width="13" height="4" fill="${AURA}" stroke="none"/>
      <path d="M12.5 8.5 V14" stroke="#fff" stroke-width="1.8" opacity=".25"/>`,
    cofre: `<path d="M8 26 V29 M24 26 V29" stroke-width="3"/>
      <rect x="4" y="4.5" width="24" height="22" rx="3" fill="#9ca3af"/>
      <circle cx="16" cy="15.5" r="6.5" fill="#d1d5db"/><path d="M16 11.5 V15.5 L19 17.5" stroke-width="2"/>
      <path d="M25 11 V20" stroke-width="2.5"/>`,
    lua: `<path d="M19 4 A12 12 0 1 0 28 22 A10 10 0 1 1 19 4 Z" fill="${OURO}"/>${faisca(25,8,.6)}${faisca(28,15,.4)}`,
    espelho: `${linha("M16 22 V29", "#8d5a3b", 3)}
      <ellipse cx="16" cy="12.5" rx="9" ry="10" fill="#c79a5a"/>
      <ellipse cx="16" cy="12.5" rx="6.3" ry="7.3" fill="#cfeeff"/>
      <path d="M12.5 9 L15 6.8 M12.5 13 L18 8" stroke="#fff" stroke-width="1.6"/>`,
    fantasma: `<path d="M7 28 V14 a9 9 0 0 1 18 0 V28 L22 25.5 L19 28 L16 25.5 L13 28 L10 25.5 Z" fill="#f1f5f9"/>
      <ellipse cx="12.5" cy="14.5" rx="1.8" ry="2.6" fill="${T}" stroke="none"/><ellipse cx="19.5" cy="14.5" rx="1.8" ry="2.6" fill="${T}" stroke="none"/>
      <ellipse cx="16" cy="20" rx="2" ry="1.4" fill="${T}" stroke="none"/>`,
    setas: linha("M25.5 13 A10 10 0 0 0 7.5 10", AURA, 2.6) + linha("M6.5 19 A10 10 0 0 0 24.5 22", AURA, 2.6) +
      `<path d="M4 5.5 L11 7.5 L5.5 12.5 Z" fill="${AURA}" stroke-width="1.8"/><path d="M28 26.5 L21 24.5 L26.5 19.5 Z" fill="${AURA}" stroke-width="1.8"/>`,
    lotus: `<path d="M16 25 C10 24 4.5 19 4.5 13.5 C10 13.5 14 17.5 16 25 Z M16 25 C22 24 27.5 19 27.5 13.5 C22 13.5 18 17.5 16 25 Z" fill="#f9a8d4"/>
      <path d="M16 5 C20.5 10 20.5 18 16 25 C11.5 18 11.5 10 16 5 Z" fill="#fbcfe8"/>
      <path d="M5 27.5 H27" stroke-width="2.5"/>`,

    /* ----- interface ----- */
    loja: `<path d="M11 11 V8 a5 5 0 0 1 10 0 V11" stroke-width="2.5"/>
      <path d="M5.5 11 H26.5 L24.5 28 H7.5 Z" fill="${AURA}"/>${faisca(16,19.5,.9)}`,
    grafico: `<path d="M4 28 H28" stroke-width="2.5"/>
      <rect x="6" y="17" width="5" height="11" rx="1" fill="${AURA}"/><rect x="13.5" y="11" width="5" height="17" rx="1" fill="${OURO}"/>
      <rect x="21" y="5" width="5" height="23" rx="1" fill="#34d399"/>`,
    cadeado: `${linha("M10.5 14 V10 a5.5 5.5 0 0 1 11 0 V14", "#9ca3af", 2.6)}
      <rect x="7" y="14" width="18" height="14" rx="3" fill="${OURO}"/>
      <circle cx="16" cy="20" r="2" fill="${T}" stroke="none"/><path d="M16 21 V24" stroke-width="2.4"/>`,
    secreta: `<circle cx="16" cy="16" r="12" fill="${AURA2}"/>
      <path d="M12 12.5 a4 4 0 1 1 6 3.5 c-1.5 1 -2 2 -2 3.5" stroke="#fff" stroke-width="3"/>
      <circle cx="16" cy="23.5" r="1.9" fill="#fff" stroke="none"/>`,
    dado: `<rect x="5" y="5" width="22" height="22" rx="5" fill="#fff"/>
      <g fill="${T}" stroke="none"><circle cx="11" cy="11" r="2"/><circle cx="21" cy="11" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="11" cy="21" r="2"/><circle cx="21" cy="21" r="2"/></g>`,
    nenhum: `<circle cx="16" cy="16" r="11" fill="#fff"/><path d="M8.5 23.5 L23.5 8.5" stroke="#e5484d" stroke-width="3"/>`,
    exportar: `<path d="M5 18.5 V26.5 H27 V18.5" stroke-width="2.6"/>${linha("M16 21 V6 M10 11.5 L16 5.5 L22 11.5", AURA, 2.6)}`,
    importar: `<path d="M5 18.5 V26.5 H27 V18.5" stroke-width="2.6"/>${linha("M16 4.5 V19.5 M10 14 L16 20 L22 14", AURA, 2.6)}`,
    alerta: `<path d="M16 4 L29 27 H3 Z" fill="${OURO}"/><path d="M16 12 V19" stroke-width="3"/><circle cx="16" cy="23" r="1.7" fill="${T}" stroke="none"/>`
  };
})();

// devolve o <svg> do ícone (classe extra opcional para tamanho/efeitos)
function icone(id, classe){
  return `<svg class="ic${classe ? " " + classe : ""}" viewBox="0 0 32 32" aria-hidden="true"><g fill="none" stroke="#1b1b1b" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${ICONES[id] || ICONES.aura}</g></svg>`;
}
