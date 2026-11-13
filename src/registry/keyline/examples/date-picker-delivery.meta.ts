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
} satisfies KeylineItem;
