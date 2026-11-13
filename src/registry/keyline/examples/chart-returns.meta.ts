import type { KeylineItem } from "../../item";

export default {
  name: "chart-returns",
  type: "registry:block",
  title: "Chart: returns by client",
  description: "An example of Chart: returns by client.",
  categories: ["chart"],
  files: [{ path: "src/registry/keyline/examples/chart-returns.tsx", type: "registry:component" }],
  dependencies: ["recharts"],
  registryDependencies: ["@keyline-ui/chart", "@keyline-ui/keyline"],
} satisfies KeylineItem;
