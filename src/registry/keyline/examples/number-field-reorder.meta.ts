import type { KeylineItem } from "../../item";

export default {
  name: "number-field-reorder",
  type: "registry:block",
  title: "Number field: reorder",
  description: "An example of Number field: reorder.",
  categories: ["number-field"],
  files: [{ path: "src/registry/keyline/examples/number-field-reorder.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/number-field"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
