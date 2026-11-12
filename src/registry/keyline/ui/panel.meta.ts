import type { KeylineItem } from "../../item";

export default {
  name: "panel",
  type: "registry:ui",
  title: "Panel",
  description:
    "Region frame with header, body and footer cells; PanelGrid joins panels into one frame with shared keylines.",
  files: [{ path: "src/registry/keyline/ui/panel.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render"],
} satisfies KeylineItem;
