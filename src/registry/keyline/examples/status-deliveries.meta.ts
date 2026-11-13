import type { KeylineItem } from "../../item";

export default {
  name: "status-deliveries",
  type: "registry:block",
  title: "Status and badge: delivery board",
  description: "An example of Status and badge: delivery board.",
  categories: ["status"],
  files: [{ path: "src/registry/keyline/examples/status-deliveries.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/status"],
} satisfies KeylineItem;
