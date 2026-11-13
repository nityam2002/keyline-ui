import type { KeylineItem } from "../../item";

export default {
  name: "toggle-group-reps",
  type: "registry:block",
  title: "Toggle group: orders by rep",
  description: "An example of Toggle group: orders by rep.",
  categories: ["toggle-group"],
  files: [{ path: "src/registry/keyline/examples/toggle-group-reps.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/toggle-group"],
} satisfies KeylineItem;
