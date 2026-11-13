import type { KeylineItem } from "../../item";

export default {
  name: "toggle-receipts",
  type: "registry:block",
  title: "Toggle: expense filter",
  description: "An example of Toggle: expense filter.",
  categories: ["toggle"],
  files: [{ path: "src/registry/keyline/examples/toggle-receipts.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/toggle"],
} satisfies KeylineItem;
