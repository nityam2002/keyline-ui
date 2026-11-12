import type { KeylineItem } from "../../item";

export default {
  name: "keyline-scope",
  type: "registry:lib",
  title: "Keyline portal scope",
  description:
    "Carries subtree configuration (palette, font, weights, cut, density, motion, theme, dir) onto portaled overlays. No provider.",
  files: [{ path: "src/registry/keyline/lib/keyline-scope.ts", type: "registry:lib" }],
} satisfies KeylineItem;
