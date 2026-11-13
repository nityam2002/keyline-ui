import type { KeylineItem } from "../../item";

export default {
  name: "accordion-policies",
  type: "registry:block",
  title: "Accordion: branch policies",
  description: "An example of Accordion: branch policies.",
  categories: ["accordion"],
  files: [{ path: "src/registry/keyline/examples/accordion-policies.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/accordion", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
