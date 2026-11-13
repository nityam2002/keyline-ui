import type { KeylineItem } from "../../item";

export default {
  name: "chart-sales",
  type: "registry:block",
  title: "Chart: sales by rep",
  description: "An example of Chart: sales by rep.",
  categories: ["chart"],
  files: [{ path: "src/registry/keyline/examples/chart-sales.tsx", type: "registry:component" }],
  dependencies: ["recharts"],
  registryDependencies: ["@keyline-ui/chart", "@keyline-ui/keyline"],
} satisfies KeylineItem;
