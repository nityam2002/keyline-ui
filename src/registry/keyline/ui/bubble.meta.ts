import type { KeylineItem } from "../../item";

export default {
  name: "bubble",
  type: "registry:ui",
  title: "Bubble",
  description:
    'One message as a control-weight frame (2px, no radius) holding cells: the text, then files (Attachment layout="cell"). Consecutive bubbles attach on a 1px seam. Tone by role: plain (theirs), tint (yours), attention (not sent: the attention frame and an inserted ! cell). pending runs the Signal segment on the bottom keyline while it sends. Reactions sit on the bottom keyline.',
  files: [{ path: "src/registry/keyline/ui/bubble.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
