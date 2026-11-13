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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
