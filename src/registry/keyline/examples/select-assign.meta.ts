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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
