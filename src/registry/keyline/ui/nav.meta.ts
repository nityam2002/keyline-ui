import type { KeylineItem } from "../../item";

export default {
  name: "nav",
  type: "registry:ui",
  title: "Nav",
  description:
    "Vertical (or wrapping) location list; the cobalt band stretches between items. Labelled groups, icon key cells, nested links under a disclosure, row actions (NavAction), a brand identity block and a footer; a rail of key cells with tooltips inside AppShell. With AppShell it is the sidebar (@keyline-ui/sidebar).",
  whenToUse:
    "Use it for an application's sections in a sidebar, with the current one marked. For a website's top navigation use Navigation menu; for views of one place use Tabs.",
  files: [{ path: "src/registry/keyline/ui/nav.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/keyline-render",
    "@keyline-ui/scroll-edges",
    "@keyline-ui/tooltip",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
