import type { KeylineItem } from "../../item";

export default {
  name: "dialog-new-client",
  type: "registry:block",
  title: "Dialog: new client",
  description: "An example of Dialog: new client.",
  categories: ["dialog"],
  files: [{ path: "src/registry/keyline/examples/dialog-new-client.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/dialog", "@keyline-ui/field", "@keyline-ui/keyline"],
} satisfies KeylineItem;
