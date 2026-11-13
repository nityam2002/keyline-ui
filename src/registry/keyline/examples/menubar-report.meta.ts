import type { KeylineItem } from "../../item";

export default {
  name: "menubar-report",
  type: "registry:block",
  title: "Menubar: sales report menus",
  description: "An example of Menubar: sales report menus.",
  categories: ["menubar"],
  files: [{ path: "src/registry/keyline/examples/menubar-report.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/menubar"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
