import type { KeylineItem } from "../../item";

export default {
  name: "options",
  type: "registry:lib",
  title: "Option and value helpers",
  description:
    "Pure helpers: group options under headings in first-appearance order, and the longest value a numeric scale prints.",
  files: [{ path: "src/registry/keyline/lib/options.ts", type: "registry:lib" }],
} satisfies KeylineItem;
