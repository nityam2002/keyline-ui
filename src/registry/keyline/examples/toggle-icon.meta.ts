import type { KeylineItem } from "../../item";

export default {
  name: "toggle-icon",
  type: "registry:block",
  title: "Toggle: pin client",
  description: "An example of Toggle: pin client.",
  categories: ["toggle"],
  files: [{ path: "src/registry/keyline/examples/toggle-icon.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/toggle"],
} satisfies KeylineItem;
