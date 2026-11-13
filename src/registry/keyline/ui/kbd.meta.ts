import type { KeylineItem } from "../../item";

export default {
  name: "kbd",
  type: "registry:ui",
  title: "Kbd",
  description:
    "A key in the Code voice: a key cell with a 2px floor; KbdGroup joins a chord's keys on seams (nested kbd), with the separator read, not drawn. Used by Command.",
  files: [{ path: "src/registry/keyline/ui/kbd.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
