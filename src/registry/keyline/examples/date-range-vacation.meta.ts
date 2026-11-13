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
} satisfies KeylineItem;
