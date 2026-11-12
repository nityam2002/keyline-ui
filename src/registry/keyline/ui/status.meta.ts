import type { KeylineItem } from "../../item";

export default {
  name: "status",
  type: "registry:ui",
  title: "Status and badge",
  description: "Status glyph + text (shape survives forced colours); square code badge.",
  files: [{ path: "src/registry/keyline/ui/status.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/status.css",
  registryDependencies: ["@keyline-ui/keyline", "utils"],
} satisfies KeylineItem;
