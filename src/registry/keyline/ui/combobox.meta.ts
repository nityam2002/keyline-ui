import type { KeylineItem } from "../../item";

export default {
  name: "combobox",
  type: "registry:ui",
  title: "Combobox",
  description:
    "Single-value combobox: a Select you can type into. Local filtering or an async source (abort, status, retry), optional groups; the list docks to the frame.",
  files: [{ path: "src/registry/keyline/ui/combobox.tsx", type: "registry:ui" }],
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
