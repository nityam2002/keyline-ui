import type { KeylineItem } from "../../item";

export default {
  name: "tooltip",
  type: "registry:ui",
  title: "Tooltip",
  description: "Ink label docked to the focus ring of its trigger, with an optional shortcut cell. Never cut.",
  whenToUse:
    "Use it to name what a control does, with its shortcut, on hover and focus. Never put the only copy of needed information in it; for a link preview use Hover card.",
  files: [{ path: "src/registry/keyline/ui/tooltip.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-scope", "@keyline-ui/keyline-render"],
} satisfies KeylineItem;
