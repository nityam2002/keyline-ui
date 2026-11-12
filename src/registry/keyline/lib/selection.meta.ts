import type { KeylineItem } from "../../item";

export default {
  name: "selection",
  type: "registry:lib",
  title: "Selection scope",
  description:
    "Pure helpers and a hook for page / all-matching selection with hidden-row accounting, plus snapshot-based undo.",
  files: [{ path: "src/registry/keyline/lib/selection.ts", type: "registry:lib" }],
} satisfies KeylineItem;
