// WCAG 2.2 contrast of two computed CSS colours (oklch(), oklab(), rgb(), color(srgb …)), as resolved by
// the browser. Out-of-gamut colours are clipped to sRGB, as the display does.

type RGB = [number, number, number]; // linear sRGB, 0..1

// a component the colour string lacks throws, as reading it off undefined always did
const num = (s: string | undefined) => {
  if (s === undefined) throw new TypeError("parseColor: missing colour component");
  return s.endsWith("%") ? parseFloat(s) / 100 : parseFloat(s);
};
const clip = (v: number) => Math.min(1, Math.max(0, v));
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function oklabToLinear(L: number, a: number, b: number): RGB {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    clip(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clip(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clip(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

export function parseColor(c: string): RGB | null {
  const m = /^(\w+)\((.*)\)$/.exec(c.trim());
  if (!m) return null;
  const [, fn, body = ""] = m; // both groups are required, so a match always fills them
  const [colour = ""] = body.split("/"); // the part before any alpha; split always yields one piece
  const parts = colour.trim().split(/[\s,]+/);
  if (fn === "oklch") {
    const [L, C, H] = [num(parts[0]), num(parts[1]), parseFloat(parts[2] ?? "") || 0];
    const h = (H * Math.PI) / 180;
    return oklabToLinear(L, C * Math.cos(h), C * Math.sin(h));
  }
  if (fn === "oklab") return oklabToLinear(num(parts[0]), num(parts[1]), num(parts[2]));
  if (fn === "rgb" || fn === "rgba") return parts.slice(0, 3).map((p) => toLinear(clip(parseFloat(p) / 255))) as RGB;
  if (fn === "color" && parts[0] === "srgb") return parts.slice(1, 4).map((p) => toLinear(clip(num(p)))) as RGB;
  return null;
}

const lum = ([r, g, b]: RGB) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

export function contrastOf(fg: string, bg: string) {
  const a = parseColor(fg);
  const b = parseColor(bg);
  if (!a || !b) return 0;
  const hi = Math.max(lum(a), lum(b));
  const lo = Math.min(lum(a), lum(b));
  return (hi + 0.05) / (lo + 0.05);
}
