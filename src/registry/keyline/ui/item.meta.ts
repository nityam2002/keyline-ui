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
} satisfies KeylineItem;
