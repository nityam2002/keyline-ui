import type { KeylineItem } from "../../item";

export default {
  name: "drawer",
  type: "registry:ui",
  title: "Drawer",
  description:
    "A sheet you swipe away, on Base UI Drawer as the reference: swipe with velocity, snap points, nested drawers, focus trap, Escape and the keyboard inset are the library's. Keyline: the page-facing edge at region weight, a grip on it, logical sides (end and start mirror in RTL), the system's motion timings.",
  files: [{ path: "src/registry/keyline/ui/drawer.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/drawer.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/dialog",
  ],
} satisfies KeylineItem;
