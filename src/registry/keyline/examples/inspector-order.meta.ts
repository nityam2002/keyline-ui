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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
