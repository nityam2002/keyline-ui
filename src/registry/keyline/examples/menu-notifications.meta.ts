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
} satisfies KeylineItem;
