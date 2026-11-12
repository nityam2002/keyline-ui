import type { KeylineItem } from "../../item";

export default {
  name: "tooltip",
  type: "registry:ui",
  title: "Tooltip",
  description: "Ink label docked to the focus ring of its trigger, with an optional shortcut cell. Never cut.",
  files: [{ path: "src/registry/keyline/ui/tooltip.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/tooltip.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-scope"],
} satisfies KeylineItem;
