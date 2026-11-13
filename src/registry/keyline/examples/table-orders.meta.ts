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
} satisfies KeylineItem;
