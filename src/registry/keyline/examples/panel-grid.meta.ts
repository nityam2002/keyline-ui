import type { KeylineItem } from "../../item";

export default {
  name: "panel-grid",
  type: "registry:block",
  title: "Panel: branch board",
  description: "An example of Panel: branch board.",
  categories: ["panel"],
  files: [{ path: "src/registry/keyline/examples/panel-grid.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/panel", "@keyline-ui/status"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
