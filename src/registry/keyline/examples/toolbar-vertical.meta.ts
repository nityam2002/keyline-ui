import type { KeylineItem } from "../../item";

export default {
  name: "toolbar-vertical",
  type: "registry:block",
  title: "Toolbar: floor plan tools",
  description: "An example of Toolbar: floor plan tools.",
  categories: ["toolbar"],
  files: [{ path: "src/registry/keyline/examples/toolbar-vertical.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/toolbar"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
