import type { KeylineItem } from "../../item";

export default {
  name: "popover-note",
  type: "registry:block",
  title: "Popover: delivery note",
  description: "An example of Popover: delivery note.",
  categories: ["popover"],
  files: [{ path: "src/registry/keyline/examples/popover-note.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/field", "@keyline-ui/keyline", "@keyline-ui/popover"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
