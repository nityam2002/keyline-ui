import type { KeylineItem } from "../../item";

export default {
  name: "date-range",
  type: "registry:ui",
  title: "Date range picker",
  description:
    "Range calendar on react-day-picker (pinned) styled as a Keyline grid: a flooded range with ink ends, row-break notches, hover and keyboard preview, hatched unavailable days, month and year dropdowns, min/max, presets and a day count.",
  files: [{ path: "src/registry/keyline/ui/date-range.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "react-day-picker"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/keyline-render",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/select",
    "@keyline-ui/calendar",
  ],
} satisfies KeylineItem;
