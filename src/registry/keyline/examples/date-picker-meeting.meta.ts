import type { KeylineItem } from "../../item";

export default {
  name: "date-picker-meeting",
  type: "registry:block",
  title: "Date picker: client meeting",
  description: "An example of Date picker: client meeting.",
  categories: ["date-picker"],
  files: [{ path: "src/registry/keyline/examples/date-picker-meeting.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/date-picker", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
