import type { KeylineItem } from "../../item";

export default {
  name: "drawer",
  type: "registry:ui",
  title: "Drawer",
  description:
    "A sheet you swipe away, on Base UI Drawer as the reference: swipe with velocity, snap points, nested drawers, focus trap, Escape and the keyboard inset are the library's. Keyline: the page-facing edge at region weight, a grip on it, logical sides (end and start mirror in RTL), the system's motion timings.",
  whenToUse:
    "Use it for a panel that slides in from an edge on touch screens and can be dragged away. For a desktop detail panel use Sheet; for a blocking task use Dialog.",
  files: [{ path: "src/registry/keyline/ui/drawer.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "utils",
    "@keyline-ui/keyline-scope",
    "@keyline-ui/keyline-render",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/dialog",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
