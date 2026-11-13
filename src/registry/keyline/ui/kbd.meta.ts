import type { KeylineItem } from "../../item";

export default {
  name: "kbd",
  type: "registry:ui",
  title: "Kbd",
  description:
    "A key in the Code voice: a key cell with a 2px floor; KbdGroup joins a chord's keys on seams (nested kbd), with the separator read, not drawn. Used by Command.",
  whenToUse: "Use it to show a key or a key combination in text, in a tooltip or beside a command. It is not a button.",
  files: [{ path: "src/registry/keyline/ui/kbd.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render", "utils"],
} satisfies KeylineItem;
