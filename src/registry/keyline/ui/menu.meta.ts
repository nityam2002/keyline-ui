import type { KeylineItem } from "../../item";

export default {
  name: "menu",
  type: "registry:ui",
  title: "Menu",
  description:
    "Docked menu with code cells, shortcut cells, ink cursor, destructive rows, checkbox and radio items, and submenus.",
  files: [{ path: "src/registry/keyline/ui/menu.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-scope", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
