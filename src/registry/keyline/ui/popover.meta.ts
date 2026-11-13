import type { KeylineItem } from "../../item";

export default {
  name: "popover",
  type: "registry:ui",
  title: "Popover",
  description:
    "Arbitrary content docked to its trigger (or detached by one gutter), with optional header, body and footer cells.",
  whenToUse:
    "Use it for a quick edit or a few settings beside the control that opened it, while the page stays live. For a task the page waits for use Dialog; for a label use Tooltip.",
  files: [{ path: "src/registry/keyline/ui/popover.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-scope", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
