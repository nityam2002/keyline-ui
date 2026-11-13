import type { KeylineItem } from "../../item";

export default {
  name: "toggle-group-panel",
  type: "registry:block",
  title: "Toggle group: supply room",
  description: "An example of Toggle group: supply room.",
  categories: ["toggle-group"],
  files: [{ path: "src/registry/keyline/examples/toggle-group-panel.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/panel", "@keyline-ui/toggle-group"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
