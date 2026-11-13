// Keyline's tokens, as data: the single source. scripts/registry/theme.ts generates theme/keyline.css and
// theme/keyline-shadcn.css from it (pnpm registry:build), and lib/keyline-config reads its defaults from here.
// Change a token here, never in the generated CSS.
//
// Where each kind of token ends up:
//   sources       the app's own :root (cssVars.light) and .dark (cssVars.dark). `shadcn add` writes them into the
//                 app's stylesheet, where the user edits them; re-adding the keyline item updates them.
//   base          @layer base on :root, beside the scopes that override them on any element, <html> included
//                 (density, cut, motion). Unlayered they would beat those scopes on <html>.
//   theme         Tailwind theme entries (@theme inline, cssVars.theme): utilities such as bg-kl-cell, h-kl-ctl,
//                 text-kl-label. `inline` so each scope's own value is used, not :root's.

/** A token: its name without the leading `--kl-`, its value and why it is what it is. */
export type Token = readonly [name: string, value: string, note?: string];

/* ------------------------------------------------------------------ sources (configurable) */
export const PALETTE = {
  /** the working set: selection, tokens, ranges */
  working: "oklch(0.9 0.17 98)",
  /** location and commitment: current place, primary action */
  commit: "oklch(0.48 0.2 262)",
  /** invalid, failed, destructive, overdue */
  attention: "oklch(0.55 0.2 33)",
  /** hue of paper, ink and keylines */
  neutralHue: 262,
  /** tint of the neutrals: 0 grey, 1 default, 2.5 tinted */
  neutralTint: 1,
} as const;

export const TYPE = {
  sans: '"Atkinson Hyperlegible Next Variable", ui-sans-serif, system-ui, sans-serif',
  mono: '"Atkinson Hyperlegible Mono Variable", ui-monospace, monospace',
  /** labels, headers, the Count */
  strong: 700,
  /** titles, glyph cells */
  display: 800,
  /** the npm packages the default faces come from; the theme item imports and depends on them */
  packages: ["@fontsource-variable/atkinson-hyperlegible-next", "@fontsource-variable/atkinson-hyperlegible-mono"],
} as const;

export const SOURCES: readonly Token[] = [
  ["working", PALETTE.working, "the working set: selection, tokens, ranges"],
  ["commit", PALETTE.commit, "location and commitment: current place, primary action"],
  ["attention", PALETTE.attention, "invalid, failed, destructive, overdue"],
  ["neutral-h", String(PALETTE.neutralHue), "hue of paper, ink and keylines"],
  ["neutral-c", String(PALETTE.neutralTint), "tint of the neutrals: 0 grey · 1 default · 2.5 tinted"],
  ["font", TYPE.sans],
  ["font-mono", TYPE.mono],
  ["weight-strong", String(TYPE.strong), "labels, headers, the Count"],
  ["weight-display", String(TYPE.display), "titles, glyph cells"],
  ["dark", "0", "theme switch, set by .dark / .light; every derived colour interpolates on it"],
];

/** The cut: 0 off, 0.5 quiet, 1 full. Inherits; set on any subtree. Square by default: the cut is an accent. */
export const CUT = { off: "0", quiet: "0.5", on: "1" } as const;
export const CUT_DEFAULT = CUT.off;

/* ------------------------------------------------------------------ constants */
export const CONSTANTS: readonly Token[] = [
  // keyline weights by role: identity, not configuration
  ["k3", "3px"],
  ["k2", "2px"],
  ["k1", "1px"],
  // focus ring: one thickness, two placements (outside a standalone control's frame with a gap of the surface;
  // flush inside a cell). WCAG 2.4.13: 2px on the whole perimeter, >= 3:1 against the cell in both themes.
  // Text-entry frames use the focus edge instead (.kl-edge): the same thickness, laid inside their own border.
  ["ring", "2px"],
  ["ring-out", "2px"],
  ["ring-in", "calc(-1 * var(--kl-ring))"],
  // focus edge band inside a standalone control's 2px border: 2 + 1 = one 3px commit-coloured edge
  ["edge-band", "1px"],
  // docked surfaces: an end closer than this to the owner's end snaps to it (no near-miss ends)
  ["snap", "48px"],
];

/* ------------------------------------------------------------------ density */
export type Density = "comfortable" | "default" | "compact";
export const DENSITIES: readonly Density[] = ["comfortable", "default", "compact"];

/** Rhythm and cut sizes by density. `gutter` is stated in every density, so a compact scope inside a comfortable
 * one does not inherit its 16px. */
export const RHYTHM: Record<Density, Record<string, string>> = {
  comfortable: {
    ctl: "40px",
    row: "48px",
    inset: "16px",
    gutter: "16px",
    fs: "15px",
    "cut-region": "20px",
    "cut-control": "10px",
    "cut-nested": "6px",
  },
  default: {
    ctl: "36px",
    row: "40px",
    inset: "12px",
    gutter: "12px",
    fs: "14px",
    "cut-region": "18px",
    "cut-control": "9px",
    "cut-nested": "5px",
  },
  compact: {
    ctl: "28px",
    row: "28px",
    inset: "8px",
    gutter: "12px",
    fs: "13px",
    "cut-region": "14px",
    "cut-control": "7px",
    "cut-nested": "4px",
  },
};

/**
 * The type scale, by role. Default-density values are the sizes the components already use for that role, so
 * nothing moves at default density; the other densities step with the body size (--kl-fs: 15 / 14 / 13).
 *   code     the Code voice: mono labels, keys, IDs (11px, the `500 11px` mono shorthands)
 *   meta     secondary lines: timestamps, counts beside a label, captions (12px)
 *   label    control and cell labels, list rows (13px, the most common size)
 *   body     running text: the body size itself (--kl-fs)
 *   lead     a heading inside a panel or dialog (15px)
 *   title    a region or page title (20px)
 *   display  a stat or a hero figure (32px)
 */
