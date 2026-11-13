import type { KeylineItem } from "../../item";

export default {
  name: "slider",
  type: "registry:ui",
  title: "Slider",
  description:
    "A continuous or stepped value (or a range) in one control frame: the Meter's rail with an ink fill, a 2px thumb with a grip keyline, and a readout cell sized for the longest value.",
  whenToUse:
    "Use it for a value or range on a scale chosen by dragging, with a readout. For an exact number typed in use Number field.",
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
} satisfies KeylineItem;
