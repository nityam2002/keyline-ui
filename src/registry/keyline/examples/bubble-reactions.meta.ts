import type { KeylineItem } from "../../item";

export default {
  name: "bubble-reactions",
  type: "registry:block",
  title: "Bubble: party announcement",
  description: "An example of Bubble: party announcement.",
  categories: ["bubble"],
  files: [{ path: "src/registry/keyline/examples/bubble-reactions.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/avatar", "@keyline-ui/bubble", "@keyline-ui/keyline", "@keyline-ui/message"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
