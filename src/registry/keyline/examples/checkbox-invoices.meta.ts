import type { KeylineItem } from "../../item";

export default {
  name: "checkbox-invoices",
  type: "registry:block",
  title: "Checkbox: print invoices",
  description: "An example of Checkbox: print invoices.",
  categories: ["checkbox"],
  files: [{ path: "src/registry/keyline/examples/checkbox-invoices.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/checkbox", "@keyline-ui/keyline"],
} satisfies KeylineItem;
