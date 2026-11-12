import type { KeylineItem } from "../../item";

export default {
  name: "accordion",
  type: "registry:ui",
  title: "Accordion",
  description:
    "Stacked sections in one frame: header rows on shared keylines, panels unfold from the header's keyline; one or many open.",
  files: [{ path: "src/registry/keyline/ui/accordion.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render"],
} satisfies KeylineItem;
