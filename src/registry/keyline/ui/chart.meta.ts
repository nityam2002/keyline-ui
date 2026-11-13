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
    // ChartFigure's table view draws with the table's cells (.kl-td), which shipments-demo also styles
    registryDependencies: ["@keyline-ui/table"],
  },
} satisfies KeylineItem;
