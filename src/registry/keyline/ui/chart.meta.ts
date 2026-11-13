import type { KeylineItem } from "../../item";

export default {
  name: "chart",
  type: "registry:ui",
  title: "Chart",
  description:
    "Charts on recharts, as the reference: series colours by role from the data tokens (focal, comparison, rest, mark, alert) as --color-<key>; solid hairline grid, Code-voice ticks, square marks and keys, an inverse tooltip with tabular figures. ChartFigure adds a title and a Chart / Table switch over the same rows. RTL axes and reduced motion are applied for you.",
  files: [{ path: "src/registry/keyline/ui/chart.tsx", type: "registry:ui" }],
  dependencies: ["recharts", "@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "@keyline-ui/table",
    "utils",
    "@keyline-ui/segmented",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/keyline-render",
  ],
  requires: {
    // ChartFigure's table view is built from the table's parts (Table, TableHead, TableCell)
    registryDependencies: ["@keyline-ui/table"],
  },
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
