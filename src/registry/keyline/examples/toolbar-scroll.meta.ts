import type { KeylineItem } from "../../item";

export default {
  name: "toolbar-scroll",
  type: "registry:block",
  title: "Toolbar: order commands",
  description: "An example of Toolbar: order commands.",
  categories: ["toolbar"],
  files: [{ path: "src/registry/keyline/examples/toolbar-scroll.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/toolbar"],
} satisfies KeylineItem;
