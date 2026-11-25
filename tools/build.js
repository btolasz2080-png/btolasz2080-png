// Generates the animated SVGs for the GitHub profile README.
const fs = require('fs');
const OUT = require('path').join(__dirname, '../assets/');
const cfg = JSON.parse(fs.readFileSync(require('path').join(__dirname, 'profile.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(require('path').join(__dirname, 'grid.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

const FONT_SERIF = "'Cormorant Garamond','Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif";
const FONT_MONO = "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";
const FONT_SANS = "'Inter','Segoe UI',-apple-system,Helvetica,Arial,sans-serif";

// ───────────────────────── header (binary queen)
function header() {
  const W = 1200, H = 480, CW = 7.2, CH = 9.6, ox = 612, oy = 24;
  const colors = { q0: '#5E400F', q1: '#7C5A1A', q2: '#9C7630', q3: '#C9A458', q4: '#E6CF92', q5: '#FFF2CC', b0: '#3B5568', b1: '#56748C', b2: '#7393AC', b3: '#A9C3D7', w0: '#4A0E16', w1: '#6A1A26', w2: '#8C2836', w3: '#AE3D4C' };
  const layer = (name) => grid.rows.map((row, r) => {
    let out = '', k = 0;
    while (k < grid.COLS) {
      const cls = row.slice(k * 2, k * 2 + 2);
      if (cls === '..') { k++; continue; }
      let s = '', start = k;
      while (k < grid.COLS && row.slice(k * 2, k * 2 + 2) === cls) { s += rnd() < 0.5 ? '0' : '1'; k++; }
      out += `<text x="${(ox + start * CW).toFixed(1)}" y="${(oy + (r + 1) * CH).toFixed(1)}" class="${cls}">${s}</text>`;
    }
    return `<g class="row" style="animation-delay:${(r * 0.035).toFixed(2)}s">${out}</g>`;
  }).join('');
  const css = Object.entries(colors).map(([k, v]) => `.${k}{fill:${v}}`).join('');
  const [l1, accent, l3] = cfg.headline;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(cfg.name)} — ${esc(cfg.eyebrow)}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A0905"/><stop offset="1" stop-color="#2A120B"/></linearGradient>
  <radialGradient id="halo" cx="0.74" cy="0.5" r="0.45"><stop offset="0" stop-color="#C9A45E" stop-opacity=".16"/><stop offset="1" stop-color="#C9A45E" stop-opacity="0"/></radialGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="#A27A33"/><stop offset=".35" stop-color="#F4E3B0"/><stop offset=".6" stop-color="#C9A458"/><stop offset="1" stop-color="#9C7630"/>
    <animate attributeName="x1" values="-1;0;-1" dur="8s" repeatCount="indefinite"/><animate attributeName="x2" values="0;1;0" dur="8s" repeatCount="indefinite"/></linearGradient>
  <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF2CC" stop-opacity="0"/><stop offset=".5" stop-color="#FFF2CC" stop-opacity=".18"/><stop offset="1" stop-color="#FFF2CC" stop-opacity="0"/></linearGradient>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath>
</defs>
<style>
  text{font-family:${FONT_MONO};font-size:11px;font-weight:500}
  ${css}
  .row{opacity:0;animation:in .9s cubic-bezier(.22,1,.36,1) forwards}
  @keyframes in{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}
  .a{animation:flipA 3.2s steps(1) infinite}.b{animation:flipB 3.2s steps(1) infinite}
  .a2{animation-delay:-1.1s}.b2{animation-delay:-1.1s}
  @keyframes flipA{0%,100%{opacity:1}50%{opacity:0}}@keyframes flipB{0%,100%{opacity:0}50%{opacity:1}}
  .scan{animation:scan 5s linear infinite}@keyframes scan{from{transform:translateY(-120px)}to{transform:translateY(${H + 40}px)}}
  .serif{font-family:${FONT_SERIF};font-weight:500}.mono{font-family:${FONT_MONO}}.sans{font-family:${FONT_SANS}}
  .fade{opacity:0;animation:in 1.2s cubic-bezier(.22,1,.36,1) forwards}
</style>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>
  <g class="a">${layer('a')}</g>
  <g class="b">${layer('b')}</g>
  <rect class="scan" x="${ox - 10}" y="0" width="${grid.COLS * CW + 20}" height="90" fill="url(#scan)"/>
  <g transform="translate(64 0)">
    <line x1="0" y1="104" x2="34" y2="104" stroke="#94B1C8" stroke-opacity=".7"/>
    <text x="46" y="108" class="mono fade" fill="#94B1C8" style="font-size:12.5px;letter-spacing:3px;animation-delay:.2s">${esc(cfg.eyebrow.toUpperCase())}</text>
    <text x="-3" y="196" class="serif fade" fill="url(#gold)" style="font-size:78px;animation-delay:.35s">${esc(cfg.name)}</text>
    <text x="0" y="262" class="serif fade" style="font-size:38px;animation-delay:.55s"><tspan fill="#E2C98A">${esc(l1)} </tspan><tspan fill="#94B1C8" font-style="italic">${esc(accent)}</tspan><tspan fill="#E2C98A"> ${esc(l3)}</tspan></text>
    <text x="0" y="318" class="sans fade" fill="#E3DFCE" fill-opacity=".72" style="font-size:16px;animation-delay:.75s">${esc(cfg.sub1)}</text>
    <text x="0" y="344" class="sans fade" fill="#E3DFCE" fill-opacity=".72" style="font-size:16px;animation-delay:.8s">${esc(cfg.sub2)}</text>
    <g class="fade" style="animation-delay:1s">
      <circle cx="6" cy="400" r="4.5" fill="#D9B064"><animate attributeName="r" values="4.5;7;4.5" dur="2s" repeatCount="indefinite"/><animate attributeName="fill-opacity" values="1;.4;1" dur="2s" repeatCount="indefinite"/></circle>
      <text x="22" y="404" class="mono" fill="#E3DFCE" fill-opacity=".65" style="font-size:12px;letter-spacing:2px">${esc(cfg.status.toUpperCase())}</text>
    </g>
  </g>
</g>
</svg>`;
}
// make the two digit layers flip at different moments
function headerFixed() {
  return header().replace('<g class="a">', '<g class="a">').replace('<g class="b">', '<g class="b">');
}

// ───────────────────────── folder cards
const FOLDER = {
  burgundy: { bg: '#4C050C', dark: '#2E0207', ink: '#E3DFCE', hex: '#4C050C' },
  blue: { bg: '#94B1C8', dark: '#6F8EA7', ink: '#1A0905', hex: '#94B1C8' },
  mocha: { bg: '#3A2119', dark: '#24130D', ink: '#E3DFCE', hex: '#3A2119' },
  paper: { bg: '#E8E2CF', dark: '#C9C0A6', ink: '#1A0905', hex: '#ECE9DD' },
  espresso: { bg: '#1A0905', dark: '#000000', ink: '#E3DFCE', hex: '#1A0905' },
};
function folder(f, i) {
  const c = FOLDER[f.color];
  const W = 340, H = 250, tabX = [26, 120, 70, 150, 40][i % 5];
  const papers = (f.items.length ? f.items.slice(0, 3) : ['', '', '']).slice().reverse();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(f.label)} folder — ${f.items.length} files. Click to open.">
<defs>
  <linearGradient id="back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.dark}"/><stop offset=".5" stop-color="${c.bg}"/></linearGradient>
  <linearGradient id="front" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".16"/><stop offset=".45" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#1A0905" flood-opacity=".35"/></filter>
</defs>
<style>
  .p{animation:bob 4s ease-in-out infinite}.p1{animation-delay:-1.3s}.p2{animation-delay:-2.6s}
  @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  .serif{font-family:${FONT_SERIF};font-weight:500}.mono{font-family:${FONT_MONO}}
</style>
<g filter="url(#sh)">
  <path d="M${tabX} 40 L${tabX + 12} 14 Q${tabX + 14} 10 ${tabX + 19} 10 L${tabX + 131} 10 Q${tabX + 136} 10 ${tabX + 138} 14 L${tabX + 150} 40 Z" fill="${c.dark}"/>
  <text x="${tabX + 75}" y="30" text-anchor="middle" class="mono" fill="${c.ink}" style="font-size:10.5px;letter-spacing:2.4px;font-weight:600">${esc(f.label.toUpperCase())}</text>
  <rect x="10" y="38" width="${W - 20}" height="${H - 58}" rx="10" fill="url(#back)"/>
  ${papers.map((t, j) => `<g class="p p${j}"><g transform="translate(${30 + j * 6} ${52 + j * 7}) rotate(${(j - 1) * 1.4})">
    <rect width="${W - 72}" height="120" rx="3" fill="#FBF8EF"/>
    <text x="16" y="28" class="serif" fill="#1A0905" style="font-size:16px;font-weight:600">${esc(t.length > 30 ? t.slice(0, 29) + '…' : t)}</text>
    <rect x="16" y="40" width="${(W - 104) * 0.8}" height="4" rx="2" fill="#1A0905" fill-opacity=".12"/>
    <rect x="16" y="50" width="${(W - 104) * 0.5}" height="4" rx="2" fill="#1A0905" fill-opacity=".12"/></g></g>`).join('')}
  <path d="M10 104 Q10 96 18 96 L${W - 18} 96 Q${W - 10} 96 ${W - 10} 104 L${W - 14} ${H - 28} Q${W - 15} ${H - 20} ${W - 24} ${H - 20} L24 ${H - 20} Q15 ${H - 20} 14 ${H - 28} Z" fill="${c.bg}"/>
  <path d="M10 104 Q10 96 18 96 L${W - 18} 96 Q${W - 10} 96 ${W - 10} 104 L${W - 14} ${H - 28} Q${W - 15} ${H - 20} ${W - 24} ${H - 20} L24 ${H - 20} Q15 ${H - 20} 14 ${H - 28} Z" fill="url(#front)"/>
  <text x="30" y="124" class="mono" fill="${c.ink}" fill-opacity=".7" style="font-size:10px;letter-spacing:1.6px">${c.hex}</text>
  <text x="${W - 30}" y="124" text-anchor="end" class="mono" fill="${c.ink}" fill-opacity=".7" style="font-size:10px;letter-spacing:1.6px">${String(f.items.length).padStart(2, '0')} FILES</text>
  <text x="28" y="168" class="serif" fill="${c.ink}" style="font-size:36px">${esc(f.label)}</text>
  <text x="30" y="${H - 38}" class="mono" fill="${c.ink}" fill-opacity=".75" style="font-size:10px;letter-spacing:1.6px">▾ CLICK TO OPEN</text>
</g>
</svg>`;
}

// ───────────────────────── skills strip
function skills() {
  const W = 1200;
  let x = 0, y = 0, rows = [];
  const items = cfg.skills.map((s, i) => {
    const w = 22 + s.length * 8.6;
    if (x + w > W) { x = 0; y += 46; }
    const out = { s, x, y, w, i };
    x += w + 10;
    return out;
  });
  const H = y + 40;
  const palette = [['#4C050C', '#E3DFCE'], ['#94B1C8', '#1A0905'], ['#1A0905', '#E2C98A'], ['#E8E2CF', '#1A0905']];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Skills: ${esc(cfg.skills.join(', '))}">
<style>.c{opacity:0;animation:pop .6s cubic-bezier(.22,1,.36,1) forwards}@keyframes pop{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
text{font-family:${FONT_MONO};font-size:13px;font-weight:500}</style>
${items.map(({ s, x, y, w, i }) => { const [bg, fg] = palette[i % palette.length]; return `<g class="c" style="animation-delay:${(i * 0.06).toFixed(2)}s"><rect x="${x}" y="${y}" width="${w}" height="34" rx="17" fill="${bg}"/><text x="${x + w / 2}" y="${y + 22}" text-anchor="middle" fill="${fg}">${esc(s)}</text></g>`; }).join('')}
</svg>`;
}

// ───────────────────────── section titles
function title(tag, a, b) {
  const W = 1200, H = 96;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(a + ' ' + b)}">
<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#8E6B27"/><stop offset=".5" stop-color="#D9B064"/><stop offset="1" stop-color="#8E6B27"/></linearGradient></defs>
<style>.mono{font-family:${FONT_MONO}}.serif{font-family:${FONT_SERIF};font-weight:500}.l{stroke-dasharray:1200;stroke-dashoffset:1200;animation:d 1.6s .2s cubic-bezier(.22,1,.36,1) forwards}@keyframes d{to{stroke-dashoffset:0}}</style>
<text x="0" y="20" class="mono" fill="#94B1C8" style="font-size:12px;letter-spacing:3px">${esc(tag.toUpperCase())}</text>
<text x="-2" y="70" class="serif" style="font-size:44px"><tspan fill="url(#g)">${esc(a)} </tspan><tspan fill="#94B1C8" font-style="italic">${esc(b)}</tspan></text>
<line class="l" x1="0" y1="92" x2="${W}" y2="92" stroke="#94B1C8" stroke-opacity=".45"/>
</svg>`;
}

fs.writeFileSync(OUT + 'header.svg', headerFixed());
cfg.folders.forEach((f, i) => fs.writeFileSync(OUT + `folder-${f.id}.svg`, folder(f, i)));
fs.writeFileSync(OUT + 'skills.svg', skills());
cfg.titles.forEach((t) => fs.writeFileSync(OUT + `title-${t.id}.svg`, title(t.tag, t.a, t.b)));
console.log(fs.readdirSync(OUT).map((f) => f + ' ' + fs.statSync(OUT + f).size).join('\n'));
