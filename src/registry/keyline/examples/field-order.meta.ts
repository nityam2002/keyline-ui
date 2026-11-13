import type { KeylineItem } from "../../item";

export default {
  name: "field-order",
  type: "registry:block",
  title: "Field: new order",
  description: "An example of Field: new order.",
  categories: ["field"],
  files: [{ path: "src/registry/keyline/examples/field-order.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/field", "@keyline-ui/keyline"],
} satisfies KeylineItem;
