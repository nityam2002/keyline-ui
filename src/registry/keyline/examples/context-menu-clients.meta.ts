import type { KeylineItem } from "../../item";

export default {
  name: "context-menu-clients",
  type: "registry:block",
  title: "Context menu: client list",
  description: "An example of Context menu: client list.",
  categories: ["context-menu"],
  files: [{ path: "src/registry/keyline/examples/context-menu-clients.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/context-menu", "@keyline-ui/keyline"],
} satisfies KeylineItem;
