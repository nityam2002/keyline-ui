import type { KeylineItem } from "../../item";

export default {
  name: "progress",
  type: "registry:ui",
  title: "Progress",
  description:
    "Task progress: the pending signal made determinate (yellow fill, ink leading edge), indeterminate, complete and failed states.",
  whenToUse:
    "Use it to show how far a task has got, including failure where it stopped. For a quantity against a limit use Meter; for content still loading use Skeleton.",
  files: [{ path: "src/registry/keyline/ui/progress.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
