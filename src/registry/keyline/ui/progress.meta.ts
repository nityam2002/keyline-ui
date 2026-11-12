import type { KeylineItem } from "../../item";

export default {
  name: "progress",
  type: "registry:ui",
  title: "Progress",
  description:
    "Task progress: the pending signal made determinate (yellow fill, ink leading edge), indeterminate, complete and failed states.",
  files: [{ path: "src/registry/keyline/ui/progress.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
} satisfies KeylineItem;
