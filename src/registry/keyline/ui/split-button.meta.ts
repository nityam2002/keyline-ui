import type { KeylineItem } from "../../item";

export default {
  name: "split-button",
  type: "registry:ui",
  title: "Split button",
  description: "One control frame, two cells: the action and its menu. The menu docks to the frame.",
  files: [{ path: "src/registry/keyline/ui/split-button.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/menu", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
