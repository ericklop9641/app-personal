// Generador de iconos PNG sin dependencias externas.
// Dibuja un cuadrado redondeado con degradado y ondas concéntricas
// (metáfora de "sensación / conciencia que se propaga").
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function lerp(a, b, t) { return a + (b - a) * t; }

function drawIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2, cy = size / 2;
  const R = size * 0.5;
  const radius = size * 0.235; // radio esquinas (estilo iOS "squircle" aprox)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // máscara de esquina redondeada
      const rx = Math.max(radius - x, x - (size - radius), 0);
      const ry = Math.max(radius - y, y - (size - radius), 0);
      const cornerDist = Math.sqrt(rx * rx + ry * ry);
      let alpha = 1;
      if (cornerDist > radius) alpha = Math.max(0, 1 - (cornerDist - radius));

      // degradado diagonal índigo -> violeta -> rosa
      const t = (x + y) / (2 * size);
      let r = lerp(lerp(76, 124, t), 236, Math.max(0, t - 0.5) * 2);
      let g = lerp(lerp(29, 58, t), 72, Math.max(0, t - 0.5) * 2);
      let b = lerp(lerp(149, 183, t), 153, Math.max(0, t - 0.5) * 2);

      // ondas concéntricas suaves
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / R;
      const wave = Math.sin(d * 22 - 2.0);
      const glow = Math.max(0, 1 - d * 1.15);
      const ring = Math.max(0, wave) * glow * 55;
      r = Math.min(255, r + ring + glow * 40);
      g = Math.min(255, g + ring + glow * 30);
      b = Math.min(255, b + ring + glow * 55);

      // punto central luminoso (foco de atención)
      const core = Math.max(0, 1 - d * 4.5);
      r = Math.min(255, r + core * 120);
      g = Math.min(255, g + core * 110);
      b = Math.min(255, b + core * 120);

      buf[i] = Math.round(r);
      buf[i + 1] = Math.round(g);
      buf[i + 2] = Math.round(b);
      buf[i + 3] = Math.round(alpha * 255);
    }
  }
  return buf;
}

function encodePNG(size, rgba) {
  // raw scanlines con filtro 0
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(crcBuf) >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const crcTable = (() => {
  const t = new Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

const outDir = path.join(__dirname, '..', 'icons');
[180, 192, 512].forEach(size => {
  const png = encodePNG(size, drawIcon(size));
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`icon-${size}.png (${png.length} bytes)`);
});
