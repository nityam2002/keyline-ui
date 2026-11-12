import type { KeylineItem } from "../../item";

export default {
  name: "dialog",
  type: "registry:ui",
  title: "Dialog",
  description:
    "Dialog (header, scrolling body, footer cells) and AlertDialog (an attention cell; focus lands on the safe action): region-framed modals on Base UI. Also installable as @keyline-ui/alert-dialog.",
  files: [{ path: "src/registry/keyline/ui/dialog.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/scroll-area",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/keyline-render",
  ],
} satisfies KeylineItem;
