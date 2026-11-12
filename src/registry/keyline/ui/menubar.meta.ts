import type { KeylineItem } from "../../item";

export default {
  name: "menubar",
  type: "registry:ui",
  title: "Menubar",
  description:
    "A row of menus in one frame (Base UI Menubar): title key cells, the open title inverse, menus docked to the frame's edge with Menu's rows and checkbox and radio items.",
  files: [{ path: "src/registry/keyline/ui/menubar.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/menubar.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/scroll-edges",
    "@keyline-ui/menu",
  ],
} satisfies KeylineItem;
