import type { KeylineItem } from "../../item";

export default {
  name: "number-field-price",
  type: "registry:block",
  title: "Number field: unit price",
  description: "An example of Number field: unit price.",
  categories: ["number-field"],
  files: [{ path: "src/registry/keyline/examples/number-field-price.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/number-field"],
} satisfies KeylineItem;
