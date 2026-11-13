import type { KeylineItem } from "../../item";

export default {
  name: "app-shell-office",
  type: "registry:block",
  title: "App shell: office shell",
  description: "An example of App shell: office shell.",
  categories: ["app-shell"],
  files: [{ path: "src/registry/keyline/examples/app-shell-office.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: [
    "@keyline-ui/app-shell",
    "@keyline-ui/breadcrumb",
    "@keyline-ui/button",
    "@keyline-ui/inspector",
    "@keyline-ui/item",
    "@keyline-ui/keyline",
    "@keyline-ui/nav",
    "@keyline-ui/status",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
