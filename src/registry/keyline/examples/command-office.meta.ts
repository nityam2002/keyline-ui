import type { KeylineItem } from "../../item";

export default {
  name: "command-office",
  type: "registry:block",
  title: "Command menu: office commands",
  description: "An example of Command menu: office commands.",
  categories: ["command"],
  files: [{ path: "src/registry/keyline/examples/command-office.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/button", "@keyline-ui/command", "@keyline-ui/kbd", "@keyline-ui/keyline"],
} satisfies KeylineItem;
