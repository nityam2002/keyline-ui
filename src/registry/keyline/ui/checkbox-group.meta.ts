import type { KeylineItem } from "../../item";

export default {
  name: "checkbox-group",
  type: "registry:ui",
  title: "Checkbox group",
  description:
    "Several independent choices to one question in one frame (Base UI CheckboxGroup): an optional parent row that checks or clears all with a count, rows with description and meta, Form participant.",
  whenToUse:
    "Use it for several choices that answer one question, with an All row that counts them. For one yes-or-no choice use Checkbox; for one choice of a few use Radio group.",
  files: [{ path: "src/registry/keyline/ui/checkbox-group.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/checkbox",
    "@keyline-ui/field",
    "@keyline-ui/keyline-render",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
