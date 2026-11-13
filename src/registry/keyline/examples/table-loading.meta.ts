import type { KeylineItem } from "../../item";

export default {
  name: "table-loading",
  type: "registry:block",
  title: "Table: invoice table",
  description: "An example of Table: invoice table.",
  categories: ["table"],
  files: [{ path: "src/registry/keyline/examples/table-loading.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/table"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
