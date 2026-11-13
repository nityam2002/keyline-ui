import type { KeylineItem } from "../../item";

export default {
  name: "tooltip-icons",
  type: "registry:block",
  title: "Tooltip: invoice tools",
  description: "An example of Tooltip: invoice tools.",
  categories: ["tooltip"],
  files: [{ path: "src/registry/keyline/examples/tooltip-icons.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/tooltip"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
