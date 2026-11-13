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
} satisfies KeylineItem;
