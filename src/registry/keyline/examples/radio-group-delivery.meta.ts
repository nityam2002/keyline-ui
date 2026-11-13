import type { KeylineItem } from "../../item";

export default {
  name: "radio-group-delivery",
  type: "registry:block",
  title: "Radio group: delivery choice",
  description: "An example of Radio group: delivery choice.",
  categories: ["radio-group"],
  files: [{ path: "src/registry/keyline/examples/radio-group-delivery.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/radio-group"],
} satisfies KeylineItem;
