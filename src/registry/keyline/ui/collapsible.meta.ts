import type { KeylineItem } from "../../item";

export default {
  name: "collapsible",
  type: "registry:ui",
  title: "Collapsible",
  description: "One unframed disclosure: a caret box whose keyline runs down the panel as a spine; the panel unfolds.",
  whenToUse:
    "Use it to hide less common settings or detail behind one disclosure. For several stacked sections use Accordion.",
  files: [{ path: "src/registry/keyline/ui/collapsible.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
