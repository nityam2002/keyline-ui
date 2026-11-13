import type { KeylineItem } from "../../item";

export default {
  name: "menu-notifications",
  type: "registry:block",
  title: "Menu: notification menu",
  description: "An example of Menu: notification menu.",
  categories: ["menu"],
  files: [{ path: "src/registry/keyline/examples/menu-notifications.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/menu"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
