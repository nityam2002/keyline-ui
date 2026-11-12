import type { KeylineItem } from "../../item";

export default {
  name: "notice",
  type: "registry:ui",
  title: "Notice",
  description:
    "Inline message: a tone cell with a glyph, the message, and action cells; folds away; narrow layout drops actions to their own row.",
  files: [{ path: "src/registry/keyline/ui/notice.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/notice.css",
  registryDependencies: ["@keyline-ui/keyline", "utils"],
} satisfies KeylineItem;
