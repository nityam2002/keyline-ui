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
} satisfies KeylineItem;
