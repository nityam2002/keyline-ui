import type { KeylineItem } from "../../item";

export default {
  name: "kbd",
  type: "registry:ui",
  title: "Kbd",
  description:
    "A key in the Code voice: a key cell with a 2px floor; KbdGroup joins a chord's keys on seams (nested kbd), with the separator read, not drawn. Used by Command.",
  files: [{ path: "src/registry/keyline/ui/kbd.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/kbd.css",
  registryDependencies: ["@keyline-ui/keyline", "utils"],
} satisfies KeylineItem;
