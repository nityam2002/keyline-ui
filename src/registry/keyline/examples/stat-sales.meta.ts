import type { KeylineItem } from "../../item";

export default {
  name: "stat-sales",
  type: "registry:block",
  title: "Stat: branch stats",
  description: "An example of Stat: branch stats.",
  categories: ["stat"],
  files: [{ path: "src/registry/keyline/examples/stat-sales.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/panel", "@keyline-ui/segmented", "@keyline-ui/stat"],
} satisfies KeylineItem;
