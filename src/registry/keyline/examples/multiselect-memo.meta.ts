import type { KeylineItem } from "../../item";

export default {
  name: "multiselect-memo",
  type: "registry:block",
  title: "Multiselect: memo recipients",
  description: "An example of Multiselect: memo recipients.",
  categories: ["multiselect"],
  files: [{ path: "src/registry/keyline/examples/multiselect-memo.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/multiselect"],
} satisfies KeylineItem;
