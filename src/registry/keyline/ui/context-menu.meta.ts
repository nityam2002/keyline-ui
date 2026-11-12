import type { KeylineItem } from "../../item";

export default {
  name: "context-menu",
  type: "registry:ui",
  title: "Context menu",
  description:
    "Menu opened on an object (right-click, long-press, Menu key): Menu's rows and submenus; marks the object while open.",
  files: [{ path: "src/registry/keyline/ui/context-menu.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/menu",
    "@keyline-ui/keyline-render",
  ],
} satisfies KeylineItem;
