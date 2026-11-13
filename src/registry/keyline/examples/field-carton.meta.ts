import type { KeylineItem } from "../../item";

export default {
  name: "field-carton",
  type: "registry:block",
  title: "Field: carton size",
  description: "An example of Field: carton size.",
  categories: ["field"],
  files: [{ path: "src/registry/keyline/examples/field-carton.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/field", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
