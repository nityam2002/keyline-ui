import type { KeylineItem } from "../../item";

export default {
  name: "table-lines",
  type: "registry:block",
  title: "Table: order lines",
  description: "An example of Table: order lines.",
  categories: ["table"],
  files: [{ path: "src/registry/keyline/examples/table-lines.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/table"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
