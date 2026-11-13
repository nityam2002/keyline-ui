import type { KeylineItem } from "../../item";

export default {
  name: "chart",
  type: "registry:ui",
  title: "Chart",
  description:
    "Charts on recharts, as the reference: series colours by role from the data tokens (focal, comparison, rest, mark, alert) as --color-<key>; solid hairline grid, Code-voice ticks, square marks and keys, an inverse tooltip with tabular figures. ChartFigure adds a title and a Chart / Table switch over the same rows. RTL axes and reduced motion are applied for you.",
  whenToUse:
    "Use it to plot numbers with Recharts in Keyline's construction, with a Table view of the same rows. For one headline figure use Stat; for progress of a task use Progress.",
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
} satisfies KeylineItem;
