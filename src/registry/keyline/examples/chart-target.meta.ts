import type { KeylineItem } from "../../item";

export default {
  name: "chart-target",
  type: "registry:block",
  title: "Chart: weekly target",
  description: "An example of Chart: weekly target.",
  categories: ["chart"],
  files: [{ path: "src/registry/keyline/examples/chart-target.tsx", type: "registry:component" }],
  dependencies: ["recharts"],
  registryDependencies: ["@keyline-ui/chart", "@keyline-ui/keyline"],
} satisfies KeylineItem;
