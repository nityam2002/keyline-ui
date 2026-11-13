import type { KeylineItem } from "../../item";

export default {
  name: "switch",
  type: "registry:ui",
  title: "Switch",
  description: "Binary setting: a two-cell frame whose block stretches to the on side.",
  whenToUse:
    "Use it for a setting that takes effect the moment it changes. In a form that waits for Save use Checkbox.",
  files: [{ path: "src/registry/keyline/ui/switch.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/checkbox", "@keyline-ui/keyline-render"],
} satisfies KeylineItem;
