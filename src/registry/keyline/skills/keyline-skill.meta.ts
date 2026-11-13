import type { KeylineItem } from "../../item";

// The agent skill (skills/keyline/SKILL.md): how to add and compose Keyline items, and the upgrade procedure.
// Installed into the project's .claude/skills with `npx shadcn@latest add @keyline-ui/keyline-skill`.
export default {
  name: "keyline-skill",
  type: "registry:file",
  title: "Keyline agent skill",
  description:
    "An agent skill for coding assistants: add Keyline items, compose them, and upgrade installed items from the changelog.",
  files: [{ path: "skills/keyline/SKILL.md", type: "registry:file", target: ".claude/skills/keyline/SKILL.md" }],
} satisfies KeylineItem;
