import type { KeylineItem } from "../../item";

export default {
  name: "shipments-block",
  type: "registry:block",
  title: "Blocks: shipments block",
  description: "An example of Blocks: shipments block.",
  categories: ["guide"],
  files: [{ path: "src/registry/keyline/examples/shipments-block.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/shipments-demo"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
