import type { KeylineItem } from "../../item";

export default {
  name: "slider",
  type: "registry:ui",
  title: "Slider",
  description:
    "A continuous or stepped value (or a range) in one control frame: the Meter's rail with an ink fill, a 2px thumb with a grip keyline, and a readout cell sized for the longest value.",
  files: [{ path: "src/registry/keyline/ui/slider.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-render",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/options",
    "@keyline-ui/field",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
