import type { KeylineItem } from "../../item";

export default {
  name: "keyline-scope",
  type: "registry:lib",
  title: "Keyline portal scope",
  description:
    "Carries subtree configuration (palette, font, weights, cut, density, motion, theme, dir) onto portaled overlays. No provider.",
  files: [{ path: "src/registry/keyline/lib/keyline-scope.ts", type: "registry:lib" }],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
