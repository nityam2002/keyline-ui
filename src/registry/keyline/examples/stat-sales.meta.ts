import type { KeylineItem } from "../../item";

export default {
  name: "stat-sales",
  type: "registry:block",
  title: "Stat: branch stats",
  description: "An example of Stat: branch stats.",
  categories: ["stat"],
  files: [{ path: "src/registry/keyline/examples/stat-sales.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/panel", "@keyline-ui/segmented", "@keyline-ui/stat"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
