import type { KeylineItem } from "../../item";

export default {
  name: "stat",
  type: "registry:ui",
  title: "Stat",
  description: "Count voice with label, unit, delta signal and an optional meter.",
  files: [{ path: "src/registry/keyline/ui/stat.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
} satisfies KeylineItem;
