import type { KeylineItem } from "../../item";

export default {
  name: "navigation-menu-site",
  type: "registry:block",
  title: "Navigation menu: paper site nav",
  description: "An example of Navigation menu: paper site nav.",
  categories: ["navigation-menu"],
  files: [{ path: "src/registry/keyline/examples/navigation-menu-site.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/navigation-menu"],
} satisfies KeylineItem;
