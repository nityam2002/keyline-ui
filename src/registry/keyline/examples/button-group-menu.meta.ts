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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
