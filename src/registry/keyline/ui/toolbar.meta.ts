import type { KeylineItem } from "../../item";

export default {
  name: "toolbar",
  type: "registry:ui",
  title: "Toolbar",
  description:
    "A row of commands that is one Tab stop (Base UI Toolbar): item cells on shared seams, groups on a 2px keyline, toggles that flood, an exclusive group whose ink band stretches, menus docked to the frame, a text input cell; horizontal or vertical.",
  whenToUse:
    "Use it for a row of commands that is one Tab stop and folds secondary controls into a More menu when narrow. For a few buttons that each take a Tab stop use Button group.",
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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
