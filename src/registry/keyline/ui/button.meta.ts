import type { KeylineItem } from "../../item";

export default {
  name: "button",
  type: "registry:ui",
  title: "Button",
  description: "Framed button with affix cells, key travel and pending/done/failed signals.",
  whenToUse:
    "Use it for a command, especially one that takes time and must show pending, done or failed in place. For a setting that stays on use Toggle or Switch; for a main action with alternatives use Split button.",
  files: [{ path: "src/registry/keyline/ui/button.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
