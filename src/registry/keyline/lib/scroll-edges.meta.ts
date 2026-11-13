import type { KeylineItem } from "../../item";

export default {
  name: "scroll-edges",
  type: "registry:lib",
  title: "Scroll edges",
  description:
    "Marks the edge of a sideways-scrolling cell row where items are hidden (data-kl-more); the theme casts an ink shadow inward from that edge.",
  files: [{ path: "src/registry/keyline/lib/scroll-edges.ts", type: "registry:lib" }],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
