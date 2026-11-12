import type { KeylineItem } from "../../item";

export default {
  name: "popover",
  type: "registry:ui",
  title: "Popover",
  description:
    "Arbitrary content docked to its trigger (or detached by one gutter), with optional header, body and footer cells.",
  files: [{ path: "src/registry/keyline/ui/popover.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-scope", "@keyline-ui/keyline-render"],
} satisfies KeylineItem;
