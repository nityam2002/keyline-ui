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
} satisfies KeylineItem;
