// Rasterise the queen + board silhouette into a character grid (JSON) using Chromium.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage();
  const grid = await page.evaluate(() => {
    const COLS = 78, ROWS = 46, CW = 6, CH = 10; // grid of monospace cells
    const W = COLS * CW, H = ROWS * CH;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const cx = W / 2, bTop = H * 0.66, bBot = H * 0.99, topW = W * 0.5, botW = W * 0.98;
    g.fillStyle = '#f00'; g.beginPath();
    g.moveTo(cx - topW / 2, bTop); g.lineTo(cx + topW / 2, bTop); g.lineTo(cx + botW / 2, bBot); g.lineTo(cx - botW / 2, bBot); g.fill();
    const qH = H * 0.8, s = qH / 160, sx = s * 1.45;
    g.save(); g.translate(cx - 50 * sx, H * 0.87 - 159 * s); g.scale(sx, s); g.fillStyle = '#0f0';
    ['M35 76 Q43 84 43 98 Q43 118 30 138 L70 138 Q57 118 57 98 Q57 84 65 76 Z','M22 40 L33 70 L67 70 L78 40 L67 55 L65 30 L57 52 L50 24 L43 52 L35 30 L33 55 Z','M30 67 H70 V76 H30 Z','M37 104 H63 V109 H37 Z','M24 138 H76 Q81 138 81 143 V147 H19 V143 Q19 138 24 138 Z','M15 147 H85 V159 H15 Z'].forEach((d) => g.fill(new Path2D(d)));
    [[50,15,6.5],[22,38,3.8],[35,28,3.8],[65,28,3.8],[78,38,3.8]].forEach(([x,y,r]) => { g.beginPath(); g.arc(x,y,r,0,7); g.fill(); });
    g.restore();
    const d = g.getImageData(0, 0, W, H).data;
    const rows = [];
    const zn = 1, zf = 2.6;
    for (let r = 0; r < ROWS; r++) {
      const y = (r + 0.5) * CH; let row = '';
      let L = -1, R = -1;
      for (let k = 0; k < COLS; k++) { const i = ((y | 0) * W + (((k + 0.5) * CW) | 0)) * 4; if (d[i + 1] > 128) { if (L < 0) L = k; R = k; } }
      for (let k = 0; k < COLS; k++) {
        const x = (k + 0.5) * CW; const i = ((y | 0) * W + (x | 0)) * 4;
        if (d[i + 1] > 128) {
          const t = R > L ? (k - L) / (R - L) : 0.5;
          const light = Math.exp(-(((t - 0.36) / 0.3) ** 2));
          row += 'q' + Math.min(5, Math.round((0.15 + light * 0.8) * 5));
        } else if (d[i] > 128) {
          const sN = (y - bTop) / (bBot - bTop); const invZ = 1 / zf + sN * (1 / zn - 1 / zf); const depth = (zf - 1 / invZ) / (zf - zn);
          const rowW = topW + (botW - topW) * sN; const u = (x - (cx - rowW / 2)) / rowW;
          row += ((Math.floor(u * 8) + Math.floor(depth * 8)) % 2 === 0 ? 'b' : 'w') + Math.min(3, Math.round(depth * 3));
        } else row += '..';
      }
      rows.push(row);
    }
    return { COLS, ROWS, rows };
  });
  require('fs').writeFileSync('grid.json', JSON.stringify(grid));
  console.log('rows', grid.rows.length);
  await b.close();
})();
