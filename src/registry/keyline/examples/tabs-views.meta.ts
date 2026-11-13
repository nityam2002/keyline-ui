import type { KeylineItem } from "../../item";

export default {
  name: "tabs-views",
  type: "registry:block",
  title: "Tabs: call views",
  description: "An example of Tabs: call views.",
  categories: ["tabs"],
  files: [{ path: "src/registry/keyline/examples/tabs-views.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/tabs"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
