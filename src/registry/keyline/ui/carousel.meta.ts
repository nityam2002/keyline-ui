import type { KeylineItem } from "../../item";

export default {
  name: "carousel",
  type: "registry:ui",
  title: "Carousel",
  description:
    "Slides on Embla, as the reference: a frame of slides on travelling 1px seams with a control row of cells (previous, n / N with position ticks, next). APG carousel without rotation: named region, slides labelled n of N, out-of-view slides inert, arrow keys mirrored in RTL, moves announced politely, instant steps under reduced motion.",
  files: [{ path: "src/registry/keyline/ui/carousel.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/carousel.css",
  dependencies: ["embla-carousel-react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/button",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/keyline-motion",
  ],
} satisfies KeylineItem;
