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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
