import type { KeylineItem } from "../../item";

export default {
  name: "field-carton",
  type: "registry:block",
  title: "Field: carton size",
  description: "An example of Field: carton size.",
  categories: ["field"],
  files: [{ path: "src/registry/keyline/examples/field-carton.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/field", "@keyline-ui/keyline"],
} satisfies KeylineItem;
