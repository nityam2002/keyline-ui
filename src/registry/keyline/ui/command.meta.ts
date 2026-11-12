import type { KeylineItem } from "../../item";

export default {
  name: "command",
  type: "registry:ui",
  title: "Command menu",
  description: "⌘K command menu: digit cells run by index, grouped results, empty state.",
  files: [{ path: "src/registry/keyline/ui/command.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/command.css",
  dependencies: ["@base-ui/react", "cmdk"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/kbd", "@keyline-ui/dialog"],
} satisfies KeylineItem;
