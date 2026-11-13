import type { KeylineItem } from "../../item";

export default {
  name: "context-menu-clients",
  type: "registry:block",
  title: "Context menu: client list",
  description: "An example of Context menu: client list.",
  categories: ["context-menu"],
  files: [{ path: "src/registry/keyline/examples/context-menu-clients.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/context-menu", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
