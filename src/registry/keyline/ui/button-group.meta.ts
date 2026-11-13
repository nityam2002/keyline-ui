import type { KeylineItem } from "../../item";

export default {
  name: "button-group",
  type: "registry:ui",
  title: "Button group",
  description:
    "Buttons attached in one control frame: Button cells on shared seams, each its own Tab stop; text cells and a heavier separator; horizontal or vertical. Toolbar is the one-Tab-stop row; SplitButton the action with its menu.",
  files: [{ path: "src/registry/keyline/ui/button-group.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/button", "@keyline-ui/keyline-render", "utils"],
  requires: {
    // the group styles the Buttons placed in it ([data-slot="button"][data-kl-layout="cell"]); its source never imports Button
    registryDependencies: ["@keyline-ui/button"],
  },
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
