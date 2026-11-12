import type { KeylineItem } from "../../item";

export default {
  name: "collection",
  type: "registry:lib",
  title: "Collection helpers",
  description:
    "Pure helpers: the sort cycle of a column header, a numeric-aware locale comparator, and the constant-width window of page numbers.",
  files: [{ path: "src/registry/keyline/lib/collection.ts", type: "registry:lib" }],
} satisfies KeylineItem;
