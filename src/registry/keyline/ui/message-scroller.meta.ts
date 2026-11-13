import type { KeylineItem } from "../../item";

export default {
  name: "message-scroller",
  type: "registry:ui",
  title: "Message scroller",
  description:
    "A conversation log on @shadcn/react's MessageScroller, as the reference: stays on the newest message, holds the reader's place when scrolled up, keeps position when older messages are prepended; role=log inside a focusable region. Keyline adds: the place also holds when content above changes size (in every engine), arrivals unfold from their top keyline while the reader follows, and a Latest cell that counts what arrived below and jumps a bounded, interruptible distance. The log scrolls inside Keyline's Scroll Area, so its bar is the shared one; the jump reveals it, and pressing it is the reader taking over.",
  files: [{ path: "src/registry/keyline/ui/message-scroller.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "@shadcn/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-render",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/scroll-area",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
