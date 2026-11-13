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
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
