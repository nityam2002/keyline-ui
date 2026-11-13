import type { KeylineItem } from "../../item";

export default {
  name: "button-invoice",
  type: "registry:block",
  title: "Button: invoice actions",
  description: "An example of Button: invoice actions.",
  categories: ["button"],
  files: [{ path: "src/registry/keyline/examples/button-invoice.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline"],
} satisfies KeylineItem;
