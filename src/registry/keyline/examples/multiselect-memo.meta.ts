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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
