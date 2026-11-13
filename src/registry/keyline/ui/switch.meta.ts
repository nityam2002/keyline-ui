import type { KeylineItem } from "../../item";

export default {
  name: "switch",
  type: "registry:ui",
  title: "Switch",
  description: "Binary setting: a two-cell frame whose block stretches to the on side.",
  files: [{ path: "src/registry/keyline/ui/switch.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/checkbox", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
