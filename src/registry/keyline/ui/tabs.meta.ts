import type { KeylineItem } from "../../item";

export default {
  name: "tabs",
  type: "registry:ui",
  title: "Tabs",
  description: "Tabs with a cobalt location band that stretches; optional count voice; panels.",
  files: [{ path: "src/registry/keyline/ui/tabs.tsx", type: "registry:ui" }],
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
