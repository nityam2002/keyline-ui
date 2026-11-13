import type { KeylineItem } from "../../item";

export default {
  name: "toolbar",
  type: "registry:ui",
  title: "Toolbar",
  description:
    "A row of commands that is one Tab stop (Base UI Toolbar): item cells on shared seams, groups on a 2px keyline, toggles that flood, an exclusive group whose ink band stretches, menus docked to the frame, a text input cell; horizontal or vertical.",
  files: [{ path: "src/registry/keyline/ui/toolbar.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/scroll-edges",
    "@keyline-ui/menu",
    "@keyline-ui/keyline-render",
    "@keyline-ui/toolbar-overflow",
  ],
} satisfies KeylineItem;
