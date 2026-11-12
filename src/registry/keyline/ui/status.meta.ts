import type { KeylineItem } from "../../item";

export default {
  name: "status",
  type: "registry:ui",
  title: "Status and badge",
  description: "Status glyph + text (shape survives forced colours); square code badge.",
  files: [{ path: "src/registry/keyline/ui/status.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
} satisfies KeylineItem;
