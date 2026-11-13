import type { KeylineItem } from "../../item";

export default {
  name: "toolbar-editor",
  type: "registry:block",
  title: "Toolbar: memo editor",
  description: "An example of Toolbar: memo editor.",
  categories: ["toolbar"],
  files: [{ path: "src/registry/keyline/examples/toolbar-editor.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/menu", "@keyline-ui/toolbar", "@keyline-ui/tooltip"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
