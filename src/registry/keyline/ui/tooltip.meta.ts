import type { KeylineItem } from "../../item";

export default {
  name: "tooltip",
  type: "registry:ui",
  title: "Tooltip",
  description: "Ink label docked to the focus ring of its trigger, with an optional shortcut cell. Never cut.",
  files: [{ path: "src/registry/keyline/ui/tooltip.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-scope", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
