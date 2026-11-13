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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
