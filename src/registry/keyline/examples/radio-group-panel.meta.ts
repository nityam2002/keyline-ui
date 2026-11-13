import type { KeylineItem } from "../../item";

export default {
  name: "radio-group-panel",
  type: "registry:block",
  title: "Radio group: paper weight",
  description: "An example of Radio group: paper weight.",
  categories: ["radio-group"],
  files: [{ path: "src/registry/keyline/examples/radio-group-panel.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/panel", "@keyline-ui/radio-group"],
} satisfies KeylineItem;
