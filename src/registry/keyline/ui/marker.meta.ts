import type { KeylineItem } from "../../item";

export default {
  name: "marker",
  type: "registry:ui",
  title: "Marker",
  description:
    "A step in a conversation or activity timeline in the Code voice: a glyph cell and words, a separator between seams, or a keyline under the words; pending runs the pending segment and is a polite status.",
  whenToUse:
    "Use it for a step in an activity timeline, a divider between days or messages, or work still in progress. For a state label use Status.",
  files: [{ path: "src/registry/keyline/ui/marker.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
