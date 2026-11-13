import type { KeylineItem } from "../../item";

export default {
  name: "time-field-delivery",
  type: "registry:block",
  title: "Time field: dock time",
  description: "An example of Time field: dock time.",
  categories: ["time-field"],
  files: [{ path: "src/registry/keyline/examples/time-field-delivery.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/time-field"],
} satisfies KeylineItem;
