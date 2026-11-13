import type { KeylineItem } from "../../item";

export default {
  name: "item",
  type: "registry:ui",
  title: "Item",
  description:
    "List rows on shared keylines: media cell, content, meta and action cells; render-prop rows for links and buttons.",
  whenToUse:
    "Use it for lists of rows with media, content, a value and controls, where a row may be a link or a button. For tabular data with columns use Table.",
  files: [{ path: "src/registry/keyline/ui/item.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
