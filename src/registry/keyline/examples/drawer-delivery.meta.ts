import type { KeylineItem } from "../../item";

export default {
  name: "drawer-delivery",
  type: "registry:block",
  title: "Drawer: truck route",
  description: "An example of Drawer: truck route.",
  categories: ["drawer"],
  files: [{ path: "src/registry/keyline/examples/drawer-delivery.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/drawer", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
