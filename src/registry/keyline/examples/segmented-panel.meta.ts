import type { KeylineItem } from "../../item";

export default {
  name: "segmented-panel",
  type: "registry:block",
  title: "Segmented control: leaderboard",
  description: "An example of Segmented control: leaderboard.",
  categories: ["segmented"],
  files: [{ path: "src/registry/keyline/examples/segmented-panel.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/panel", "@keyline-ui/segmented"],
} satisfies KeylineItem;
