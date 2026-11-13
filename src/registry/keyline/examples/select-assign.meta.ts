import type { KeylineItem } from "../../item";

export default {
  name: "select-assign",
  type: "registry:block",
  title: "Select: assign lead",
  description: "An example of Select: assign lead.",
  categories: ["select"],
  files: [{ path: "src/registry/keyline/examples/select-assign.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/select"],
} satisfies KeylineItem;
