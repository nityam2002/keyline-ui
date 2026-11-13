import type { KeylineItem } from "../../item";

export default {
  name: "menu-order-actions",
  type: "registry:block",
  title: "Menu: order actions",
  description: "An example of Menu: order actions.",
  categories: ["menu"],
  files: [{ path: "src/registry/keyline/examples/menu-order-actions.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/menu"],
} satisfies KeylineItem;
