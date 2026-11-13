import type { KeylineItem } from "../../item";

export default {
  name: "button-retry",
  type: "registry:block",
  title: "Button: corporate sync",
  description: "An example of Button: corporate sync.",
  categories: ["button"],
  files: [{ path: "src/registry/keyline/examples/button-retry.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline"],
} satisfies KeylineItem;
