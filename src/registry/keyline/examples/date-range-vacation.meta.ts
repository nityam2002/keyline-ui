import type { KeylineItem } from "../../item";

export default {
  name: "date-range-vacation",
  type: "registry:block",
  title: "Date range picker: vacation request",
  description: "An example of Date range picker: vacation request.",
  categories: ["date-range"],
  files: [{ path: "src/registry/keyline/examples/date-range-vacation.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/date-range", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
