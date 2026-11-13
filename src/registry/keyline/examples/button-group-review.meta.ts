import type { KeylineItem } from "../../item";

export default {
  name: "button-group-review",
  type: "registry:block",
  title: "Button group: order review",
  description: "An example of Button group: order review.",
  categories: ["button-group"],
  files: [{ path: "src/registry/keyline/examples/button-group-review.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/button-group", "@keyline-ui/keyline"],
} satisfies KeylineItem;
