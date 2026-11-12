import type { KeylineItem } from "../../item";

export default {
  name: "keyline-shadcn",
  type: "registry:theme",
  title: "Keyline for the whole app (opt-in)",
  description:
    "Maps shadcn's semantic tokens, radius, fonts, focus ring and page body to Keyline, so stock shadcn components take Keyline's look. Not needed to use Keyline components.",
  files: [],
  cssFile: "src/registry/keyline/theme/keyline-shadcn.css",
  theme: true,
  registryDependencies: ["@keyline-ui/keyline"],
  requires: {
    // it maps shadcn's tokens onto the theme's
    registryDependencies: ["@keyline-ui/keyline"],
  },
} satisfies KeylineItem;
