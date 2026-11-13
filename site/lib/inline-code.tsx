import * as React from "react";

/** Generated prose (a JSDoc line) marks code with backticks; set it in the Code voice like the written prose. */
export function inlineCode(text: React.ReactNode): React.ReactNode {
  if (typeof text !== "string" || !text.includes("`")) return text;
  return text.split(/`([^`]+)`/).map((t, i) => (i % 2 ? <code key={i}>{t}</code> : t));
}
