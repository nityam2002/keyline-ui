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
} satisfies KeylineItem;
