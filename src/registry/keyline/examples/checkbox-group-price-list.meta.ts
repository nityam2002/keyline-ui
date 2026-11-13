import type { KeylineItem } from "../../item";

export default {
  name: "checkbox-group-price-list",
  type: "registry:block",
  title: "Checkbox group: price list recipients",
  description: "An example of Checkbox group: price list recipients.",
  categories: ["checkbox-group"],
  files: [{ path: "src/registry/keyline/examples/checkbox-group-price-list.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/checkbox-group", "@keyline-ui/keyline"],
} satisfies KeylineItem;
