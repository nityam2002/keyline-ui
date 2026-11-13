import type { KeylineItem } from "../../item";

export default {
  name: "date-picker",
  type: "registry:ui",
  title: "Date picker",
  description:
    "Single-date calendar and picker on react-day-picker, sharing the range calendar's look, wording and bounds; the chosen day floods ink. DateTimePicker adds a time row (a TimeField cell, 24- or 12-hour, with optional minTime/maxTime) under the calendar.",
  whenToUse:
    "Use it to choose one day, or a day and time, from a calendar docked to its field. For a first and last day use Date range; for a time alone use Time field.",
  files: [{ path: "src/registry/keyline/ui/date-picker.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "react-day-picker"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/keyline-render",
    "@keyline-ui/calendar",
    "@keyline-ui/date-range",
    "@keyline-ui/field",
    "@keyline-ui/time-field",
  ],
} satisfies KeylineItem;
