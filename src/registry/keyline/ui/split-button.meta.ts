import type { KeylineItem } from "../../item";

export default {
  name: "split-button",
  type: "registry:ui",
  title: "Split button",
  description: "One control frame, two cells: the action and its menu. The menu docks to the frame.",
  whenToUse:
    "Use it when one action is usual and a few alternatives belong with it. For unrelated commands use Menu or Button group.",
  files: [{ path: "src/registry/keyline/ui/split-button.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/menu", "@keyline-ui/keyline-render"],
} satisfies KeylineItem;
