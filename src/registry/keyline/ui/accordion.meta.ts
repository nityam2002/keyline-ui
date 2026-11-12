import type { KeylineItem } from "../../item";

export default {
  name: "accordion",
  type: "registry:ui",
  title: "Accordion",
  description:
    "Stacked sections in one frame: header rows on shared keylines, panels unfold from the header's keyline; one or many open.",
  files: [{ path: "src/registry/keyline/ui/accordion.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/accordion.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils"],
} satisfies KeylineItem;
