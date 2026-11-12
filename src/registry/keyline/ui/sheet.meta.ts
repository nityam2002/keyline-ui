import type { KeylineItem } from "../../item";

export default {
  name: "sheet",
  type: "registry:ui",
  title: "Sheet",
  description:
    "A region docked to a viewport edge (end, start, bottom): Base UI Dialog behaviour, unfolds from its edge, cut on the inner corner.",
  files: [{ path: "src/registry/keyline/ui/sheet.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/keyline-render",
    "@keyline-ui/dialog",
  ],
} satisfies KeylineItem;
