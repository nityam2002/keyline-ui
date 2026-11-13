import type { KeylineItem } from "../../item";

export default {
  name: "direction-rtl",
  type: "registry:block",
  title: "Direction: mirrored invoices",
  description: "An example of Direction: mirrored invoices.",
  categories: ["direction"],
  files: [{ path: "src/registry/keyline/examples/direction-rtl.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: [
    "@keyline-ui/breadcrumb",
    "@keyline-ui/button",
    "@keyline-ui/direction",
    "@keyline-ui/keyline",
    "@keyline-ui/pagination",
    "@keyline-ui/segmented",
    "@keyline-ui/tooltip",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
