import type { KeylineItem } from "../../item";

export default {
  name: "empty-calls",
  type: "registry:block",
  title: "Empty: call log",
  description: "An example of Empty: call log.",
  categories: ["empty"],
  files: [{ path: "src/registry/keyline/examples/empty-calls.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/empty", "@keyline-ui/keyline"],
} satisfies KeylineItem;
