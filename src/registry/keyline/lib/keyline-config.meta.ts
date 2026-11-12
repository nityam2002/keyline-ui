import type { KeylineItem } from "../../item";

export default {
  name: "keyline-config",
  type: "registry:lib",
  title: "Keyline configuration",
  description:
    "The configuration contract as data: palette presets, fonts, weights, cut, density, theme, motion. Generates the CSS, attributes and registry item a configuration needs, and a runtime KeylineConfigScope.",
  files: [{ path: "src/registry/keyline/lib/keyline-config.ts", type: "registry:lib" }],
  registryDependencies: ["@keyline-ui/keyline"],
} satisfies KeylineItem;
