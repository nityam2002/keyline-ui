import type { KeylineItem } from "../../item";

export default {
  name: "panel-targets",
  type: "registry:block",
  title: "Panel: sales targets",
  description: "An example of Panel: sales targets.",
  categories: ["panel"],
  files: [{ path: "src/registry/keyline/examples/panel-targets.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/panel", "@keyline-ui/stat"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
