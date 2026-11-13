import type { KeylineItem } from "../../item";

export default {
  name: "empty-search",
  type: "registry:block",
  title: "Empty: client search",
  description: "An example of Empty: client search.",
  categories: ["empty"],
  files: [{ path: "src/registry/keyline/examples/empty-search.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/empty", "@keyline-ui/field", "@keyline-ui/keyline"],
} satisfies KeylineItem;
