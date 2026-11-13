import type { KeylineItem } from "../../item";

export default {
  name: "breadcrumb",
  type: "registry:ui",
  title: "Breadcrumb",
  description:
    "Where a page sits: ancestor link cells and a cobalt cell for here; earlier levels fold into a menu by count or width.",
  whenToUse:
    "Use it to show where a page sits in a hierarchy and link to its ancestors. For an app's own sections use Nav; for switching views of one place use Tabs.",
  files: [{ path: "src/registry/keyline/ui/breadcrumb.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/menu"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
