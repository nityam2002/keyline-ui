import type { KeylineItem } from "../../item";

export default {
  name: "select-form",
  type: "registry:block",
  title: "Select: quote form",
  description: "An example of Select: quote form.",
  categories: ["select"],
  files: [{ path: "src/registry/keyline/examples/select-form.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/field", "@keyline-ui/keyline", "@keyline-ui/select"],
} satisfies KeylineItem;
