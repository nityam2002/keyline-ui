import type { KeylineItem } from "../../item";

export default {
  name: "sheet",
  type: "registry:ui",
  title: "Sheet",
  description:
    "A region docked to a viewport edge (end, start, bottom): Base UI Dialog behaviour, unfolds from its edge, cut on the inner corner.",
  whenToUse:
    "Use it for the detail of one thing opened from a list, docked to an edge at full height. For a short blocking task use Dialog; for a non-blocking side panel use Inspector.",
  files: [{ path: "src/registry/keyline/ui/sheet.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/keyline-render",
    "@keyline-ui/dialog",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
