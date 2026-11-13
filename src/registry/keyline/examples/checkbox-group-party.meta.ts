import type { KeylineItem } from "../../item";

export default {
  name: "checkbox-group-party",
  type: "registry:block",
  title: "Checkbox group: party supplies",
  description: "An example of Checkbox group: party supplies.",
  categories: ["checkbox-group"],
  files: [{ path: "src/registry/keyline/examples/checkbox-group-party.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: [
    "@keyline-ui/button",
    "@keyline-ui/checkbox-group",
    "@keyline-ui/field",
    "@keyline-ui/keyline",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
