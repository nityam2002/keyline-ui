import type { KeylineItem } from "../../item";

export default {
  name: "command",
  type: "registry:ui",
  title: "Command menu",
  description: "⌘K command menu: digit cells run by index, grouped results, empty state.",
  whenToUse:
    "Use it as a command palette: run commands by name with the keyboard. For commands on a trigger use Menu; for choosing a value in a form use Combobox.",
  files: [{ path: "src/registry/keyline/ui/command.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "cmdk"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/kbd",
    "@keyline-ui/dialog",
    "@keyline-ui/keyline-render",
  ],
} satisfies KeylineItem;
