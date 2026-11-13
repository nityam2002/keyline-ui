import type { KeylineItem } from "../../item";

export default {
  name: "toolbar-overflow",
  type: "registry:lib",
  title: "Toolbar overflow",
  description:
    "Pure logic behind Toolbar's overflow menu: items identified by data-slot, which leave for a given count, where More goes, and one step of the fit (with its sub-pixel rule).",
  files: [{ path: "src/registry/keyline/lib/toolbar-overflow.ts", type: "registry:lib" }],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
