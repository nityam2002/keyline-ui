import type { KeylineItem } from "../../item";

export default {
  name: "button-affix",
  type: "registry:block",
  title: "Button: warehouse queue",
  description: "An example of Button: warehouse queue.",
  categories: ["button"],
  files: [{ path: "src/registry/keyline/examples/button-affix.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline"],
} satisfies KeylineItem;
