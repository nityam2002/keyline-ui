import type { KeylineItem } from "../../item";

export default {
  name: "combobox",
  type: "registry:ui",
  title: "Combobox",
  description:
    "Single-value combobox: a Select you can type into. Local filtering or an async source (abort, status, retry), optional groups; the list docks to the frame.",
  whenToUse:
    "Use it to choose one option from a long list by typing to filter. For a short list use Select; for several values use Multiselect.",
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
} satisfies KeylineItem;