export const TEXT: Record<Density, Record<string, string>> = {
  comfortable: {
    code: "12px",
    meta: "13px",
    label: "14px",
    body: "15px",
    lead: "16px",
    title: "22px",
    display: "36px",
  },
  default: { code: "11px", meta: "12px", label: "13px", body: "14px", lead: "15px", title: "20px", display: "32px" },
  compact: { code: "11px", meta: "12px", label: "12px", body: "13px", lead: "14px", title: "18px", display: "28px" },
};

/* ------------------------------------------------------------------ motion */
export const MOTION: readonly Token[] = [
  ["t-flood", "140ms"],
  ["t-unflood", "110ms"],
  ["t-unfold", "160ms"],
  ["t-fold", "120ms"],
  ["t-tick", "180ms"],
  ["ease-out", "cubic-bezier(0.2, 0.7, 0.2, 1)"],
  ["ease-in", "cubic-bezier(0.5, 0, 0.75, 0.4)"],
  ["stretch-lead", "100"],
  ["stretch-trail", "220"],
  ["stretch-tug", "12", "how far (px) a held press pulls the band's leading edge toward the item under it"],
  ["flood-seed", "7px", "the radius of the flood seed under a held press (the flood grows on from it at release)"],
];
/** What `data-kl-motion="reduce"` and prefers-reduced-motion set: every timing to zero. */
export const MOTION_REDUCED: readonly Token[] = [
  ["t-flood", "0ms"],
  ["t-unflood", "0ms"],
  ["t-unfold", "0ms"],
  ["t-fold", "0ms"],
  ["t-tick", "0ms"],
  ["stretch-lead", "0"],
  ["stretch-trail", "0"],
  ["stretch-tug", "0"],
];

/* ------------------------------------------------------------------ layering */
/** Every overlay shares one level and stacks by DOM order (portals append in opening order, so a select opened
 * inside a dialog sits above it); floating toasts sit above all overlays. */
export const Z: readonly Token[] = [
  ["z-overlay", "60"],
  ["z-toast", "70"],
];

/* ------------------------------------------------------------------ Tailwind theme entries */
/** The colour roles every scope derives (theme/foundation.css); each is a Tailwind colour of the same name. */
export const COLOUR_ROLES = [
  "paper",
  "cell",
  "raised",
  "tint",
  "press",
  "ink",
  "ink-2",
  "ink-3",
  "line",
  "seam",
  "line-soft",
  "dis",
  "dis-line",
  "inverse",
  "on-inverse",
  "scrim",
  "yellow",
  "on-yellow",
  "yellow-row",
  "cobalt",
  "cobalt-hi",
  "cobalt-lo",
  "cobalt-text",
  "on-cobalt",
  "red",
  "red-hi",
  "red-lo",
  "red-text",
  "on-red",
  "focus",
  "data-1",
  "data-2",
  "data-3",
  "data-mark",
  "data-alert",
] as const;

/** Geometry and rhythm as Tailwind spacing: h-kl-ctl, py-kl-row, px-kl-inset, gap-kl-gutter, -m-kl-k2 … */
export const SPACING = ["ctl", "row", "inset", "gutter", "k1", "k2", "k3", "cut-region", "cut-control", "cut-nested"];

/** Every Tailwind theme entry, as `[entry, token]`: `--<entry>: var(--kl-<token>)`. */
export const THEME_ENTRIES: readonly (readonly [string, string])[] = [
  ...COLOUR_ROLES.map((r) => [`color-kl-${r}`, r] as const),
  ["font-kl", "font"],
  ["font-kl-mono", "font-mono"],
  ["font-weight-kl-strong", "weight-strong"],
  ["font-weight-kl-display", "weight-display"],
  ...SPACING.map((s) => [`spacing-kl-${s}`, s] as const),
  ...Object.keys(TEXT.default).map((t) => [`text-kl-${t}`, `text-${t}`] as const),
  ["ease-kl-out", "ease-out"],
  ["ease-kl-in", "ease-in"],
];

/* ------------------------------------------------------------------ the opt-in shadcn mapping */
/** shadcn's semantic tokens, each mapped to a Keyline role; keyline-shadcn.css states it for :root and .light,
 * .dark and every configuration scope, where var() must resolve against the scope's own Keyline tokens. */
export const SHADCN_MAP: readonly (readonly [string, string])[] = [
  ["background", "paper"],
  ["foreground", "ink"],
  ["card", "cell"],
  ["card-foreground", "ink"],
  ["popover", "raised"],
  ["popover-foreground", "ink"],
  ["primary", "cobalt"],
  ["primary-foreground", "on-cobalt"],
  ["secondary", "tint"],
  ["secondary-foreground", "ink"],
  ["muted", "tint"],
  ["muted-foreground", "ink-2"],
  ["accent", "yellow"],
  ["accent-foreground", "on-yellow"],
  ["destructive", "red"],
  ["border", "seam"],
  ["input", "line"],
  ["ring", "focus"],
  ["sidebar", "cell"],
  ["sidebar-foreground", "ink"],
  ["sidebar-primary", "cobalt"],
  ["sidebar-primary-foreground", "on-cobalt"],
  ["sidebar-accent", "yellow"],
  ["sidebar-accent-foreground", "on-yellow"],
  ["sidebar-border", "seam"],
  ["sidebar-ring", "focus"],
];
