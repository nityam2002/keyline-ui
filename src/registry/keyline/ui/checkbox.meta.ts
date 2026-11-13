import type { KeylineItem } from "../../item";

export default {
  name: "checkbox",
  type: "registry:ui",
  title: "Checkbox",
  description: "Square check box and a labelled checkbox row with description; indeterminate supported.",
  files: [{ path: "src/registry/keyline/ui/checkbox.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
