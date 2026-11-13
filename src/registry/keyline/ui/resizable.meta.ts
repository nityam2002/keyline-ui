import type { KeylineItem } from "../../item";

export default {
  name: "resizable",
  type: "registry:ui",
  title: "Resizable",
  description:
    "Panels that share a seam you can move, on react-resizable-panels v4: the 1px seam is the handle, thickening to 3px ink on hover or drag and drawn in the focus colour on keyboard focus; an optional grip cell. Keys, collapse, reset, touch targets and persistence are the library's.",
  whenToUse:
    "Use it for panes that share a seam the reader can move or collapse. Put it in a Panel or an App shell column; for a fixed layout use App shell alone.",
  files: [{ path: "src/registry/keyline/ui/resizable.tsx", type: "registry:ui" }],
  dependencies: ["react-resizable-panels"],
  registryDependencies: ["@keyline-ui/keyline", "utils"],
} satisfies KeylineItem;
