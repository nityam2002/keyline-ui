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
} satisfies KeylineItem;
