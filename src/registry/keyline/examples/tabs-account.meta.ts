import type { KeylineItem } from "../../item";

export default {
  name: "tabs-account",
  type: "registry:block",
  title: "Tabs: client account",
  description: "An example of Tabs: client account.",
  categories: ["tabs"],
  files: [{ path: "src/registry/keyline/examples/tabs-account.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/tabs"],
} satisfies KeylineItem;
