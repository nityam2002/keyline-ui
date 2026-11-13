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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
