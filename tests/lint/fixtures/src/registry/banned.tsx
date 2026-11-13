// Holds each idiom keyline/no-radix-idioms bans, one per line; tests/lint/radix-idioms.test.ts expects one
// diagnostic for each. The path mirrors src/registry/ so the rule's override applies.
import { Slot } from "radix-ui";

export const state = "data-[state=open]:opacity-100";
export const variable = "w-(--radix-popover-trigger-width)";
export const tone = "bg-white dark:bg-black";
export const toneTemplate = `px-2 dark:text-white`;

export function Composed() {
  return <Slot asChild />;
}
