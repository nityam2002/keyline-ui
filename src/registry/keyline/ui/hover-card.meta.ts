import type { KeylineItem } from "../../item";

export default {
  name: "hover-card",
  type: "registry:ui",
  title: "Hover card",
  description:
    "A link that previews its destination (Base UI Preview Card): the underline draws along its keyline during the open delay; the card is a control frame of cells (media, title, code, facts on seams) one gutter from the link. Supplementary content only.",
  files: [{ path: "src/registry/keyline/ui/hover-card.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-scope", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
