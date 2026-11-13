import type { KeylineItem } from "../../item";

export default {
  name: "status",
  type: "registry:ui",
  title: "Status and badge",
  description: "Status glyph + text (shape survives forced colours); square code badge.",
  whenToUse:
    "Use Status for a state in words with a glyph, and Badge for a short code label. For a message that needs explanation use Notice.",
  files: [{ path: "src/registry/keyline/ui/status.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
} satisfies KeylineItem;
