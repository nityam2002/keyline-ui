import type { KeylineItem } from "../../item";

export default {
  name: "nav-sidebar",
  type: "registry:block",
  title: "Nav: office sidebar",
  description: "An example of Nav: office sidebar.",
  categories: ["nav"],
  files: [{ path: "src/registry/keyline/examples/nav-sidebar.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/nav"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
