import type { KeylineItem } from "../../item";

export default {
  name: "item-settings",
  type: "registry:block",
  title: "Item: alert settings",
  description: "An example of Item: alert settings.",
  categories: ["item"],
  files: [{ path: "src/registry/keyline/examples/item-settings.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/item", "@keyline-ui/keyline", "@keyline-ui/switch"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
