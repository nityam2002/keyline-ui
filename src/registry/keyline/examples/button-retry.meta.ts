import type { KeylineItem } from "../../item";

export default {
  name: "button-retry",
  type: "registry:block",
  title: "Button: corporate sync",
  description: "An example of Button: corporate sync.",
  categories: ["button"],
  files: [{ path: "src/registry/keyline/examples/button-retry.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
