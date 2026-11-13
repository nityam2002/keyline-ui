import type { KeylineItem } from "../../item";

export default {
  name: "menubar",
  type: "registry:ui",
  title: "Menubar",
  description:
    "A row of menus in one frame (Base UI Menubar): title key cells, the open title inverse, menus docked to the frame's edge with Menu's rows and checkbox and radio items.",
  whenToUse:
    "Use it for a desktop-style row of menus in an application, such as File, Edit and View. For a website's navigation use Navigation menu; for a row of commands use Toolbar.",
  files: [{ path: "src/registry/keyline/ui/menubar.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/scroll-edges",
    "@keyline-ui/menu",
    "@keyline-ui/keyline-render",
  ],
} satisfies KeylineItem;
