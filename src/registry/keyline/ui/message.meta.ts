import type { KeylineItem } from "../../item";

export default {
  name: "message",
  type: "registry:ui",
  title: "Message",
  description:
    "A sender's run in a conversation, on one reading edge: the header (name, time), every bubble's text, the file glyphs and the receipt start on the same line. Consecutive bubbles stack on shared keylines; the avatar sits in the gutter level with the first bubble. align=\"end\" is the reader's own run, at the end of the log, mirrored with the writing direction.",
  files: [{ path: "src/registry/keyline/ui/message.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render"],
} satisfies KeylineItem;
