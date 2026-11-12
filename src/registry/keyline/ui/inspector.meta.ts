import type { KeylineItem } from "../../item";

export default {
  name: "inspector",
  type: "registry:ui",
  title: "Inspector",
  description:
    "Non-modal contextual panel: header with the inspected object's code, key/value cells and a sticky action strip.",
  files: [{ path: "src/registry/keyline/ui/inspector.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render", "@keyline-ui/scroll-area"],
} satisfies KeylineItem;
