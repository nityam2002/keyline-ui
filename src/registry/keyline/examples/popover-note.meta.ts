import type { KeylineItem } from "../../item";

export default {
  name: "popover-note",
  type: "registry:block",
  title: "Popover: delivery note",
  description: "An example of Popover: delivery note.",
  categories: ["popover"],
  files: [{ path: "src/registry/keyline/examples/popover-note.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/field", "@keyline-ui/keyline", "@keyline-ui/popover"],
} satisfies KeylineItem;
