import type { KeylineItem } from "../../item";

export default {
  name: "context-menu",
  type: "registry:ui",
  title: "Context menu",
  description:
    "Menu opened on an object (right-click, long-press, Menu key): Menu's rows and submenus; marks the object while open.",
  whenToUse:
    "Use it for commands on an object opened by right-click, long-press or Shift+F10. For a menu opened from a visible trigger use Menu.",
  files: [{ path: "src/registry/keyline/ui/context-menu.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/menu",
    "@keyline-ui/keyline-render",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
