import type { KeylineItem } from "../../item";

export default {
  name: "notice",
  type: "registry:ui",
  title: "Notice",
  description:
    "Inline message: a tone cell with a glyph, the message, and action cells; folds away; narrow layout drops actions to their own row.",
  whenToUse:
    "Use it for an inline message about something that is still true where it sits, such as a warning on a form. For something that just happened use Toast.",
  files: [{ path: "src/registry/keyline/ui/notice.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
