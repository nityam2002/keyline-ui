import type { KeylineItem } from "../../item";

export default {
  name: "button-group-menu",
  type: "registry:block",
  title: "Button group: tracking link",
  description: "An example of Button group: tracking link.",
  categories: ["button-group"],
  files: [{ path: "src/registry/keyline/examples/button-group-menu.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/button-group", "@keyline-ui/keyline", "@keyline-ui/menu"],
} satisfies KeylineItem;
