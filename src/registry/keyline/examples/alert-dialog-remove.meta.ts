import type { KeylineItem } from "../../item";

export default {
  name: "alert-dialog-remove",
  type: "registry:block",
  title: "Alert dialog: remove client",
  description: "An example of Alert dialog: remove client.",
  categories: ["alert-dialog"],
  files: [{ path: "src/registry/keyline/examples/alert-dialog-remove.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/dialog", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
