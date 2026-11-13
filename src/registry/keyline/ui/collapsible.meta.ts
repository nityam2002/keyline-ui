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
} satisfies KeylineItem;
