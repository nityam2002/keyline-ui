import type { KeylineItem } from "../../item";

export default {
  name: "keyline",
  type: "registry:style",
  extends: "none",
  title: "Keyline",
  description:
    "Keyline tokens and construction primitives: role weights, the optional cut (--kl-cut), cells, flood, lamp, unfold, dock, pending.",
  docs: 'Shape: square by default (--kl-cut: 0). Set --kl-cut to 0.5 (quiet) or 1 (full) on :root or any subtree for the cut accent, or use data-kl-cut="quiet" | "on" | "off". Density: data-kl-density="compact". Reduced motion: honours prefers-reduced-motion; data-kl-motion="reduce" forces it.',
  files: [],
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
} satisfies KeylineItem;
