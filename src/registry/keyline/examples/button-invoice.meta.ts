import type { KeylineItem } from "../../item";

export default {
  name: "button-invoice",
  type: "registry:block",
  title: "Button: invoice actions",
  description: "An example of Button: invoice actions.",
  categories: ["button"],
  files: [{ path: "src/registry/keyline/examples/button-invoice.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
