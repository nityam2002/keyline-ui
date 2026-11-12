import type { KeylineItem } from "../../item";

export default {
  name: "attachment",
  type: "registry:ui",
  title: "Attachment",
  description:
    'A file as a frame of cells that never change: media, name (the extension stays in view) and detail, one action. Uploading fills the bottom keyline; processing runs the pending segment; error stops the bar in red and floods the media cell with !; an upload that lands floods it yellow with a tick for 900ms. layout="cell" makes it a cell of a Bubble.',
  files: [{ path: "src/registry/keyline/ui/attachment.tsx", type: "registry:ui" }],
  cssFile: "src/registry/keyline/ui/attachment.css",
  dependencies: ["@base-ui/react"],
  registryDependencies: ["@keyline-ui/keyline", "utils"],
} satisfies KeylineItem;
