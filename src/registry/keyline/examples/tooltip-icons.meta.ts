import type { KeylineItem } from "../../item";

export default {
  name: "tooltip-icons",
  type: "registry:block",
  title: "Tooltip: invoice tools",
  description: "An example of Tooltip: invoice tools.",
  categories: ["tooltip"],
  files: [{ path: "src/registry/keyline/examples/tooltip-icons.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/tooltip"],
} satisfies KeylineItem;
