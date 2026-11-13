import type { KeylineItem } from "../../item";

export default {
  name: "field-tracking",
  type: "registry:block",
  title: "Field: track shipment",
  description: "An example of Field: track shipment.",
  categories: ["field"],
  files: [{ path: "src/registry/keyline/examples/field-tracking.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/field", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
