import type { KeylineItem } from "../../item";

export default {
  name: "button-group-zoom",
  type: "registry:block",
  title: "Button group: report zoom",
  description: "An example of Button group: report zoom.",
  categories: ["button-group"],
  files: [{ path: "src/registry/keyline/examples/button-group-zoom.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/button-group", "@keyline-ui/keyline"],
} satisfies KeylineItem;
