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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
