import type { KeylineItem } from "../../item";

export default {
  name: "radio-group",
  type: "registry:ui",
  title: "Radio group",
  description: "Exclusive choice as framed rows; the ink band stretches to the chosen row.",
  files: [{ path: "src/registry/keyline/ui/radio-group.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/checkbox",
    "@keyline-ui/keyline-render",
    "@keyline-ui/keyline-scope",
  ],
} satisfies KeylineItem;
