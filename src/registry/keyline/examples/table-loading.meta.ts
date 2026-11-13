import type { KeylineItem } from "../../item";

export default {
  name: "table-loading",
  type: "registry:block",
  title: "Table: invoice table",
  description: "An example of Table: invoice table.",
  categories: ["table"],
  files: [{ path: "src/registry/keyline/examples/table-loading.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/table"],
} satisfies KeylineItem;
