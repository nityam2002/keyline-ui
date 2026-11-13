import type { KeylineItem } from "../../item";

export default {
  name: "toast-promise",
  type: "registry:block",
  title: "Toast: send report",
  description: "An example of Toast: send report.",
  categories: ["toast"],
  files: [{ path: "src/registry/keyline/examples/toast-promise.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/keyline", "@keyline-ui/toast"],
} satisfies KeylineItem;
