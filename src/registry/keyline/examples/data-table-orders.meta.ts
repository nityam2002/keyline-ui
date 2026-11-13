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
} satisfies KeylineItem;
