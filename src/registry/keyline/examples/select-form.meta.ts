import type { KeylineItem } from "../../item";

export default {
  name: "select-form",
  type: "registry:block",
  title: "Select: quote form",
  description: "An example of Select: quote form.",
  categories: ["select"],
  files: [{ path: "src/registry/keyline/examples/select-form.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/field", "@keyline-ui/keyline", "@keyline-ui/select"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
