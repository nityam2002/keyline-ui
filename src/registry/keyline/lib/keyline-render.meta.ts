import type { KeylineItem } from "../../item";

export default {
  name: "keyline-render",
  type: "registry:lib",
  title: "Keyline render helpers",
  description:
    "Merge Keyline's classes and styles with a className or style given as a function of state, and mirror variant props to data attributes.",
  files: [{ path: "src/registry/keyline/lib/keyline-render.ts", type: "registry:lib" }],
  dependencies: ["@base-ui/react"],
  registryDependencies: ["utils"],
} satisfies KeylineItem;
