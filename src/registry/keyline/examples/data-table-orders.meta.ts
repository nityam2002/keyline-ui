import type { KeylineItem } from "../../item";

export default {
  name: "data-table-orders",
  type: "registry:block",
  title: "Data Table: orders data table",
  description: "An example of Data Table: orders data table.",
  categories: ["data-table"],
  files: [{ path: "src/registry/keyline/examples/data-table-orders.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: [
    "@keyline-ui/button",
    "@keyline-ui/data-table",
    "@keyline-ui/keyline",
    "@keyline-ui/status",
    "@keyline-ui/table",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
