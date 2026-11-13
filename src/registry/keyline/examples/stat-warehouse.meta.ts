import type { KeylineItem } from "../../item";

export default {
  name: "stat-warehouse",
  type: "registry:block",
  title: "Stat: warehouse space",
  description: "An example of Stat: warehouse space.",
  categories: ["stat"],
  files: [{ path: "src/registry/keyline/examples/stat-warehouse.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/stat"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
