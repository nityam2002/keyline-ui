import type { KeylineItem } from "../../item";

export default {
  name: "toggle",
  type: "registry:ui",
  title: "Toggle",
  description:
    "One on/off button (Base UI Toggle, aria-pressed): pressed floods yellow and fills the lamp; icon toggles show a floor keyline. Control or cell, alone or as a cell of a field frame. ToggleGroup composes its cells.",
  whenToUse:
    "Use it for a button that stays pressed, such as Bold or Pin. For a setting in a form use Switch or Checkbox; for a command use Button.",
  files: [{ path: "src/registry/keyline/ui/toggle.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "class-variance-authority"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-motion", "@keyline-ui/keyline-render"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
