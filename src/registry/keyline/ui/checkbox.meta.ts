import type { KeylineItem } from "../../item";

export default {
  name: "checkbox",
  type: "registry:ui",
  title: "Checkbox",
  description: "Square check box and a labelled checkbox row with description; indeterminate supported.",
  files: [{ path: "src/registry/keyline/ui/checkbox.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render"],
} satisfies KeylineItem;
