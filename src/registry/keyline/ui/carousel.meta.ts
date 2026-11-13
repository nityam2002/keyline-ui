import type { KeylineItem } from "../../item";

export default {
  name: "carousel",
  type: "registry:ui",
  title: "Carousel",
  description:
    "Slides on Embla, as the reference: a frame of slides on travelling 1px seams with a control row of cells (previous, n / N with position ticks, next). APG carousel without rotation: named region, slides labelled n of N, out-of-view slides inert, arrow keys mirrored in RTL, moves announced politely, instant steps under reduced motion.",
  whenToUse:
    "Use it for a few slides a reader moves through in turn, such as product photos. For content that must all be compared at once use Item or Table.",
  files: [{ path: "src/registry/keyline/ui/carousel.tsx", type: "registry:ui" }],
  dependencies: ["embla-carousel-react", "@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/button",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/keyline-render",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
