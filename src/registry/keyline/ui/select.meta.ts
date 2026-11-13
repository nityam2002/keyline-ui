import type { KeylineItem } from "../../item";

export default {
  name: "select",
  type: "registry:ui",
  title: "Select",
  description:
    "Single select: field-frame trigger with a caret cell; the list docks to the frame. Options form (with groups) or parts named as Base UI names them (SelectRoot, SelectTrigger, SelectValue, SelectPopup, SelectItem, SelectGroup, SelectSeparator …).",
  whenToUse:
    "Use it to choose one option from a list that docks under its field. For long lists to filter by typing use Combobox; on phones and for autofill use Native select.",
  files: [{ path: "src/registry/keyline/ui/select.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/options",
    "@keyline-ui/field",
    "@keyline-ui/keyline-render",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
