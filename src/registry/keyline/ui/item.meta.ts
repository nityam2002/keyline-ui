import type { KeylineItem } from "../../item";

export default {
  name: "item",
  type: "registry:ui",
  title: "Item",
  description:
    "List rows on shared keylines: media cell, content, meta and action cells; render-prop rows for links and buttons.",
  files: [{ path: "src/registry/keyline/ui/item.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/item.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils"],
} satisfies KeylineItem;
