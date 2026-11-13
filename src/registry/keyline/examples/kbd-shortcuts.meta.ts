import type { KeylineItem } from "../../item";

export default {
  name: "kbd-shortcuts",
  type: "registry:block",
  title: "Kbd: order shortcuts",
  description: "An example of Kbd: order shortcuts.",
  categories: ["kbd"],
  files: [{ path: "src/registry/keyline/examples/kbd-shortcuts.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/kbd", "@keyline-ui/keyline"],
} satisfies KeylineItem;
