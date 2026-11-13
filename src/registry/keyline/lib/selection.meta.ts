import type { KeylineItem } from "../../item";

export default {
  name: "selection",
  type: "registry:lib",
  title: "Selection scope",
  description:
    "Pure helpers and a hook for page / all-matching selection with hidden-row accounting, plus snapshot-based undo.",
  files: [{ path: "src/registry/keyline/lib/selection.ts", type: "registry:lib" }],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
