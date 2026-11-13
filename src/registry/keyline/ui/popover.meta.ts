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
} satisfies KeylineItem;
