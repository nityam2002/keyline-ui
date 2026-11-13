import type { KeylineItem } from "../../item";

export default {
  name: "scroll-area-log",
  type: "registry:block",
  title: "Scroll Area: activity log",
  description: "An example of Scroll Area: activity log.",
  categories: ["scroll-area"],
  files: [{ path: "src/registry/keyline/examples/scroll-area-log.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/item", "@keyline-ui/keyline", "@keyline-ui/panel", "@keyline-ui/scroll-area"],
} satisfies KeylineItem;
