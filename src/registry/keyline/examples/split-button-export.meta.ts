import type { KeylineItem } from "../../item";

export default {
  name: "split-button-export",
  type: "registry:block",
  title: "Split button: export report",
  description: "An example of Split button: export report.",
  categories: ["split-button"],
  files: [{ path: "src/registry/keyline/examples/split-button-export.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/menu", "@keyline-ui/split-button"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
