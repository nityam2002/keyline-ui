import type { KeylineItem } from "../../item";

export default {
  name: "keyline",
  type: "registry:theme",
  title: "Keyline",
  description:
    "Keyline tokens and construction primitives: role weights, the optional cut (--kl-cut), cells, flood, lamp, unfold, dock, pending. Source tokens go to your :root and .dark; theme/tokens.ts holds them as data.",
  docs: 'Shape: square by default (--kl-cut: 0). Set --kl-cut to 0.5 (quiet) or 1 (full) on :root or any subtree for the cut accent, or use data-kl-cut="quiet" | "on" | "off". Density: data-kl-density="compact". Reduced motion: honours prefers-reduced-motion; data-kl-motion="reduce" forces it.',
  files: [{ path: "src/registry/keyline/theme/tokens.ts", type: "registry:lib" }],
  cssFile: "src/registry/keyline/theme/keyline.css",
  theme: true,
  dependencies: ["@fontsource-variable/atkinson-hyperlegible-mono", "@fontsource-variable/atkinson-hyperlegible-next"],
  requires: {
    // the theme's font stacks name these families
    dependencies: [
      "@fontsource-variable/atkinson-hyperlegible-mono",
      "@fontsource-variable/atkinson-hyperlegible-next",
    ],
  },
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
