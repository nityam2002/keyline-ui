import type { KeylineItem } from "../../item";

export default {
  name: "inspector",
  type: "registry:ui",
  title: "Inspector",
  description:
    "Non-modal contextual panel: header with the inspected object's code, key/value cells and a sticky action strip.",
  whenToUse:
    "Use it to show the chosen record of a list in a panel beside it, without blocking the page. For a modal task use Dialog; for detail docked to the page edge use Sheet.",
  files: [{ path: "src/registry/keyline/ui/inspector.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render", "@keyline-ui/scroll-area"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
