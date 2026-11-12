import type { KeylineItem } from "../../item";

export default {
  name: "marker",
  type: "registry:ui",
  title: "Marker",
  description:
    "A step in a conversation or activity timeline in the Code voice: a glyph cell and words, a separator between seams, or a keyline under the words; pending runs the pending segment and is a polite status.",
  files: [{ path: "src/registry/keyline/ui/marker.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
} satisfies KeylineItem;
