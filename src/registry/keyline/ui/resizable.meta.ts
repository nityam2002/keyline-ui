import type { KeylineItem } from "../../item";

export default {
  name: "resizable",
  type: "registry:ui",
  title: "Resizable",
  description:
    "Panels that share a seam you can move, on react-resizable-panels v4: the 1px seam is the handle, thickening to 3px ink on hover or drag and drawn in the focus colour on keyboard focus; an optional grip cell. Keys, collapse, reset, touch targets and persistence are the library's.",
  files: [{ path: "src/registry/keyline/ui/resizable.tsx", type: "registry:ui" }],
  dependencies: ["react-resizable-panels"],
  registryDependencies: ["@keyline-ui/keyline", "utils"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
