import type { KeylineItem } from "../../item";

export default {
  name: "number-field-price",
  type: "registry:block",
  title: "Number field: unit price",
  description: "An example of Number field: unit price.",
  categories: ["number-field"],
  files: [{ path: "src/registry/keyline/examples/number-field-price.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/number-field"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
