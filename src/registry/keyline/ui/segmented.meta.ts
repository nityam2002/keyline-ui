import type { KeylineItem } from "../../item";

export default {
  name: "segmented",
  type: "registry:ui",
  title: "Segmented control",
  description: "Exclusive choice in one frame; the ink band stretches between cells.",
  whenToUse:
    "Use it for one choice of a few short options on one line, such as a view mode. For choices that need a description use Radio group; for switching panels use Tabs.",
  files: [{ path: "src/registry/keyline/ui/segmented.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/scroll-edges",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/keyline-render",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
