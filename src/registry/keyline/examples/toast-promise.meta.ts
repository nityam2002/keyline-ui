import type { KeylineItem } from "../../item";

export default {
  name: "toast-promise",
  type: "registry:block",
  title: "Toast: send report",
  description: "An example of Toast: send report.",
  categories: ["toast"],
  files: [{ path: "src/registry/keyline/examples/toast-promise.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/toast"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
