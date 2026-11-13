import type { KeylineItem } from "../../item";

export default {
  name: "number-field-reorder",
  type: "registry:block",
  title: "Number field: reorder",
  description: "An example of Number field: reorder.",
  categories: ["number-field"],
  files: [{ path: "src/registry/keyline/examples/number-field-reorder.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/number-field"],
} satisfies KeylineItem;
