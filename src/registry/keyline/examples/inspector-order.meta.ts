import type { KeylineItem } from "../../item";

export default {
  name: "inspector-order",
  type: "registry:block",
  title: "Inspector: order inspector",
  description: "An example of Inspector: order inspector.",
  categories: ["inspector"],
  files: [{ path: "src/registry/keyline/examples/inspector-order.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: [
    "@keyline-ui/button",
    "@keyline-ui/inspector",
    "@keyline-ui/item",
    "@keyline-ui/keyline",
    "@keyline-ui/status",
  ],
} satisfies KeylineItem;
