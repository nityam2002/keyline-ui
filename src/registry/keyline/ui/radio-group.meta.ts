import type { KeylineItem } from "../../item";

export default {
  name: "radio-group",
  type: "registry:ui",
  title: "Radio group",
  description: "Exclusive choice as framed rows; the ink band stretches to the chosen row.",
  files: [{ path: "src/registry/keyline/ui/radio-group.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/checkbox",
    "@keyline-ui/keyline-render",
    "@keyline-ui/keyline-scope",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
