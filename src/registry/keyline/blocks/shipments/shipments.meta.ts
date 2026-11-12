import type { KeylineItem } from "../../../item";

export default {
  name: "shipments-demo",
  type: "registry:block",
  title: "Shipments (demo block)",
  description:
    "A working application composition: filterable, selectable table with expanded detail, inspector, bulk actions with undo.",
  files: [
    { path: "src/registry/keyline/blocks/shipments/shipments.tsx", type: "registry:component" },
    { path: "src/registry/keyline/blocks/shipments/shipments-data.ts", type: "registry:lib" },
  ],
  cssFile: "src/registry/keyline/blocks/shipments/shipments.css",
  registryDependencies: [
    "@keyline-ui/keyline",
    "@keyline-ui/button",
    "@keyline-ui/menu",
    "@keyline-ui/toolbar",
    "@keyline-ui/field",
    "@keyline-ui/multiselect",
    "@keyline-ui/date-range",
    "@keyline-ui/table",
    "@keyline-ui/status",
    "@keyline-ui/kbd",
    "@keyline-ui/nav",
    "@keyline-ui/app-shell",
    "@keyline-ui/breadcrumb",
    "@keyline-ui/notice",
    "@keyline-ui/dialog",
    "@keyline-ui/inspector",
    "@keyline-ui/command",
    "@keyline-ui/toast",
    "@keyline-ui/selection",
  ],
} satisfies KeylineItem;
