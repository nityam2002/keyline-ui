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
    "@keyline-ui/keyline-motion",
  ],
  version: "1.0.1",
  updated: "2026-11-13",
  changelog: [
    {
      version: "1.0.1",
      date: "2026-11-13",
      note: "A result that keeps the menu open no longer stays flooded: the yellow flood marks the run, then lets go.",
    },
    { version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." },
  ],
} satisfies KeylineItem;
