import type { KeylineItem } from "../../item";

export default {
  name: "toggle-icon",
  type: "registry:block",
  title: "Toggle: pin client",
  description: "An example of Toggle: pin client.",
  categories: ["toggle"],
  files: [{ path: "src/registry/keyline/examples/toggle-icon.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/toggle"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
