import type { KeylineItem } from "../../item";

export default {
  name: "segmented",
  type: "registry:ui",
  title: "Segmented control",
  description: "Exclusive choice in one frame; the ink band stretches between cells.",
  files: [{ path: "src/registry/keyline/ui/segmented.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/segmented.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-motion", "@keyline-ui/scroll-edges"],
} satisfies KeylineItem;
