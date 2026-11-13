import type { KeylineItem } from "../../item";

export default {
  name: "time-field-delivery",
  type: "registry:block",
  title: "Time field: dock time",
  description: "An example of Time field: dock time.",
  categories: ["time-field"],
  files: [{ path: "src/registry/keyline/examples/time-field-delivery.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/time-field"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
