import type { KeylineItem } from "../../item";

export default {
  name: "switch",
  type: "registry:ui",
  title: "Switch",
  description: "Binary setting: a two-cell frame whose block stretches to the on side.",
  files: [{ path: "src/registry/keyline/ui/switch.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/switch.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/checkbox"],
} satisfies KeylineItem;
