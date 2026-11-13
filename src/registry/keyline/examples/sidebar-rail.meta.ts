import type { KeylineItem } from "../../item";

export default {
  name: "sidebar-rail",
  type: "registry:block",
  title: "Sidebar (AppShell + Nav): rail sidebar",
  description: "An example of Sidebar (AppShell + Nav): rail sidebar.",
  categories: ["sidebar"],
  files: [{ path: "src/registry/keyline/examples/sidebar-rail.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/app-shell", "@keyline-ui/breadcrumb", "@keyline-ui/keyline", "@keyline-ui/nav"],
} satisfies KeylineItem;
