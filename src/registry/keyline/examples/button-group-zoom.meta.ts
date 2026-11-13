import type { KeylineItem } from "../../item";

export default {
  name: "button-group-zoom",
  type: "registry:block",
  title: "Button group: report zoom",
  description: "An example of Button group: report zoom.",
  categories: ["button-group"],
  files: [{ path: "src/registry/keyline/examples/button-group-zoom.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/button-group", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
