import type { KeylineItem } from "../../item";

export default {
  name: "table",
  type: "registry:ui",
  title: "Table",
  description:
    "Table frame parts: tabs, toolbar, bulk bar, index column, sortable headers, expanded detail, empty/error rows, pager.",
  files: [{ path: "src/registry/keyline/ui/table.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/table.css",
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/scroll-area",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/checkbox",
    "@keyline-ui/tabs",
    "@keyline-ui/status",
    "@keyline-ui/empty",
    "@keyline-ui/toolbar",
    "@keyline-ui/collection",
  ],
} satisfies KeylineItem;
