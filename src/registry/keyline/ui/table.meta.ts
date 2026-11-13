import type { KeylineItem } from "../../item";

export default {
  name: "table",
  type: "registry:ui",
  title: "Table",
  description:
    "Presentational table parts on utilities: Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, TableSortHeader, TableBulkBar and TablePager, each with render and a className that may be a function of its state, plus the frame's views, toolbar, index column, expanded detail, empty/error rows and pagination. No part holds state.",
  files: [{ path: "src/registry/keyline/ui/table.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-render",
    "@keyline-ui/scroll-area",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/checkbox",
    "@keyline-ui/tabs",
    "@keyline-ui/status",
    "@keyline-ui/empty",
    "@keyline-ui/toolbar",
    "@keyline-ui/collection",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
