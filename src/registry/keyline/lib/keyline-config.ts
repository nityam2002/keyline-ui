import * as React from "react";

import { CUT as CUT_VALUES, PALETTE, TYPE } from "../theme/tokens";

/* ------------------------------------------------------------------ *
 * KEYLINE CONFIGURATION
 * One plain object describes everything a developer may configure. It is applied in three ways that
 * produce the same tokens, so the playground preview, a runtime scope and an installed project match:
 *   - configTokens / configToCss         → CSS custom properties (paste, or install as a registry item)
 *   - configAttributes                   → the attributes that select modes (theme, density, motion)
 *   - <KeylineConfigScope config={…}>    → a configuration scope at runtime (a tenant, a preview)
 * Keyline's identity is NOT configurable here: role weights (3/2/1), square corners, the four signal
 * jobs, flood/stretch/unfold behaviours, the Count and Code voices.
 * ------------------------------------------------------------------ */

export type Palette = {
  /** fills for the working set (selection, tokens, ranges) */
  working: string;
  /** location and commitment (current place, primary action) */
  commit: string;
  /** invalid, failed, destructive, overdue */
  attention: string;
  /** hue of paper, ink and keylines */
  neutralHue: number;
  /** tint of the neutrals: 0 grey, 1 default, up to 3 */
  neutralTint: number;
};

export type FontId = "atkinson" | "plex" | "system";
export type KeylineConfig = {
  palette: Palette;
  font: FontId;
  /** weight of labels, headers and the Count. Clamped to what the font has. */
  strong: 600 | 700 | 800;
  cut: "full" | "quiet" | "off";
  density: "compact" | "default" | "comfortable";
  theme: "light" | "dark" | "system";
  motion: "full" | "reduce";
};

/** Palette presets. Each was checked for signal contrast in both themes. */
export const PALETTES = {
  // Keyline's defaults (theme/tokens.ts)
  signal: { label: "Signal", ...PALETTE },
  harbor: {
    label: "Harbor",
    working: "oklch(0.89 0.15 82)",
    commit: "oklch(0.47 0.12 222)",
    attention: "oklch(0.55 0.19 27)",
    neutralHue: 225,
    neutralTint: 1.4,
  },
  ember: {
    label: "Ember",
    working: "oklch(0.9 0.17 122)",
    commit: "oklch(0.46 0.19 298)",
    attention: "oklch(0.57 0.2 38)",
    neutralHue: 300,
    neutralTint: 0.8,
  },
  ledger: {
    label: "Ledger",
    working: "oklch(0.91 0.13 92)",
    commit: "oklch(0.45 0.17 275)",
    attention: "oklch(0.53 0.19 25)",
    neutralHue: 80,
    neutralTint: 2.5,
  },
} satisfies Record<string, Palette & { label: string }>;
export type PaletteId = keyof typeof PALETTES;

/**
 * Role lightness and chroma: the tone a custom palette starts from when it picks a hue per role.
 * A fixed OKLCH lightness does not fix contrast across hues. Near cyan, L 0.55 C 0.2 lies outside sRGB;
 * an sRGB display clips it lighter, and white text on it measured 3.8:1. roleColor() keeps the hue and
 * chroma and steps lightness down until white text reaches 4.6:1 on the fill in both themes (the dark
 * fill is the one keyline.css derives). Luminance is checked both clipped to sRGB and unclipped (what a
 * wide-gamut display shows), taking the worse. The working set is only ever paired with dark text, so it
 * keeps its tone.
 */
export const ROLE_TONE = { working: [0.9, 0.16], commit: [0.48, 0.18], attention: [0.55, 0.2] } as const;
const DARK_LIFT = { commit: 0.09, attention: 0.02 } as const;

