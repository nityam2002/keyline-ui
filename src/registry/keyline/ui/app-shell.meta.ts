import type { KeylineItem } from "../../item";

export default {
  name: "app-shell",
  type: "registry:ui",
  title: "App shell",
  description:
    "Header frame (navigation toggle, breadcrumb, actions), a sidebar, the page and an aside, one gutter apart; the sidebar is a full-height column that can collapse to a rail; below a width of its own the sidebar and aside become sheets.",
  files: [{ path: "src/registry/keyline/ui/app-shell.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-render",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/nav",
    "@keyline-ui/sheet",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
