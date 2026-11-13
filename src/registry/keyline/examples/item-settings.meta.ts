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
} satisfies KeylineItem;
