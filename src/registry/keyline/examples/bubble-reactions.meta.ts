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
} satisfies KeylineItem;
