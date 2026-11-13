import type { KeylineItem } from "../../item";

export default {
  name: "button-variants",
  type: "registry:block",
  title: "Button: expense review",
  description: "An example of Button: expense review.",
  categories: ["button"],
  files: [{ path: "src/registry/keyline/examples/button-variants.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
