import type { KeylineItem } from "../../item";

export default {
  name: "stat",
  type: "registry:ui",
  title: "Stat",
  description: "Count voice with label, unit, delta signal and an optional meter.",
  files: [{ path: "src/registry/keyline/ui/stat.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/stat.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils"],
} satisfies KeylineItem;
