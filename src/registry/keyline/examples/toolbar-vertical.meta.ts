import type { KeylineItem } from "../../item";

export default {
  name: "toolbar-vertical",
  type: "registry:block",
  title: "Toolbar: floor plan tools",
  description: "An example of Toolbar: floor plan tools.",
  categories: ["toolbar"],
  files: [{ path: "src/registry/keyline/examples/toolbar-vertical.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/toolbar"],
} satisfies KeylineItem;
