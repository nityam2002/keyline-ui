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
} satisfies KeylineItem;
