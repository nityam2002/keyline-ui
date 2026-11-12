import type { KeylineItem } from "../../item";

export default {
  name: "menu",
  type: "registry:ui",
  title: "Menu",
  description:
    "Docked menu with code cells, shortcut cells, ink cursor, destructive rows, checkbox and radio items, and submenus.",
  files: [{ path: "src/registry/keyline/ui/menu.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/menu.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-scope"],
} satisfies KeylineItem;
