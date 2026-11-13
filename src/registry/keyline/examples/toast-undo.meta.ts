import type { KeylineItem } from "../../item";

export default {
  name: "toast-undo",
  type: "registry:block",
  title: "Toast: archive undo",
  description: "An example of Toast: archive undo.",
  categories: ["toast"],
  files: [{ path: "src/registry/keyline/examples/toast-undo.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/toast"],
} satisfies KeylineItem;
