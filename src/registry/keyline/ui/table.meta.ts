import type { KeylineItem } from "../../item";

export default {
  name: "table",
  type: "registry:ui",
  title: "Table",
  description:
    "Presentational table parts on utilities: Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, TableSortHeader, TableBulkBar and TablePager, each with render and a className that may be a function of its state, plus the frame's views, toolbar, index column, expanded detail, empty/error rows and pagination. No part holds state.",
  whenToUse:
    "Use it to compose a table frame from parts while you keep the data and its state. For sorting, filtering, paging and selection worked out for you use Data table.",
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
  version: "1.0.1",
  updated: "2026-11-14",
  changelog: [
    {
      version: "1.0.1",
      date: "2026-11-14",
      note: "Scrolling the page over a table moves the page. Only the sideways scroll stays inside the grid; a vertical scroll the grid cannot take, or reaches the end of, passes to the page instead of stopping on the table.",
    },
    { version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." },
  ],
} satisfies KeylineItem;
