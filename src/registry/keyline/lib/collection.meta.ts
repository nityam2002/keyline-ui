import type { KeylineItem } from "../../item";

export default {
  name: "collection",
  type: "registry:lib",
  title: "Collection helpers",
  description:
    "Pure helpers: the sort cycle of a column header, a numeric-aware locale comparator, and the constant-width window of page numbers.",
  files: [{ path: "src/registry/keyline/lib/collection.ts", type: "registry:lib" }],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
