import type { KeylineItem } from "../../item";

export default {
  name: "native-select",
  type: "registry:ui",
  title: "Native select",
  description:
    "The platform's own select in a Keyline field frame: the caret cell drawn over its end, the OS list in the page's scheme, options or groups, a Field participant (name, required, validate, Form errors).",
  whenToUse:
    "Use it in long forms on phones and for fields the browser can autofill; the open list is the system's. For a styled list that docks to its field use Select.",
  files: [{ path: "src/registry/keyline/ui/native-select.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/field"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
