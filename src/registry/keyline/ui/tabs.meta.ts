import type { KeylineItem } from "../../item";

export default {
  name: "tabs",
  type: "registry:ui",
  title: "Tabs",
  description: "Tabs with a cobalt location band that stretches; optional count voice; panels.",
  files: [{ path: "src/registry/keyline/ui/tabs.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/tabs.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-motion", "@keyline-ui/scroll-edges"],
} satisfies KeylineItem;
