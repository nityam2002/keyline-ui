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
} satisfies KeylineItem;
