import type { KeylineItem } from "../../item";

export default {
  name: "dialog-new-client",
  type: "registry:block",
  title: "Dialog: new client",
  description: "An example of Dialog: new client.",
  categories: ["dialog"],
  files: [{ path: "src/registry/keyline/examples/dialog-new-client.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/dialog", "@keyline-ui/field", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
