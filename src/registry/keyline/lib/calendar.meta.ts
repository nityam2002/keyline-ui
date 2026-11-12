import type { KeylineItem } from "../../item";

export default {
  name: "calendar",
  type: "registry:lib",
  title: "Calendar logic",
  description:
    "Pure range helpers: ordering, available-day count and locale-aware range formatting. The grid and keyboard are react-day-picker's.",
  files: [{ path: "src/registry/keyline/lib/calendar.ts", type: "registry:lib" }],
} satisfies KeylineItem;
