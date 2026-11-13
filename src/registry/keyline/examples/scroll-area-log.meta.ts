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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
