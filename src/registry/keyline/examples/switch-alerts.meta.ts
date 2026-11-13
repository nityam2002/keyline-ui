import type { KeylineItem } from "../../item";

export default {
  name: "switch-alerts",
  type: "registry:block",
  title: "Switch: alert settings",
  description: "An example of Switch: alert settings.",
  categories: ["switch"],
  files: [{ path: "src/registry/keyline/examples/switch-alerts.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/switch"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
