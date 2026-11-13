import type { KeylineItem } from "../../item";

export default {
  name: "command",
  type: "registry:ui",
  title: "Command menu",
  description: "⌘K command menu: digit cells run by index, grouped results, empty state.",
  files: [{ path: "src/registry/keyline/ui/command.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "cmdk"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/kbd",
    "@keyline-ui/dialog",
    "@keyline-ui/keyline-render",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
