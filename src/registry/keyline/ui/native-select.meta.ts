import type { KeylineItem } from "../../item";

export default {
  name: "native-select",
  type: "registry:ui",
  title: "Native select",
  description:
    "The platform's own select in a Keyline field frame: the caret cell drawn over its end, the OS list in the page's scheme, options or groups, a Field participant (name, required, validate, Form errors).",
  files: [{ path: "src/registry/keyline/ui/native-select.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/native-select.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/field"],
} satisfies KeylineItem;
