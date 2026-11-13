import type { KeylineItem } from "../../item";

export default {
  name: "theming-roles",
  type: "registry:block",
  title: "Theming: role cards",
  description: "An example of Theming: role cards.",
  categories: ["guide"],
  files: [{ path: "src/registry/keyline/examples/theming-roles.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
