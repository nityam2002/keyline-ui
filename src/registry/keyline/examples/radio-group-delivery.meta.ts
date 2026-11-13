import type { KeylineItem } from "../../item";

export default {
  name: "radio-group-delivery",
  type: "registry:block",
  title: "Radio group: delivery choice",
  description: "An example of Radio group: delivery choice.",
  categories: ["radio-group"],
  files: [{ path: "src/registry/keyline/examples/radio-group-delivery.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/radio-group"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
