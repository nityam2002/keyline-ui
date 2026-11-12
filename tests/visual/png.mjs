// Minimal PNG reading and writing for the visual-parity harness (tests/visual/), so comparing two screenshots needs
// no image library. It reads what Playwright writes (8-bit RGB or RGBA, not interlaced) and writes 8-bit RGBA.
import { deflateSync, inflateSync, crc32 } from "node:zlib";

const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

/** Decodes a PNG buffer to { width, height, data } (data: RGBA, 4 bytes a pixel). */
export function readPng(buf) {
  if (!buf.subarray(0, 8).equals(SIG)) throw new Error("not a PNG");
  let pos = 8;
  let width = 0,
    height = 0,
    depth = 0,
    type = 0,
    interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const kind = buf.toString("latin1", pos + 4, pos + 8);
    const body = buf.subarray(pos + 8, pos + 8 + len);
    if (kind === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      depth = body[8];
      type = body[9];
      interlace = body[12];
    } else if (kind === "IDAT") idat.push(body);
    else if (kind === "IEND") break;
    pos += 12 + len;
  }
  const channels = { 2: 3, 6: 4 }[type];
  if (depth !== 8 || !channels || interlace) throw new Error(`unsupported PNG (depth ${depth}, type ${type})`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(width * height * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      let add = 0;
      if (filter === 1) add = a;
      else if (filter === 2) add = b;
      else if (filter === 3) add = (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a),
          pb = Math.abs(p - b),
          pc = Math.abs(p - c);
        add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      line[i] = (line[i] + add) & 255;
    }
    for (let x = 0; x < width; x++) {
      const s = x * channels,
        d = (y * width + x) * 4;
      out[d] = line[s];
      out[d + 1] = line[s + 1];
      out[d + 2] = line[s + 2];
      out[d + 3] = channels === 4 ? line[s + 3] : 255;
    }
    prev = line;
  }
  return { width, height, data: out };
}

const chunk = (kind, body) => {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(kind, 4, "latin1");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), body])) >>> 0, 0);
  return Buffer.concat([head, body, crc]);
};

/** Encodes { width, height, data } (RGBA) as a PNG buffer. */
export function writePng({ width, height, data }) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) data.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  return Buffer.concat([SIG, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

/**
 * Compares two PNG buffers pixel for pixel, with no tolerance. Returns null when they are identical, else
 * { pixels, box, size, diff } — the count of differing pixels, their bounding box, whether the sizes differ, and a
 * diff image: the before image faded three quarters of the way to white, with every differing pixel in solid magenta.
 */
export function comparePng(before, after) {
  if (before.equals(after)) return null;
  const a = readPng(before),
    b = readPng(after);
  const width = Math.max(a.width, b.width),
    height = Math.max(a.height, b.height);
  const data = Buffer.alloc(width * height * 4);
  let pixels = 0;
  let x0 = width,
    y0 = height,
    x1 = -1,
    y1 = -1;
  const px = (img, x, y) => (x < img.width && y < img.height ? img.data.readUInt32BE((y * img.width + x) * 4) : -1);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const pa = px(a, x, y),
        pb = px(b, x, y);
      const d = (y * width + x) * 4;
      if (pa !== pb) {
        pixels++;
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
        data[d] = 255;
        data[d + 1] = 0;
        data[d + 2] = 255;
        data[d + 3] = 255;
      } else {
        // unchanged: the before pixel, faded towards white so the changes stand out
        for (let k = 0; k < 3; k++) data[d + k] = 255 - ((255 - ((pa >>> (24 - 8 * k)) & 255)) >> 2);
        data[d + 3] = 255;
      }
    }
  const size = a.width !== b.width || a.height !== b.height;
  if (!pixels && !size) return null;
  return {
    pixels,
    box: pixels ? { x: x0, y: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 } : null,
    size: size ? `${a.width}x${a.height} → ${b.width}x${b.height}` : null,
    diff: writePng({ width, height, data }),
  };
}
