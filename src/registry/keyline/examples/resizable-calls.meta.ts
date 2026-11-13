import type { KeylineItem } from "../../item";

export default {
  name: "resizable-calls",
  type: "registry:block",
  title: "Resizable: call log",
  description: "An example of Resizable: call log.",
  categories: ["resizable"],
  files: [{ path: "src/registry/keyline/examples/resizable-calls.tsx", type: "registry:component" }],
  dependencies: ["lucide-react"],
  registryDependencies: [
    "@keyline-ui/button",
    "@keyline-ui/item",
    "@keyline-ui/keyline",
    "@keyline-ui/panel",
    "@keyline-ui/resizable",
  ],
} satisfies KeylineItem;
