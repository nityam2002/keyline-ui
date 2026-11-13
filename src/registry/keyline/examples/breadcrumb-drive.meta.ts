import type { KeylineItem } from "../../item";

export default {
  name: "breadcrumb-drive",
  type: "registry:block",
  title: "Breadcrumb: drive folder",
  description: "An example of Breadcrumb: drive folder.",
  categories: ["breadcrumb"],
  files: [{ path: "src/registry/keyline/examples/breadcrumb-drive.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/breadcrumb", "@keyline-ui/button", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
