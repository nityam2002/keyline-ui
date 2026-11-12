import type { KeylineItem } from "../../item";

export default {
  name: "button-group",
  type: "registry:ui",
  title: "Button group",
  description:
    "Buttons attached in one control frame: Button cells on shared seams, each its own Tab stop; text cells and a heavier separator; horizontal or vertical. Toolbar is the one-Tab-stop row; SplitButton the action with its menu.",
  files: [{ path: "src/registry/keyline/ui/button-group.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/button-group.css",
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/button", "utils"],
  requires: {
    // the group's CSS styles the Buttons placed in it (.kl-button-group > .kl-button-cell); its source never imports Button
    registryDependencies: ["@keyline-ui/button"],
  },
} satisfies KeylineItem;
