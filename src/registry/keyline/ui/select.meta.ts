import type { KeylineItem } from "../../item";

export default {
  name: "select",
  type: "registry:ui",
  title: "Select",
  description:
    "Single select: field-frame trigger with a caret cell; the list docks to the frame. Options form (with groups) or parts (SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectSeparator).",
  files: [{ path: "src/registry/keyline/ui/select.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/select.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/options",
    "@keyline-ui/field",
  ],
} satisfies KeylineItem;
