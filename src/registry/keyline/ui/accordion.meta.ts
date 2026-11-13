import type { KeylineItem } from "../../item";

export default {
  name: "accordion",
  type: "registry:ui",
  title: "Accordion",
  description:
    "Stacked sections in one frame: header rows on shared keylines, panels unfold from the header's keyline; one or many open.",
  whenToUse:
    "Use it for several related sections a reader opens one or a few at a time, such as policies or FAQs. For a single disclosure use Collapsible; for views of one place use Tabs.",
  files: [{ path: "src/registry/keyline/ui/accordion.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
