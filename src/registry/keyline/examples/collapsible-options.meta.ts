import type { KeylineItem } from "../../item";

export default {
  name: "collapsible-options",
  type: "registry:block",
  title: "Collapsible: delivery options",
  description: "An example of Collapsible: delivery options.",
  categories: ["collapsible"],
  files: [{ path: "src/registry/keyline/examples/collapsible-options.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/collapsible", "@keyline-ui/field", "@keyline-ui/keyline", "@keyline-ui/switch"],
} satisfies KeylineItem;
