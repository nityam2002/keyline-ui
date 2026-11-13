import type { KeylineItem } from "../../item";

export default {
  name: "pagination",
  type: "registry:ui",
  title: "Pagination",
  description:
    'Page numbers as cells with a cobalt current page; constant width while paging; folds to "5 / 20" when narrow; buttons or links.',
  whenToUse:
    "Use it to move between pages of a long list or table. For tables with paging worked out for you use Data table.",
  files: [{ path: "src/registry/keyline/ui/pagination.tsx", type: "registry:ui" }],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/collection"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
