import type { KeylineItem } from "../../item";

export default {
  name: "app-shell",
  type: "registry:ui",
  title: "App shell",
  description:
    "Header frame (navigation toggle, breadcrumb, actions), a sidebar, the page and an aside, one gutter apart; the sidebar is a full-height column that can collapse to a rail; below a width of its own the sidebar and aside become sheets.",
  files: [{ path: "src/registry/keyline/ui/app-shell.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/app-shell.css",
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/nav", "@keyline-ui/sheet"],
} satisfies KeylineItem;
