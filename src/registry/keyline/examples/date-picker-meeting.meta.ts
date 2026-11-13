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
} satisfies KeylineItem;
