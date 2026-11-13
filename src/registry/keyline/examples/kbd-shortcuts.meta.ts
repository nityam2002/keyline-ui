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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
