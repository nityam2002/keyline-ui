import type { KeylineItem } from "../../item";

export default {
  name: "date-picker-delivery",
  type: "registry:block",
  title: "Date picker: delivery day",
  description: "An example of Date picker: delivery day.",
  categories: ["date-picker"],
  files: [{ path: "src/registry/keyline/examples/date-picker-delivery.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/date-picker", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
