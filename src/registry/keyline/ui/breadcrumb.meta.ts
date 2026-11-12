import type { KeylineItem } from "../../item";

export default {
  name: "breadcrumb",
  type: "registry:ui",
  title: "Breadcrumb",
  description:
    "Where a page sits: ancestor link cells and a cobalt cell for here; earlier levels fold into a menu by count or width.",
  files: [{ path: "src/registry/keyline/ui/breadcrumb.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/breadcrumb.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/menu"],
} satisfies KeylineItem;
