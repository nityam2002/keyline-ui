import type { KeylineItem } from "../../item";

export default {
  name: "panel",
  type: "registry:ui",
  title: "Panel",
  description:
    "Region frame with header, body and footer cells; PanelGrid joins panels into one frame with shared keylines.",
  whenToUse:
    "Use it to frame one region of a screen with a header, body and footer of actions. For a whole application frame use App shell; for a record beside a list use Inspector.",
  files: [{ path: "src/registry/keyline/ui/panel.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
