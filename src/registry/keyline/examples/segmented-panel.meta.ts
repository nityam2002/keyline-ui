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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
