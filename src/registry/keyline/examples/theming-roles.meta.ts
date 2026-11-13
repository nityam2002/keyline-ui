import type { KeylineItem } from "../../item";

export default {
  name: "theming-roles",
  type: "registry:block",
  title: "Theming: role cards",
  description: "An example of Theming: role cards.",
  categories: ["guide"],
  files: [{ path: "src/registry/keyline/examples/theming-roles.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline"],
} satisfies KeylineItem;
