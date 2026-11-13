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
} satisfies KeylineItem;
