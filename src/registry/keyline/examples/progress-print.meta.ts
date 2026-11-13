import type { KeylineItem } from "../../item";

export default {
  name: "progress-print",
  type: "registry:block",
  title: "Progress: print invoices",
  description: "An example of Progress: print invoices.",
  categories: ["progress"],
  files: [{ path: "src/registry/keyline/examples/progress-print.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/progress"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
