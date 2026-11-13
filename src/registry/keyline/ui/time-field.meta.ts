import type { KeylineItem } from "../../item";

export default {
  name: "time-field",
  type: "registry:ui",
  title: "Time field",
  description:
    'A time of day in one field frame: hour and minute spin-button cells that wrap, a day-period cell on a 12-hour clock, a zone affix, optional min/max bounds; the 24-hour "HH:MM" value reaches Base UI Form and FormData.',
  whenToUse: "Use it to type a time of day in parts. For a day from a calendar use Date picker.",
  files: [{ path: "src/registry/keyline/ui/time-field.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/field"],
} satisfies KeylineItem;
