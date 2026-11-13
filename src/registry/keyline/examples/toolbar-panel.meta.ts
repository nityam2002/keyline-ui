import type { KeylineItem } from "../../item";

export default {
  name: "toolbar-panel",
  type: "registry:block",
  title: "Toolbar: orders panel",
  description: "An example of Toolbar: orders panel.",
  categories: ["toolbar"],
  files: [{ path: "src/registry/keyline/examples/toolbar-panel.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/menu", "@keyline-ui/panel", "@keyline-ui/toolbar"],
} satisfies KeylineItem;
