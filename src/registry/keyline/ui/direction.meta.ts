import type { KeylineItem } from "../../item";

export default {
  name: "direction",
  type: "registry:ui",
  title: "Direction",
  description:
    "DirectionProvider: sets a subtree's writing direction for both the DOM (Keyline's CSS and DOM-reading components) and Base UI (the sides tooltips, popovers and menus take; arrow keys). useDirection reads it.",
  whenToUse:
    "Use it to set right-to-left or left-to-right on a subtree so layout, glyphs, popups and arrow keys all follow. It draws nothing.",
  files: [{ path: "src/registry/keyline/ui/direction.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/keyline-render"],
} satisfies KeylineItem;
