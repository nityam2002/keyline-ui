import type { KeylineItem } from "../../item";

export default {
  name: "status-badges",
  type: "registry:block",
  title: "Status and badge: invoice badges",
  description: "An example of Status and badge: invoice badges.",
  categories: ["status"],
  files: [{ path: "src/registry/keyline/examples/status-badges.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/status"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
