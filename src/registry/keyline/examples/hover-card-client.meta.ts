import type { KeylineItem } from "../../item";

export default {
  name: "hover-card-client",
  type: "registry:block",
  title: "Hover card: client cards",
  description: "An example of Hover card: client cards.",
  categories: ["hover-card"],
  files: [{ path: "src/registry/keyline/examples/hover-card-client.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/avatar", "@keyline-ui/hover-card", "@keyline-ui/keyline", "@keyline-ui/status"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
