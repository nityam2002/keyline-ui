import type { KeylineItem } from "../../item";

export default {
  name: "menu",
  type: "registry:ui",
  title: "Menu",
  description:
    "Docked menu with code cells, shortcut cells, ink cursor, destructive rows, checkbox and radio items, and submenus.",
  whenToUse:
    "Use it for a list of commands opened from a trigger, with submenus and checkbox or radio rows. For choosing a form value use Select; for commands on an object use Context menu.",
  files: [{ path: "src/registry/keyline/ui/menu.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-scope", "@keyline-ui/keyline-render"],
} satisfies KeylineItem;