type Rgb = [number, number, number];
function oklchToLinear(L: number, C: number, H: number): Rgb {
  const h = (H * Math.PI) / 180;
  const [a, b] = [C * Math.cos(h), C * Math.sin(h)];
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
/** The lower WCAG 2 contrast of white on this colour, clipped to sRGB or not. */
export function whiteContrast(L: number, C: number, H: number) {
  const rgb = oklchToLinear(L, C, H);
  const y = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const clip = (v: number) => Math.min(1, Math.max(0, v));
  const lum = Math.max(y([clip(rgb[0]), clip(rgb[1]), clip(rgb[2])]), y(rgb));
  return 1.05 / (lum + 0.05);
}
/** The fill keyline.css derives in the dark theme from a commit or attention source. */
export const darkFill = (role: "commit" | "attention", L: number, C: number) =>
  [Math.min(L + DARK_LIFT[role], Math.max(L, 0.54)), C * 0.9] as const;

export function roleColor(role: keyof typeof ROLE_TONE, hue: number) {
  const h = Math.round(hue);
  const [L0, C] = ROLE_TONE[role];
  let L: number = L0;
  if (role !== "working") {
    const ok = (l: number) => whiteContrast(l, C, h) >= 4.6 && whiteContrast(...darkFill(role, l, C), h) >= 4.6;
    while (!ok(L) && L > 0.3) L = +(L - 0.005).toFixed(3);
  }
  return `oklch(${L} ${C} ${h})`;
}

export const FONTS: Record<
  FontId,
  { label: string; sans: string; mono: string; weights: [number, number]; install: string | null; imports: string[] }
> = {
  atkinson: {
    label: "Atkinson Hyperlegible",
    sans: TYPE.sans,
    mono: TYPE.mono,
    weights: [200, 800],
    install: null, // bundled with the keyline item
    imports: [],
  },
  plex: {
    label: "IBM Plex",
    sans: '"IBM Plex Sans Variable", ui-sans-serif, system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
    weights: [100, 700],
    install: "npm install @fontsource-variable/ibm-plex-sans @fontsource/ibm-plex-mono",
    imports: [
      "@fontsource-variable/ibm-plex-sans",
      "@fontsource/ibm-plex-mono/400.css",
      "@fontsource/ibm-plex-mono/500.css",
    ],
  },
  system: {
    label: "System UI",
    sans: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    weights: [400, 800],
    install: null,
    imports: [],
  },
};

export const DEFAULT_CONFIG: KeylineConfig = {
  palette: { ...PALETTES.signal },
  font: "atkinson",
  strong: TYPE.strong,
  cut: "off",
  density: "default",
  theme: "light",
  motion: "full",
};

const CUT = { full: CUT_VALUES.on, quiet: CUT_VALUES.quiet, off: CUT_VALUES.off } as const;

/** Strong and display weights the chosen font can actually render. */
export function weights(cfg: Pick<KeylineConfig, "font" | "strong">) {
  const [, max] = FONTS[cfg.font].weights;
  const strong = Math.min(cfg.strong, max);
  return { strong, display: Math.min(strong + 100, max) };
}

/** Every token the configuration sets, including defaults. Keys are full custom-property names. */
export function configTokens(cfg: KeylineConfig): Record<string, string> {
  const w = weights(cfg);
  const f = FONTS[cfg.font];
  return {
    "--kl-working": cfg.palette.working,
    "--kl-commit": cfg.palette.commit,
    "--kl-attention": cfg.palette.attention,
    "--kl-neutral-h": String(cfg.palette.neutralHue),
    "--kl-neutral-c": String(cfg.palette.neutralTint),
    "--kl-font": f.sans,
    "--kl-font-mono": f.mono,
    "--kl-weight-strong": String(w.strong),
    "--kl-weight-display": String(w.display),
    "--kl-cut": CUT[cfg.cut],
  };
}

/** Only the tokens that differ from Keyline's defaults: what an export has to carry. */
export function changedTokens(cfg: KeylineConfig) {
  const base = configTokens(DEFAULT_CONFIG);
  return Object.fromEntries(Object.entries(configTokens(cfg)).filter(([k, v]) => base[k] !== v));
}

/** Mode attributes for the scope element (or <html>). Theme "system" sets no class. */
export function configAttributes(cfg: KeylineConfig): {
  className?: string;
  "data-kl-density"?: string;
  "data-kl-motion"?: string;
} {
  return {
    className: cfg.theme === "system" ? undefined : cfg.theme,
    "data-kl-density": cfg.density === "default" ? undefined : cfg.density,
    "data-kl-motion": cfg.motion === "reduce" ? "reduce" : undefined,
  };
}

/** A configuration scope's selector: :root for the whole app, or [data-kl-config="name"] for a subtree. */
export const scopeSelector = (scope?: string) => (scope ? `[data-kl-config="${scope}"]` : ":root");

/** Readable CSS for the tokens. Paste it over the :root the keyline item installed, or after it (the later rule
 * wins); --kl-cut's default is layered, so that one wins anywhere in the file. */
export function configToCss(cfg: KeylineConfig, opts: { scope?: string; all?: boolean } = {}) {
  const tokens = opts.all ? configTokens(cfg) : changedTokens(cfg);
  const sel = scopeSelector(opts.scope);
  const lines = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`);
  const head = `/* Keyline configuration${opts.scope ? ` for the "${opts.scope}" scope` : ""}. Generated by the Keyline playground. */`;
  const fonts = FONTS[cfg.font].imports.map((i) => `@import "${i}";`);
  const body = lines.length
    ? `${sel} {\n${lines.join("\n")}\n}`
    : `/* every token is at its default: nothing to override */`;
  return [head, ...fonts, body].join("\n") + "\n";
}

/**
 * A shadcn registry item carrying the same tokens. Install it from a local file:
 *   npx shadcn@latest add ./keyline-config.json
 * Tokens go in `css` under the scope selector (not cssVars, which the CLI writes to :root only).
 * Font packages travel as npm dependencies with their @import lines.
 */
export function configToRegistryItem(cfg: KeylineConfig, opts: { name?: string; scope?: string } = {}) {
  const f = FONTS[cfg.font];
  const css: Record<string, unknown> = {};
  for (const i of f.imports) css[`@import "${i}"`] = {};
  // Every configurable token, not only the changed ones: shadcn merges a re-added item property by
  // property, so a token left out (because it went back to its default) would keep the old value.
  css[scopeSelector(opts.scope)] = configTokens(cfg);
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: opts.name ?? "keyline-config",
    type: "registry:theme",
    title: "Keyline configuration",
    description: "Palette, type and cut tokens generated by the Keyline playground. Requires the keyline item.",
    registryDependencies: ["@keyline-ui/keyline"],
    dependencies: f.install
      ? f.imports.map((i) => i.split("/").slice(0, 2).join("/")).filter((v, i, a) => a.indexOf(v) === i)
      : [],
    css,
  };
}

/** Attributes as JSX source, for documentation and the export panel. */
export function attributesSnippet(cfg: KeylineConfig, el = "html") {
  const a = configAttributes(cfg);
  const parts = [
    a.className ? `class="${a.className}"` : "",
    a["data-kl-density"] ? `data-kl-density="${a["data-kl-density"]}"` : "",
    a["data-kl-motion"] ? `data-kl-motion="${a["data-kl-motion"]}"` : "",
  ].filter(Boolean);
  return parts.length ? `<${el} ${parts.join(" ")}>` : null;
}

/** URL-safe encoding, for sharing a configuration. */
export const encodeConfig = (cfg: KeylineConfig) => btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));
export function decodeConfig(s: string | null | undefined): KeylineConfig | null {
  if (!s) return null;
  try {
    const v = JSON.parse(decodeURIComponent(escape(atob(s))));
    return normalizeConfig(v);
  } catch {
    return null;
  }
}

/** Fills missing or invalid fields from the defaults, so a stored or shared configuration never breaks. */
export function normalizeConfig(v: unknown): KeylineConfig {
  const d = DEFAULT_CONFIG;
  const o = (v && typeof v === "object" ? v : {}) as Partial<KeylineConfig>;
  const pick = <T>(x: unknown, ok: readonly T[], def: T) => (ok.includes(x as T) ? (x as T) : def);
  const p = (o.palette && typeof o.palette === "object" ? o.palette : {}) as Partial<Palette>;
  const str = (x: unknown, def: string) => (typeof x === "string" && /^oklch\([\d.\s%]+\)$/.test(x) ? x : def);
  const num = (x: unknown, def: number, lo: number, hi: number) =>
    typeof x === "number" && x >= lo && x <= hi ? x : def;
  return {
    palette: {
      working: str(p.working, d.palette.working),
      commit: str(p.commit, d.palette.commit),
      attention: str(p.attention, d.palette.attention),
      neutralHue: num(p.neutralHue, d.palette.neutralHue, 0, 360),
      neutralTint: num(p.neutralTint, d.palette.neutralTint, 0, 3),
    },
    font: pick(o.font, ["atkinson", "plex", "system"] as const, d.font),
    strong: pick(o.strong, [600, 700, 800] as const, d.strong),
    cut: pick(o.cut, ["full", "quiet", "off"] as const, d.cut),
    density: pick(o.density, ["compact", "default", "comfortable"] as const, d.density),
    theme: pick(o.theme, ["light", "dark", "system"] as const, d.theme),
    motion: pick(o.motion, ["full", "reduce"] as const, d.motion),
  };
}

/** Hue of an oklch() string (for the palette editor). */
export const hueOf = (c: string) => Number(/oklch\(\s*[\d.]+%?\s+[\d.]+\s+([\d.]+)/.exec(c)?.[1] ?? 0);

/** Hue pairs closer than this read as the same signal for many viewers; the playground warns. */
export function paletteWarnings(p: Palette) {
  const d = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
  const w: string[] = [];
  const [wk, cm, at] = [hueOf(p.working), hueOf(p.commit), hueOf(p.attention)];
  if (d(cm, at) < 40) w.push("Commit and attention hues are close: primary actions will read as warnings.");
  if (d(wk, at) < 30) w.push("Working-set and attention hues are close: selected rows will read as errors.");
  if (d(wk, cm) < 30) w.push("Working-set and commit hues are close: selection and location become one signal.");
  return w;
}

type ScopeProps = React.ComponentProps<"div"> & { config: KeylineConfig; name?: string };

/**
 * A configuration scope at runtime: everything inside (and every overlay opened from inside) takes the
 * configuration. Use it for a tenant theme, an embedded widget, or a preview. Theme "system" inherits.
 */
export function KeylineConfigScope({ config, name = "", className, style, ...props }: ScopeProps): React.ReactElement {
  const a = configAttributes(config);
  return React.createElement("div", {
    ...props,
    "data-kl-config": name,
    "data-kl-density": a["data-kl-density"] ?? (config.density === "default" ? "default" : undefined),
    "data-kl-motion": a["data-kl-motion"],
    className: [className, a.className].filter(Boolean).join(" ") || undefined,
    style: { ...(configTokens(config) as React.CSSProperties), ...style },
  });
}
