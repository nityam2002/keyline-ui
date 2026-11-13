import type { KeylineItem } from "../../item";

export default {
  name: "checkbox-invoices",
  type: "registry:block",
  title: "Checkbox: print invoices",
  description: "An example of Checkbox: print invoices.",
  categories: ["checkbox"],
  files: [{ path: "src/registry/keyline/examples/checkbox-invoices.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/checkbox", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
