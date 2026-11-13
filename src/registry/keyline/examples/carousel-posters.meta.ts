import type { KeylineItem } from "../../item";

export default {
  name: "carousel-posters",
  type: "registry:block",
  title: "Carousel: employee of the month",
  description: "An example of Carousel: employee of the month.",
  categories: ["carousel"],
  files: [{ path: "src/registry/keyline/examples/carousel-posters.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/carousel", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
