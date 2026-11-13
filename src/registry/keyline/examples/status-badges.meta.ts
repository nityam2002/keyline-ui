import type { KeylineItem } from "../../item";

export default {
  name: "status-badges",
  type: "registry:block",
  title: "Status and badge: invoice badges",
  description: "An example of Status and badge: invoice badges.",
  categories: ["status"],
  files: [{ path: "src/registry/keyline/examples/status-badges.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/status"],
} satisfies KeylineItem;
