import type { KeylineItem } from "../../item";

export default {
  name: "scroll-area",
  type: "registry:ui",
  title: "Scroll Area",
  description:
    "A native scroll container with Keyline scrollbars (Base UI Scroll Area): a bar is a cell on the region's edge, owning its seam; content is padded only while an axis overflows; corner cell for both bars; focusable viewport with an inset ring. The thumb reveals while its axis scrolls and when the pointer is on the bar, widens and darkens there, inks while held, then fades (overlay platforms; always shown where native bars take space, in forced colours and for more contrast).",
  docs: 'Size the root (height or max-height) with your own class: <ScrollArea className="h-64" label="Activity">…</ScrollArea>. scrollbars="vertical" (default), "horizontal" or "both". Scrolling stays native (wheel, trackpad, touch, keyboard). Give label when nothing else names the region; the viewport is focusable while it overflows. Do not wrap Select or Multiselect lists in it: they keep their own native scroller, styled to match.',
  files: [{ path: "src/registry/keyline/ui/scroll-area.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/scroll-area.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils", "@keyline-ui/keyline-scope"],
} satisfies KeylineItem;
