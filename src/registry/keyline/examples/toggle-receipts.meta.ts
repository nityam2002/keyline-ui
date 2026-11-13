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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
