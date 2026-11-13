import type { KeylineItem } from "../../item";

export default {
  name: "status",
  type: "registry:ui",
  title: "Status and badge",
  description: "Status glyph + text (shape survives forced colours); square code badge.",
  files: [{ path: "src/registry/keyline/ui/status.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
