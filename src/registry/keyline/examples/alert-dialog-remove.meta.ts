import type { KeylineItem } from "../../item";

export default {
  name: "alert-dialog-remove",
  type: "registry:block",
  title: "Alert dialog: remove client",
  description: "An example of Alert dialog: remove client.",
  categories: ["alert-dialog"],
  files: [{ path: "src/registry/keyline/examples/alert-dialog-remove.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/dialog", "@keyline-ui/keyline"],
} satisfies KeylineItem;
