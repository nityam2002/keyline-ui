import type { KeylineItem } from "../../item";

export default {
  name: "questionnaire-party",
  type: "registry:block",
  title: "Questionnaire: birthday survey",
  description: "An example of Questionnaire: birthday survey.",
  categories: ["questionnaire"],
  files: [{ path: "src/registry/keyline/examples/questionnaire-party.tsx", type: "registry:component" }],
  dependencies: [],
  registryDependencies: [
    "@keyline-ui/button",
    "@keyline-ui/keyline",
    "@keyline-ui/panel",
    "@keyline-ui/questionnaire",
    "@keyline-ui/status",
  ],
} satisfies KeylineItem;
