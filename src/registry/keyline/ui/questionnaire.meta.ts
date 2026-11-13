import type { KeylineItem } from "../../item";

export default {
  name: "questionnaire",
  type: "registry:ui",
  title: "Questionnaire",
  description:
    "A multi-step form on @shadcn/react's Questionnaire, as the reference: single choice (the radio group's rows and ink band), multiple choice (checkbox rows), free text (the field frame), required and optional steps, Back, Skip, Next and Submit as Button cells, answers kept when going back, errors described on the current step, focus on the new step's heading, Progress for the step.",
  whenToUse:
    "Use it for a form asked one question at a time, with progress, skipping and going back. For a form shown all at once use Field and Form.",
  files: [{ path: "src/registry/keyline/ui/questionnaire.tsx", type: "registry:ui" }],
  dependencies: ["@base-ui/react", "@shadcn/react"],
  registryDependencies: [
    "@keyline-ui/keyline",
    "@keyline-ui/radio-group",
    "@keyline-ui/checkbox",
    "utils",
    "@keyline-ui/keyline-render",
    "@keyline-ui/keyline-motion",
    "@keyline-ui/button",
    "@keyline-ui/field",
    "@keyline-ui/progress",
  ],
  version: "1.0.0",
  updated: "2026-11-13",
  changelog: [{ version: "1.0.0", date: "2026-11-13", note: "First release: the 1.0.0 baseline." }],
} satisfies KeylineItem;
