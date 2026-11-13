import type { KeylineItem } from "../../item";

export default {
  name: "toolbar-panel",
  type: "registry:block",
  title: "Toolbar: orders panel",
  description: "An example of Toolbar: orders panel.",
  categories: ["toolbar"],
  files: [{ path: "src/registry/keyline/examples/toolbar-panel.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/menu", "@keyline-ui/panel", "@keyline-ui/toolbar"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
