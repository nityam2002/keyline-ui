import type { KeylineItem } from "../../item";

export default {
  name: "toggle-group",
  type: "registry:ui",
  title: "Toggle group",
  description: "Independent toggles in one frame; each cell floods from the press point and carries a lamp.",
  files: [{ path: "src/registry/keyline/ui/toggle-group.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/toggle-group.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/toggle",
    "@keyline-ui/scroll-edges",
    "@keyline-ui/keyline-scope",
  ],
} satisfies KeylineItem;
