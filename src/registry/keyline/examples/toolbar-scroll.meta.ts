import type { KeylineItem } from "../../item";

export default {
  name: "toolbar-scroll",
  type: "registry:block",
  title: "Toolbar: order commands",
  description: "An example of Toolbar: order commands.",
  categories: ["toolbar"],
  files: [{ path: "src/registry/keyline/examples/toolbar-scroll.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/toolbar"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
