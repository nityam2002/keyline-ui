import type { KeylineItem } from "../../item";

export default {
  name: "radio-group-panel",
  type: "registry:block",
  title: "Radio group: paper weight",
  description: "An example of Radio group: paper weight.",
  categories: ["radio-group"],
  files: [{ path: "src/registry/keyline/examples/radio-group-panel.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/panel", "@keyline-ui/radio-group"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
