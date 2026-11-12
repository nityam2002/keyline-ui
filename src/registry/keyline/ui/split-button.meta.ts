import type { KeylineItem } from "../../item";

export default {
  name: "split-button",
  type: "registry:ui",
  title: "Split button",
  description: "One control frame, two cells: the action and its menu. The menu docks to the frame.",
  files: [{ path: "src/registry/keyline/ui/split-button.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/split-button.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/menu"],
} satisfies KeylineItem;
