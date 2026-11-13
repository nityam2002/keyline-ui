import type { KeylineItem } from "../../item";

export default {
  name: "table-orders",
  type: "registry:block",
  title: "Table: open orders",
  description: "An example of Table: open orders.",
  categories: ["table"],
  files: [{ path: "src/registry/keyline/examples/table-orders.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/status", "@keyline-ui/table"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
