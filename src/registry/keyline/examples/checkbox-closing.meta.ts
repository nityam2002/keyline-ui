import type { KeylineItem } from "../../item";

export default {
  name: "checkbox-closing",
  type: "registry:block",
  title: "Checkbox: closing checklist",
  description: "An example of Checkbox: closing checklist.",
  categories: ["checkbox"],
  files: [{ path: "src/registry/keyline/examples/checkbox-closing.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/checkbox", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
