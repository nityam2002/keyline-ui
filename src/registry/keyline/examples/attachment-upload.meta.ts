import type { KeylineItem } from "../../item";

export default {
  name: "attachment-upload",
  type: "registry:block",
  title: "Attachment: invoice uploads",
  description: "An example of Attachment: invoice uploads.",
  categories: ["attachment"],
  files: [{ path: "src/registry/keyline/examples/attachment-upload.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: ["@keyline-ui/attachment", "@keyline-ui/button", "@keyline-ui/keyline"],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
